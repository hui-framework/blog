---
title: hui-plugin-lint 插件开发
date: 2020-7-2
tags:
  - 插件
author: Nowitzki41
featuredimg: '/assets/img/eslint-stylelint.png'
summary: 插件开发方案落地以及方案实现的一些总结
---

### 方案设计

[`eslint`](https://eslint.bootcss.com/)  [`stylelint`](https://stylelint.io/) 可以用来规范团队成员代码风格，方便维护代码，减少不必要的错误，是团队开发中非常重要的一项功能。一般情况下是公司出一套标准的配置文件，开发人员开启编辑器的 `eslint stylelint` 相关的插件来实现代码静态检查。后续我们也会考虑在开发 `vscode` 插件的方向上去集成公司统一的 `lint` 规范。

此次需求是要求在 `hui cli` 脚手架里集成 `eslint style` 功能，我的第一反应是在脚手架增加一条 `lint` 命令，在这个命令中通过 `shelljs` 执行 `eslint stylelint` 命令。这个方案在第一次功能演示时候被否定了。原因有两点：首先，直接在脚手架核心里增加命令以及依赖，会造成脚手架越来越臃肿。其次，这个方案的实现还是需要用户在项目里手动添加配置文件。违背了脚手架的开箱即用的初衷。

基于以上两点我们对方案进行了改进，在插件中注册 `lint` 命令，插件是可插拔的，只有配置了该插件选项，项目中才会集成该命令以及相关依赖。插件中通过调用 `eslint stylelint api` 实现代码静态检查，并在 `api` 调用时添加默认配置项，无需开发人员手动添加配置文件。 

### 开发实现

首先在插件中注册一条 `lint` 命令，这条命令有四个配置项。

##### --es

执行 eslint 校验

```sh
$ hui lint --es
```

##### --style

执行 stylelint 校验

```sh
$ hui lint --style
```

##### --lint-files

配置项可以指定目标文件，对与 glob 模式匹配的文件进行校验。

示例：

```sh
$ hui lint --es --lint-files "src/components/**/*.{vue,js,jsx}"

$ hui lint --style --lint-files "src/components/**/*.{vue,less,postcss,css,scss}"
```

##### --fix

配置项可以设置自动修复违反特定规则的行为
示例：

```sh
$ hui lint --es --lint-files "src/components/**/*.{vue,js,jsx}" --fix

$ hui lint --style --lint-files "src/components/**/*.{vue,less,postcss,css,scss}" --fix
```
具体实现如下：
注册命令

```js
function huiPluginLint(api, options = {}) {
  api.registerCommand(
    'lint',
    {
      description: '代码校验, 支持 eslint, stylelint 校验规则',
      usage: 'hui lint',
      options: [
        {
          name: '--es',
          description: '执行 eslint 校验',
          value: false,
        },
        {
          name: '--style',
          description: '执行 stylelint 校验',
          value: false,
        },
        {
          name: '--fix',
          description: '自动修复违反特定规则的行为',
          value: false,
        },
        {
          name: '--lint-files <lintFiles>',
          description: '指定目标文件, 支持 glob 模式',
        },
      ],
    },
    async (args) => {
      const { es, style, lintFiles, fix } = args;
      // 检查 stylelintrc 是否存在
      let existStylelintrc = pathExistsSync('.stylelintrc.js');
      if (es && !style) {
        eslintFormat(lintFiles, fix);
      } else if (!es && style) {
        stylelintFormat(existStylelintrc, lintFiles, fix);
      } else {
        try {
          await eslintFormat(lintFiles, fix);
        } catch (error) {
          process.exitCode = 1;
          spinner(error).warn();
        }
        stylelintFormat(existStylelintrc, lintFiles, fix);
      }
    },
  );
}
```
 调用 `eslint api`

```js
import { ESLint } from 'eslint';

function eslintFormat(lintFiles, fix) {
  return (async function main() {
    spinner(`开始执行 eslint 校验\n`).info();
    let options = {
      baseConfig: {
        extends: [require.resolve('@toolkit-js/iconfig/lib/eslintrc-hs')],
        rules: {},
      },
    };
    // 如果开启自动修复
    if (fix) {
      options.fix = true;
    }
    const eslint = new ESLint(options);
    // Lint files. glob 模式指定目标文件
    const results = await eslint.lintFiles([
      lintFiles === undefined ? 'src/**/*.{vue,js,jsx}' : lintFiles,
    ]);
    // 等待 eslint 修复错误
    await ESLint.outputFixes(results);

    // Format the results. 使用内置格式化程序
    const formatter = await eslint.loadFormatter('table');
    const resultText = formatter.format(results);
    // 打印结果
    console.log(resultText);
    spinner(`eslint 校验结束\n`).info();
  })();
}
```
调用 `stylelint api`

```js
import { lint } from 'stylelint';

function stylelintFormat(existStylelintrc, lintFiles, fix) {
  spinner(`开始执行 stylelint 校验\n`).info();
  let options = {
    files: lintFiles === undefined ? 'src/**/*.{vue,less,postcss,css,scss}' : lintFiles,
    formatter: stylelintFormatTable,
  };
  // 如果没有找到配置文件，增加默认配置项
  if (!existStylelintrc) {
    options.config = {
      extends: [require.resolve('@toolkit-js/iconfig/lib/stylelintrc-hs')],
      rules: {},
    };
  }

  if (fix) {
    options.fix = true;
  }

  lint(options)
    .then(function (data) {
      console.log(data?.output);
      spinner(`stylelint 校验结束\n`).info();
    })
    .catch(function (err) {
      spinner(err.stack).warn();
    });
}
```

### 经验总结

在 `eslint` 的文档中有下面一段话：

虽然 `ESLint` 被设计为在命令行上运行，但也可以通过 `Node.js API` 以编程方式使用 `ESLint`。`Node.js API` 的目的是允许插件和工具作者直接使用 `ESLint` 功能，而无需通过命令行界面。

脚手架开发时要打破业务开发的固有逻辑，不要思维固化，其实 `eslint` 文档中有关于插件和工具开发的说明，要认真查看官方文档。方案虽然定下来了，对于方案的具体实现也是不确定的，具体的编码实现会有很大差别，及时沟通可以尽早找出实现方案的缺点和漏洞。
