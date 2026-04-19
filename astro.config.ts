import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/config";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  redirects: {
    "/blog/react-redux-toolkit-with-typescript": "/blog/react-redux-toolkit-with-typescript/",
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    sitemap({
      filter: page => {
        const path = new URL(page).pathname;
        if (path.startsWith("/404")) return false;
        if (path.startsWith("/search")) return false;
        if (path.endsWith("/robots.txt")) return false;
        if (path.endsWith("/llms.txt")) return false;
        if (path.endsWith("/rss.xml")) return false;
        // Drop redundant page-1 pagination — duplicates of the index
        if (/\/1\/$/.test(path)) return false;
        return true;
      },
      serialize: item => {
        const path = new URL(item.url).pathname;

        if (path === "/") return { ...item, changefreq: "weekly", priority: 1.0 };

        // Blog pagination before individual posts (both match /blog/:slug/)
        if (/^\/blog\/\d+\/$/.test(path)) return { ...item, changefreq: "weekly", priority: 0.7 };

        if (path === "/blog/") return { ...item, changefreq: "weekly", priority: 0.8 };

        if (/^\/blog\/[^/]+\/$/.test(path))
          return { ...item, changefreq: "monthly", priority: 0.9 };

        if (path === "/tags/") return { ...item, changefreq: "monthly", priority: 0.5 };

        // Tag pagination (/tags/foo/2/, /tags/foo/3/)
        if (/^\/tags\/[^/]+\/\d+\/$/.test(path))
          return { ...item, changefreq: "monthly", priority: 0.3 };

        // Individual tag pages
        if (/^\/tags\/[^/]+\/$/.test(path))
          return { ...item, changefreq: "monthly", priority: 0.4 };

        return { ...item, changefreq: "monthly", priority: 0.3 };
      },
    }),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [
      remarkToc,
      [
        remarkCollapse,
        {
          test: "Table of contents",
        },
      ],
    ],
    shikiConfig: {
      theme: "tokyo-night",
      wrap: true,
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  scopedStyleStrategy: "where",
  trailingSlash: "always",
});
