# architecture

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Astro | ^6.1.5 |
| CSS | Tailwind CSS | ^4 (via `@tailwindcss/vite`) |
| CSS plugin | @tailwindcss/typography | ^0.5 |
| TS | TypeScript | ^5 (strict mode, extends `astro/tsconfigs/strict`) |
| Font engine | Satori | ^0.26.0 |
| Image processing | sharp | ^0.33 |
| Woff2 decompression | wawoff2 | ^2.0.1 |
| ATProto publishing | @kckempf/astro-standard-site | ^1.0.7 |
| RSS | @astrojs/rss | ^4.0.18 |
| Sitemap | @astrojs/sitemap | ^3.7.2 |

## Build/output mode

- **Output mode**: static (default — no adapter configured in `astro.config.mjs`)
- **Site URL**: `https://jojo.news`
- **trailingSlash**: `never` (URLs have no trailing slash)
- **Prefetch**: viewport-based (`prefetch: { defaultStrategy: 'viewport' }`)
- **Build command**: `astro build` → output to `dist/`
- **Dev command**: `astro dev`

## Folder structure

```
/
├── astro.config.mjs           # Astro config (site, integrations, prefetch, vite)
├── tsconfig.json              # Strict TS, extends astro/tsconfigs/strict
├── package.json               # Scripts: dev, build, preview
├── public/                    # Static assets copied verbatim to dist/
│   ├── favicon.png
│   ├── robots.txt
│   └── images/                # (empty — post images go here)
├── src/
│   ├── content.config.ts      # Content collections definition
│   ├── content/
│   │   └── posts/             # Markdown posts (glob-loaded)
│   ├── pages/
│   │   ├── index.astro        # Homepage (URL: /)
│   │   ├── 404.astro          # Custom 404 (URL: /404)
│   │   ├── og.png.ts          # API route → /og.png
│   │   ├── rss.xml.ts         # API route → /rss.xml
│   │   ├── posts/[slug].astro  # Dynamic post page (URL: /posts/{slug})
│   │   └── og/[slug].png.ts   # Dynamic OG image (URL: /og/{slug}.png)
│   │   └── .well-known/
│   │       └── site.standard.publication.ts  # ATProto verification endpoint
│   ├── layouts/
│   │   └── Layout.astro       # Single layout shell
│   ├── components/
│   │   └── ThemeToggle.astro  # Dark/light toggle with View Transitions support
│   ├── lib/
│   │   ├── consts.ts          # SITE_TITLE, SITE_DESCRIPTION, etc.
│   │   ├── date.ts            # formatDate, toISODate helpers
│   │   ├── posts.ts           # getPublishedPosts (filters drafts in PROD)
│   │   ├── og.ts              # renderOgImage (Satori SVG → PNG via sharp)
│   │   ├── og-font.ts         # Font loading for OG image (wawoff2, Charter + Hack)
│   │   └── wawoff2.d.ts       # Type declaration for wawoff2
│   ├── assets/
│   │   └── fonts/             # Charter woff2 (4) + Hack Regular ttf
│   ├── styles/
│   │   └── globals.css        # Tailwind imports + custom properties + prose overrides
│   └── data/
│       └── standard-site-records.json  # ATProto rkey storage (git-tracked)
├── scripts/
│   └── sync-to-atproto.ts     # ATProto publish script (runs in CI before build)
├── docs/
│   └── guide.md               # Authoring guide for content editors
├── .tangled/
│   └── workflows/
│       └── deploy.yml         # CI/CD pipeline (Tangled → Wisp)
└── .astro/                    # Auto-generated Astro types & metadata (gitignored)
```

## Integrations

Defined in `astro.config.mjs`:
- `@astrojs/sitemap` — generates `sitemap-index.xml` + `sitemap-0.xml`
- `@tailwindcss/vite` — Tailwind v4 via Vite plugin (not an Astro integration, loaded under `vite.plugins`)

## Config details (`src/content.config.ts`)

Astro v6 uses the new `src/content.config.ts` file (not `src/content/config.ts`):
```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
    authorNote: z.string().optional(),
  }),
});
```

*Last verified: 2026-06-23 (d82bfe7)*
