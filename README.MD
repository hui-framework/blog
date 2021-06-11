## HUI Framework Team blog

这是 HUI 框架团队的博客站点，基于 [vuepress](https://vuepress.vuejs.org/) 和 [vuepress-theme-mediumish](https://wowthemesnet.github.io/vuepress-theme-mediumish/) 搭建，基于 [Vssue](https://vssue.js.org/) 实现评论。

### 写作指引

```bash
# 拷贝 blog 仓库到本地
$ git clone https://github.com/hui-framework/blog.git

# 环境准备
$ cd blog
$ npm i -d # 或者 yarn
```

执行以上命令完成环境准备。

```bash
# 启动开发服务器
$ yarn docs:dev
```

执行以上命令可以在本地启动开发服务器，可以在 `docs/_posts` 目录下新建 `.md` 文件，比如 `2021-6-11-hello-world.md`，在任意编辑器里面打开新建的 `.md` 文件即可开始写作。

### 发布

```bash
$ sh deploy.sh
```

写作完成后执行以上命令即可发布到 github-pages，等待发布完成访问 [https://hui-framework.github.io/blog/](https://hui-framework.github.io/blog/) 找到自己的文章。
