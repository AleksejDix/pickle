import { defineConfig } from "vitepress";

export default defineConfig({
  title: "useTemporal",
  description:
    "Revolutionary time library with unique divide() pattern for hierarchical time management",

  head: [
    ["meta", { name: "theme-color", content: "#3c8772" }],
    ["meta", { property: "og:type", content: "website" }],
    [
      "meta",
      {
        property: "og:title",
        content: "useTemporal - Revolutionary Time Library",
      },
    ],
    [
      "meta",
      {
        property: "og:description",
        content:
          "The only JavaScript time handling library with the divide() pattern, allowing infinite subdivision of time units with perfect synchronization.",
      },
    ],
  ],

  themeConfig: {
    nav: [
      {
        text: "Guide",
        link: "/guide/what-is-usetemporal",
        activeMatch: "/guide/",
      },
      { text: "API", link: "/api/index", activeMatch: "/api/" },
      {
        text: "Examples",
        link: "/examples/basic-usage",
        activeMatch: "/examples/",
      },
      {
        text: "Resources",
        link: "/resources/javascript-date-quirks",
        activeMatch: "/resources/",
      },
      {
        text: "v2.0.0",
        items: [
          {
            text: "Changelog",
            link: "https://github.com/aleksej/usetemporal/blob/main/CHANGELOG.md",
          },
          {
            text: "Contributing",
            link: "https://github.com/aleksej/usetemporal/blob/main/CONTRIBUTING.md",
          },
        ],
      },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          collapsed: false,
          items: [
            {
              text: "What is useTemporal?",
              link: "/guide/what-is-usetemporal",
            },
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Installation", link: "/guide/installation" },
            { text: "First App", link: "/guide/first-app" },
          ],
        },
        {
          text: "Core Concepts",
          collapsed: false,
          items: [
            { text: "The divide() Pattern", link: "/guide/divide-pattern" },
            { text: "Reactive Time Units", link: "/guide/reactive-time-units" },
            { text: "Date Adapters", link: "/guide/adapters" },
            { text: "Framework Agnostic", link: "/guide/framework-agnostic" },
          ],
        },
        {
          text: "Patterns & Recipes",
          collapsed: false,
          items: [
            { text: "The divide() Pattern", link: "/guide/patterns/divide-pattern" },
            { text: "Navigation", link: "/guide/patterns/navigation" },
            { text: "Time Analysis", link: "/guide/patterns/time-analysis" },
            { text: "Business Logic", link: "/guide/patterns/business-logic" },
          ],
        },
        {
          text: "Framework Integration",
          collapsed: false,
          items: [
            { text: "Overview", link: "/guide/integrations/overview" },
          ],
        },
        {
          text: "Advanced Topics",
          collapsed: false,
          items: [
            { text: "Performance Optimization", link: "/guide/advanced/performance-optimization" },
            { text: "Testing", link: "/guide/testing" },
            { text: "TypeScript", link: "/guide/typescript" },
            { text: "Migration Guide", link: "/guide/migration" },
          ],
        },
        {
          text: "Reference",
          collapsed: false,
          items: [
            { text: "Performance", link: "/guide/performance" },
            { text: "Troubleshooting", link: "/guide/troubleshooting" },
          ],
        },
      ],

      "/api/": [
        {
          text: "Overview",
          items: [
            { text: "API Reference", link: "/api/" },
          ],
        },
        {
          text: "Factory Functions",
          collapsed: false,
          items: [
            { text: "Overview", link: "/api/factory-functions/" },
            { text: "createTemporal", link: "/api/factory-functions/create-temporal" },
            { text: "createPeriod", link: "/api/factory-functions/create-period" },
            { text: "createCustomPeriod", link: "/api/factory-functions/create-custom-period" },
            { text: "toPeriod", link: "/api/factory-functions/to-period" },
          ],
        },
        {
          text: "Operations",
          collapsed: false,
          items: [
            { text: "Overview", link: "/api/operations/" },
            { text: "Time Division", items: [
              { text: "divide", link: "/api/operations/divide" },
              { text: "split", link: "/api/operations/split" },
              { text: "merge", link: "/api/operations/merge" },
            ]},
            { text: "Navigation", items: [
              { text: "next", link: "/api/operations/next" },
              { text: "previous", link: "/api/operations/previous" },
              { text: "go", link: "/api/operations/go" },
            ]},
            { text: "Comparison", items: [
              { text: "isSame", link: "/api/operations/is-same" },
              { text: "contains", link: "/api/operations/contains" },
            ]},
          ],
        },
        {
          text: "Utilities",
          collapsed: false,
          items: [
            { text: "Overview", link: "/api/utilities/" },
            { text: "isWeekend", link: "/api/utilities/is-weekend" },
            { text: "isWeekday", link: "/api/utilities/is-weekday" },
            { text: "isToday", link: "/api/utilities/is-today" },
          ],
        },
        {
          text: "Types",
          collapsed: false,
          items: [
            { text: "Overview", link: "/api/types/" },
            { text: "Period", link: "/api/types/period" },
            { text: "Unit", link: "/api/types/unit" },
            { text: "Temporal", link: "/api/types/temporal" },
            { text: "Adapter", link: "/api/types/adapter" },
            { text: "UnitRegistry", link: "/api/types/unit-registry" },
          ],
        },
        {
          text: "Composables",
          collapsed: false,
          items: [
            { text: "usePeriod", link: "/api/composables/use-period" },
          ],
        },
        {
          text: "Unit System",
          collapsed: false,
          items: [
            { text: "defineUnit", link: "/api/unit-system/define-unit" },
            { text: "Unit Constants", link: "/api/unit-system/constants" },
            { text: "getUnitDefinition", link: "/api/unit-system/get-unit-definition" },
            { text: "hasUnit", link: "/api/unit-system/has-unit" },
            { text: "getRegisteredUnits", link: "/api/unit-system/get-registered-units" },
          ],
        },
      ],

      "/examples/": [
        {
          text: "Getting Started",
          items: [
            { text: "Basic Usage", link: "/examples/basic-usage" },
            { text: "Simple Calendar", link: "/examples/calendar" },
          ],
        },
        {
          text: "Calendar Examples",
          collapsed: false,
          items: [
            { text: "Month Calendar", link: "/examples/calendars/month-calendar" },
            { text: "Year Overview", link: "/examples/calendars/year-overview" },
            { text: "Mini Calendar", link: "/examples/calendars/mini-calendar" },
          ],
        },
        {
          text: "Framework Examples",
          collapsed: false,
          items: [
            { text: "Vue Integration", link: "/examples/frameworks/vue-integration" },
            { text: "React Integration", link: "/examples/frameworks/react-integration" },
            { text: "Vue Calendar", link: "/examples/frameworks/vue-calendar" },
            { text: "React Calendar", link: "/examples/frameworks/react-calendar" },
          ],
        },
        {
          text: "Recipes",
          collapsed: false,
          items: [
            { text: "Business Days", link: "/examples/recipes/business-days" },
            { text: "Time Slots", link: "/examples/recipes/time-slots" },
            { text: "Date Range Picker", link: "/examples/recipes/date-range-picker" },
          ],
        },
      ],

      "/resources/": [
        {
          text: "Educational Resources",
          items: [
            {
              text: "JavaScript Date Quirks",
              link: "/resources/javascript-date-quirks",
            },
            {
              text: "Calendar Systems History",
              link: "/resources/calendar-systems-history",
            },
            {
              text: "Date Formats Worldwide",
              link: "/resources/date-formats-worldwide",
            },
            {
              text: "Timezones in Browsers",
              link: "/resources/timezones-in-browsers",
            },
            { text: "Week Start Days", link: "/resources/week-start-days" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/AleksejDix/pickle" },
      { icon: "twitter", link: "https://twitter.com/aleksejdix" },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024-present useTemporal Contributors",
    },

    editLink: {
      pattern: "https://github.com/AleksejDix/pickle/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },

    search: {
      provider: "local",
      options: {
        detailedView: true,
        placeholder: "Search docs",
        translations: {
          button: {
            buttonText: "Search",
            buttonAriaLabel: "Search",
          },
          modal: {
            noResultsText: "No results for",
            resetButtonTitle: "Reset search",
            displayDetails: "Display detailed list",
            footer: {
              selectText: "to select",
              navigateText: "to navigate",
              closeText: "to close",
            },
          },
        },
      },
    },

    outline: {
      level: [2, 3],
    },

    docFooter: {
      prev: "Previous page",
      next: "Next page",
    },

    lastUpdated: {
      text: "Last updated",
      formatOptions: {
        dateStyle: "medium",
        timeStyle: "short",
      },
    },

    carbonAds: {
      code: "your-carbon-code",
      placement: "your-carbon-placement",
    },
  },

  markdown: {
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
    lineNumbers: true,
    config: (md) => {
      // Add custom markdown plugins here
    },
  },

  vite: {
    // Vite config options
  },

  vue: {
    // @vitejs/plugin-vue options
  },
});
