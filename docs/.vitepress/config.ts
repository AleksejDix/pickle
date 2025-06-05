import { defineConfig } from "vitepress";

export default defineConfig({
  title: "useTemporal",
  description:
    "Revolutionary Vue 3 Time Composables with Hierarchical Divide Pattern",

  // Enable Vue in markdown
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.includes("demo-"),
      },
    },
  },

  // Vite configuration for components
  vite: {
    resolve: {
      alias: {
        "@": new URL("../src", import.meta.url).pathname,
        usetemporal: new URL("../src/index.ts", import.meta.url).pathname,
      },
    },
    optimizeDeps: {
      include: ["date-fns"],
    },
  },

  themeConfig: {
    logo: "/logo.svg",

    // Simple, clear top navigation
    nav: [
      { text: "Guide", link: "/getting-started" },
      { text: "Examples", link: "/examples/" },
      { text: "API Reference", link: "/composables/use-pickle" },
      {
        text: "v0.1.0",
        items: [
          { text: "Changelog", link: "/changelog" },
          { text: "Contributing", link: "/contributing" },
        ],
      },
    ],

    sidebar: {
      // Default sidebar for guide
      "/": [
        {
          text: "Introduction",
          collapsed: false,
          items: [
            { text: "What is useTemporal?", link: "/" },
            { text: "Getting Started", link: "/getting-started" },
            { text: "Installation", link: "/installation" },
          ],
        },
        {
          text: "Core Concepts",
          collapsed: false,
          items: [
            {
              text: "Hierarchical Time Units",
              link: "/concepts/hierarchical-units",
            },
            { text: "The divide() Pattern", link: "/concepts/divide-pattern" },
            {
              text: "Time Unit Interface",
              link: "/concepts/time-unit-interface",
            },
          ],
        },
        {
          text: "Interactive Examples",
          collapsed: false,
          items: [
            {
              text: "Basic Date Picker",
              link: "/examples/basic-date-picker",
            },
            {
              text: "Multi-Scale Calendar",
              link: "/examples/multi-scale-calendar",
            },
            { text: "Browse All Examples →", link: "/examples/" },
          ],
        },
      ],

      // Examples section
      "/examples/": [
        {
          text: "Examples",
          items: [{ text: "Overview", link: "/examples/" }],
        },
        {
          text: "Interactive Demos",
          collapsed: false,
          items: [
            { text: "Basic Date Picker", link: "/examples/basic-date-picker" },
            {
              text: "Multi-Scale Calendar",
              link: "/examples/multi-scale-calendar",
            },
            { text: "GitHub Chart", link: "/examples/github-chart" },
            { text: "Time Navigation", link: "/examples/time-navigation" },
          ],
        },
        {
          text: "Patterns & Techniques",
          collapsed: false,
          items: [
            {
              text: "Component Patterns",
              link: "/examples/component-patterns",
            },
            { text: "Custom Time Units", link: "/examples/custom-units" },
          ],
        },
        {
          text: "Advanced",
          collapsed: false,
          items: [
            {
              text: "Performance Optimization",
              link: "/examples/performance-patterns",
            },
          ],
        },
      ],

      // API Reference section
      "/composables/": [
        {
          text: "API Reference",
          items: [{ text: "Overview", link: "/composables/" }],
        },
        {
          text: "Core Composables",
          collapsed: false,
          items: [{ text: "usePickle", link: "/composables/use-pickle" }],
        },
        {
          text: "Time Scale Composables",
          collapsed: false,
          items: [
            { text: "useMillennium", link: "/composables/use-millennium" },
            { text: "useCentury", link: "/composables/use-century" },
            { text: "useDecade", link: "/composables/use-decade" },
            { text: "useYear", link: "/composables/use-year" },
            { text: "useQuarter", link: "/composables/use-quarter" },
            { text: "useMonth", link: "/composables/use-month" },
            { text: "useWeek", link: "/composables/use-week" },
            { text: "useDay", link: "/composables/use-day" },
            { text: "useHour", link: "/composables/use-hour" },
            { text: "useMinute", link: "/composables/use-minute" },
          ],
        },
        {
          text: "Types & Interfaces",
          collapsed: false,
          items: [
            { text: "TimeUnit", link: "/types/time-unit" },
            { text: "PickleCore", link: "/types/pickle-core" },
            { text: "Timespan", link: "/types/timespan" },
          ],
        },
      ],

      // Concepts section
      "/concepts/": [
        {
          text: "Core Concepts",
          items: [
            {
              text: "Hierarchical Time Units",
              link: "/concepts/hierarchical-units",
            },
            { text: "The divide() Pattern", link: "/concepts/divide-pattern" },
            {
              text: "Time Unit Interface",
              link: "/concepts/time-unit-interface",
            },
          ],
        },
        {
          text: "Advanced Concepts",
          collapsed: false,
          items: [
            { text: "Reactive Time Management", link: "/concepts/reactivity" },
            { text: "Time Synchronization", link: "/concepts/synchronization" },
            {
              text: "Performance Considerations",
              link: "/concepts/performance",
            },
          ],
        },
      ],
    },

    // Add edit link
    editLink: {
      pattern:
        "https://github.com/your-username/usetemporal/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },

    // Footer
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024 useTemporal",
    },

    // Search
    search: {
      provider: "local",
    },

    // Social links
    socialLinks: [
      { icon: "github", link: "https://github.com/your-username/usetemporal" },
      { icon: "discord", link: "https://discord.gg/usetemporal" },
      { icon: "twitter", link: "https://twitter.com/usetemporal" },
    ],

    // Last updated
    lastUpdated: {
      text: "Updated at",
      formatOptions: {
        dateStyle: "full",
        timeStyle: "medium",
      },
    },
  },

  // Enhanced markdown configuration
  markdown: {
    lineNumbers: true,
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
  },

  // SEO
  head: [
    ["meta", { name: "theme-color", content: "#007acc" }],
    ["meta", { name: "og:type", content: "website" }],
    ["meta", { name: "og:locale", content: "en" }],
    ["meta", { name: "og:site_name", content: "useTemporal" }],
    ["meta", { name: "og:image", content: "/logo.svg" }],
    ["script", { src: "https://cdn.tailwindcss.com" }],
  ],
});
