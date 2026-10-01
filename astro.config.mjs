import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://jojo.news",
  trailingSlash: "never",
  // Preserve pre-v7 whitespace behavior (v7 defaults to JSX whitespace stripping)
  compressHTML: true,
  integrations: [sitemap()],
  prefetch: { defaultStrategy: 'viewport' },
  vite: {
    plugins: [tailwindcss()],
  },
});
