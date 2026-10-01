# architecture

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Astro | ^7.3.5 (Vite 8, Node ≥22.12) |
| Markdown | Sätteri (Astro's native pipeline) | built-in (Astro 7 default) |
| CSS | Tailwind CSS | ^4.3.3 (via `@tailwindcss/vite`) |
| CSS plugin | @tailwindcss/typography | ^0.5.20 |
| TS | TypeScript | ^5 (strict mode, extends `astro/tsconfigs/strict`) |
| Font engine | Satori | ^0.26.0 |
| Image processing | sharp | ^0.35.5 |
| Woff2 decompression | wawoff2 | ^2.0.1 |
| ATProto publishing | @kckempf/astro-standard-site | ^1.1.7 |
| RSS | @astrojs/rss | ^4.0.19 |
| Sitemap | @astrojs/sitemap | ^3.7.4 |

## Build/output mode

- **Output mode**: static (default — no adapter configured in `astro.config.mjs`)
- **Site URL**: `https://jojo.news`
- **trailingSlash**: `never` (URLs have no trailing slash)
- **compressHTML**: `true` (explicit; Astro 7 now defaults to `'jsx'` whitespace stripping, this keeps pre-v7 output)
- **Prefetch**: viewport-based (`prefetch: { defaultStrategy: 'viewport' }`)
- **Build command**: `astro build` → output to `dist/`
- **Dev command**: `astro dev` (Astro 7 can daemonize; `astro dev stop` / `astro dev status`)

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
├── .AGENTS/                   # Canonical project documentation (see README.md)
├── .tangled/
│   └── workflows/
│       └── deploy.yml         # CI/CD pipeline (Tangled → Wisp)
└── .astro/                    # Auto-generated Astro types & metadata (gitignored)
```

**Source of truth**: Tangled (`git@tangled.org:jojo.news/blog`). GitHub (`github.com/sakn0m/blog`) is an optional mirror via a second `pushurl` on the `tangled` remote — see `.AGENTS/deployment.md`.

## Integrations

Defined in `astro.config.mjs`:
- `@astrojs/sitemap` — generates `sitemap-index.xml` + `sitemap-0.xml`
- `@tailwindcss/vite` — Tailwind v4 via Vite plugin (not an Astro integration, loaded under `vite.plugins`)

## Config details (`src/content.config.ts`)

Uses the Content Layer API in `src/content.config.ts` (not `src/content/config.ts`). Since Astro 6, `z` must be imported from `astro/zod` (importing it from `astro:content` is deprecated):
```ts
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
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

*Last verified: 2026-10-01 (aaffd1d)*
