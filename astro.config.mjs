import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://jojo.news",
  trailingSlash: "never",
  integrations: [sitemap()],
  prefetch: { defaultStrategy: 'viewport' },
  vite: {
    plugins: [tailwindcss()],
  },
});
