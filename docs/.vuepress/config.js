module.exports = {
  title: 'HUI FRAMEWORK',
  base: '/blog/',
  description: 'HUI Framework Team Blog',
  head: [['link', { rel: 'shortcut icon', href: '/assets/img/favicon.ico' }]],
  logo: './assets/img/logo.png',
  theme: require.resolve('../../'),
  themeConfig: {
    authors: [
      {
        name: 'kawhi66',
        avatar: '/assets/img/logo.png',
        link: 'https://kawhi.site',
        linktext: 'Follow',
      },
    ],
    footer: {
      contact: [
        {
          type: 'github',
          link: 'https://github.com/hui-framework',
        },
      ],
      copyright: [
        {
          text: 'Licensed MIT.',
          link: 'https://bootstrapstarter.com/license/',
        },
        {
          text: 'Made with Mediumish - free Vuepress theme',
          link:
            'https://bootstrapstarter.com/bootstrap-templates/vuepress-theme-mediumish/',
        },
      ],
    },

    // sitemap: {
    //   hostname: 'https://github.com/wowthemesnet/vuepress-theme-mediumish/'
    // },
    // comment: {
    //   service: 'disqus',
    //   shortname: 'demowebsite',
    // },
    // newsletter: {
    //   endpoint: 'https://wowthemes.us11.list-manage.com/subscribe/post?u=8aeb20a530e124561927d3bd8&id=8c3d2d214b'
    // },
    // feed: {
    //   canonical_base: 'https://github.com/wowthemesnet/vuepress-theme-mediumish/',
    // },
    smoothScroll: true,
  },
}
