import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'useTemporal',
  description: 'Revolutionary time library with unique divide() pattern',
  base: '/usetemporal/',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/create-temporal' },
      { text: 'Examples', link: '/examples/basic-usage' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is useTemporal?', link: '/guide/what-is-usetemporal' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'All Features', link: '/guide/all-features' },
            { text: 'Installation', link: '/guide/installation' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'The divide() Pattern', link: '/guide/divide-pattern' },
            { text: 'Date Adapters', link: '/guide/date-adapters' },
            { text: 'Reactive Time Units', link: '/guide/reactive-time-units' },
            { text: 'Framework Agnostic', link: '/guide/framework-agnostic' }
          ]
        },
        {
          text: 'Features',
          items: [
            { text: 'Time Navigation', link: '/guide/time-navigation' },
            { text: 'Fiscal Year Support', link: '/guide/fiscal-year' },
            { text: 'Internationalization', link: '/guide/i18n' },
            { text: 'Zero Dependencies', link: '/guide/zero-dependencies' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'Core API',
          items: [
            { text: 'createTemporal', link: '/api/create-temporal' },
            { text: 'divide()', link: '/api/divide' }
          ]
        },
        {
          text: 'Composables',
          items: [
            { text: 'useYear', link: '/api/use-year' },
            { text: 'useMonth', link: '/api/use-month' },
            { text: 'useWeek', link: '/api/use-week' },
            { text: 'useDay', link: '/api/use-day' },
            { text: 'useHour', link: '/api/use-hour' }
          ]
        },
        {
          text: 'Adapters',
          items: [
            { text: 'Native Adapter', link: '/api/adapter-native' },
            { text: 'date-fns Adapter', link: '/api/adapter-date-fns' },
            { text: 'Luxon Adapter', link: '/api/adapter-luxon' },
            { text: 'Temporal API Adapter', link: '/api/adapter-temporal' }
          ]
        },
        {
          text: 'Utilities',
          items: [
            { text: 'same()', link: '/api/same' },
            { text: 'each()', link: '/api/each' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Basic Examples',
          items: [
            { text: 'Basic Usage', link: '/examples/basic-usage' },
            { text: 'Date Picker', link: '/examples/date-picker' },
            { text: 'Calendar', link: '/examples/calendar' }
          ]
        },
        {
          text: 'Framework Examples',
          items: [
            { text: 'Vue', link: '/examples/vue' },
            { text: 'React', link: '/examples/react' },
            { text: 'Angular', link: '/examples/angular' },
            { text: 'Svelte', link: '/examples/svelte' },
            { text: 'Vanilla JS', link: '/examples/vanilla' }
          ]
        },
        {
          text: 'Advanced Examples',
          items: [
            { text: 'Fiscal Year Calendar', link: '/examples/fiscal-year' },
            { text: 'Multi-timezone', link: '/examples/multi-timezone' },
            { text: 'Custom Adapter', link: '/examples/custom-adapter' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourusername/usetemporal' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present'
    },

    search: {
      provider: 'local'
    }
  }
})