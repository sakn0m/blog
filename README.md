# jojo.news

A minimal, static blog. Posts are plain Markdown in `src/content/posts/`, built with
[Astro](https://astro.build) and hosted on **Cloudflare Workers static assets**, deployed
from **Tangled** CI.

- **Live site**: https://jojo.news
- **Source of truth**: GitHub (`github.com/sakn0m/blog`)
- **Deploy**: Tangled CI → Cloudflare Workers

*Last verified: 2026-10-01 (aaffd1d)*

---

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
| RSS | @astrojs/rss | ^4.0.19 |
| Sitemap | @astrojs/sitemap | ^3.7.4 |

The project is deliberately light: 6 runtime dependencies and 4 devDependencies. No UI
framework, no CMS, no analytics.

## Build/output mode

- **Output mode**: static (default — no adapter configured in `astro.config.mjs`)
- **Site URL**: `https://jojo.news`
- **trailingSlash**: `never` (URLs have no trailing slash)
- **compressHTML**: `true` (explicit; Astro 7 now defaults to `'jsx'` whitespace stripping,
  this keeps pre-v7 output)
- **Prefetch**: viewport-based (`prefetch: { defaultStrategy: 'viewport' }`)
- **Build command**: `astro build` → output to `dist/`
- **Dev command**: `astro dev` (Astro 7 can daemonize; `astro dev stop` / `astro dev status`)

### Integrations (`astro.config.mjs`)

- `@astrojs/sitemap` — generates `sitemap-index.xml` + `sitemap-0.xml`
- `@tailwindcss/vite` — Tailwind v4 via Vite plugin (not an Astro integration, loaded under
  `vite.plugins`)

### Content config (`src/content.config.ts`)

Uses the Content Layer API in `src/content.config.ts` (not `src/content/config.ts`). Since
Astro 6, `z` must be imported from `astro/zod` (importing it from `astro:content` is
deprecated):

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

## Project structure

```
/
├── astro.config.mjs           # Astro config (site, integrations, prefetch, vite)
├── README.md                  # This file — canonical documentation
├── wrangler.jsonc             # Cloudflare Workers static-assets config (deploy target)
├── tsconfig.json              # Strict TS, extends astro/tsconfigs/strict
├── package.json               # Scripts: dev, build, preview
├── public/                    # Static assets copied verbatim to dist/
│   ├── favicon.png
│   ├── robots.txt
│   └── images/                # Post images go here
├── src/
│   ├── content.config.ts      # Content collections definition
│   ├── content/
│   │   └── posts/             # Markdown posts (glob-loaded)
│   ├── pages/
│   │   ├── index.astro        # Homepage (URL: /)
│   │   ├── 404.astro          # Custom 404 (URL: /404)
│   │   ├── og.png.ts          # API route → /og.png
│   │   ├── rss.xml.ts         # API route → /rss.xml
│   │   ├── posts/[slug].astro # Dynamic post page (URL: /posts/{slug})
│   │   └── og/[slug].png.ts   # Dynamic OG image (URL: /og/{slug}.png)
│   ├── layouts/
│   │   └── Layout.astro       # Single layout shell
│   ├── components/
│   │   └── ThemeToggle.astro  # Dark/light toggle with View Transitions support
│   ├── lib/
│   │   ├── consts.ts          # SITE_TITLE, SITE_DESCRIPTION, etc.
│   │   ├── date.ts            # formatDate, formatDateLong, toISODate helpers
│   │   ├── posts.ts           # getPublishedPosts (filters drafts in PROD)
│   │   ├── og.ts              # renderOgImage (Satori SVG → PNG via sharp)
│   │   ├── og-font.ts         # Font loading for OG image (wawoff2, Charter + Hack)
│   │   └── wawoff2.d.ts       # Type declaration for wawoff2
│   ├── assets/
│   │   └── fonts/             # Charter woff2 (4) + Hack Regular ttf
│   └── styles/
│       └── globals.css        # Tailwind imports + custom properties + prose overrides
├── .tangled/
│   └── workflows/
│       └── deploy.yml         # CI/CD pipeline (Tangled → Cloudflare)
└── .astro/                    # Auto-generated Astro types & metadata (gitignored)
```

---

## How to write a post

Posts are plain Markdown files in `src/content/posts/`. There is no CMS — you edit the file
directly and push to `main`, which builds and deploys via Tangled → Cloudflare Workers
(see [Deployment](#deployment)).

### File name = URL slug

The filename (without `.md`) becomes the post slug:

- `src/content/posts/my-post.md` → `https://jojo.news/posts/my-post`
- OG image: `https://jojo.news/og/my-post.png`

Renaming the file changes the URL. No redirects are generated automatically.

### Frontmatter

Every post starts with a YAML frontmatter block:

```yaml
---
title: My Post Title
date: 2026-10-01
description: Optional summary used for OG/meta tags and RSS.
draft: false
authorNote: Optional italic note rendered below the post.
---
```

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `title` | yes | string | Post title and `<h1>` |
| `date` | yes | `YYYY-MM-DD` | Sorts the homepage (newest first) |
| `description` | no | string | Used as-is for OG/meta/RSS. If omitted, auto-generated from the body (truncated at 160 chars) |
| `draft` | no | boolean | Defaults to `false`. When `true`, hidden in production builds but visible in `astro dev` |
| `authorNote` | no | string | Rendered as a muted italic note below the content |

### Writing

This blog uses **Tailwind Typography** to style posts automatically — focus on writing, not
layout.

**Paragraphs**: no `<br />` needed. Press **Enter twice** to start a new paragraph.

```markdown
This is the first paragraph.

This is the second paragraph. It will have nice spacing above it automatically.
```

**Bold & Italic**: `**text**` for bold, `*text*` for italic.

**Headings**: use `#`. Example: `## My Section Title`

**Lists**: `-` for bullet points.

**Quotes**: `>` for blockquotes.

### Images

Use standard Markdown images. They are optimized for speed and layout stability.

```markdown
![Description of image](/path/to/image.jpg)
```

**Note**: images must live in the `public` folder. An image at `public/my-dog.jpg` is linked
as `/my-dog.jpg`.

### Preview before publishing

Run `npm run dev` (or `bun run dev`) to preview locally at `http://localhost:4321`. Drafts
are visible in dev.

---

## Content model

There is one collection: **posts**, defined in `src/content.config.ts`.

### Schema (zod)

```ts
title:        z.string()                    // required
date:         z.date()                      // required
description:  z.string().optional()         // OG / RSS / meta
draft:        z.boolean().default(false)    // hidden in production builds
authorNote:   z.string().optional()         // rendered below post content
```

### Source files

Posts are markdown files in `src/content/posts/` loaded via
`glob({ pattern: "**/*.md", base: "./src/content/posts" })`.

File naming convention: `post-id.md` — the filename (without extension) becomes the
`post.id`, used as:

- URL slug: `/posts/{post.id}`
- OG image slug: `/og/{post.id}.png`

Current posts:

- `src/content/posts/what-is-this.md`
- `src/content/posts/bombing-iran-won-t-free-it.md`

### Draft behavior

In `src/lib/posts.ts`:

```ts
export async function getPublishedPosts() {
  return (await getCollection('posts'))
    .filter((post) => import.meta.env.PROD ? !post.data.draft : true)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
```

- In development (`astro dev`): drafts are visible
- In production (`astro build`): drafts are filtered out
- Posts sorted by date descending (newest first)

### No CMS layer

There is no CMS in this repo. Authors edit markdown directly. The blog previously used a
self-hosted **Keystatic** CMS at `cms.jojo.news` (separate `keystatic-blog` repo, deployed to
Vercel). It has been decommissioned. This repo never depended on it — content is plain
markdown consumed by the `posts` collection `glob` loader.

### Description auto-generation

If a post has no `description` in its frontmatter, the description is auto-generated from the
post body (strip markdown, collapse whitespace, truncate at 160 chars + `...`). It is used
as-is for the HTML `<meta>` and OG tags in `[slug].astro`.

Explicit frontmatter descriptions are never truncated — only auto-generated ones are.

### No i18n

Single language (English). No locale folders, no locale frontmatter, no locale-aware routing.

### Custom field: `authorNote`

Renders as an italic note below the post content, separated by a border:

```astro
{post.data.authorNote && (
  <p class="author-note">{post.data.authorNote}</p>
)}
```

Styled in `globals.css` as `.author-note` with muted color, italic, top border.

---

## Routing & pages

### URL → file mapping

| URL | Source file | Type |
|-----|------------|------|
| `/` | `src/pages/index.astro` | Static page |
| `/posts/{slug}` | `src/pages/posts/[slug].astro` | Dynamic (SSG) |
| `/og.png` | `src/pages/og.png.ts` | API endpoint (static) |
| `/og/{slug}.png` | `src/pages/og/[slug].png.ts` | API endpoint (dynamic SSG) |
| `/rss.xml` | `src/pages/rss.xml.ts` | API endpoint (static) |
| `/sitemap-index.xml`, `/sitemap-0.xml` | generated by `@astrojs/sitemap` | Static (build output) |
| `/404` | `src/pages/404.astro` | Custom error page |
| `/favicon.png`, `/robots.txt`, `/images/*` | `public/` | Static assets |

### Dynamic routes

**`[slug].astro` → `/posts/{slug}`**

`getStaticPaths` queries `getPublishedPosts()` and maps each post:

```ts
export async function getStaticPaths() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}
```

Uses `render(post)` from `astro:content` to render the markdown body into `<Content />`.

**`[slug].png.ts` → `/og/{slug}.png`**

Same pattern — iterates published posts, generates a 1200×630 PNG via Satori per post:

```ts
export async function getStaticPaths() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}
```

### Static API routes

**`og.png.ts` → `/og.png`** — homepage OG image. Calls
`renderOgImage(SITE_TITLE, '', { isHomepage: true })` and returns `image/png` response.

**`rss.xml.ts` → `/rss.xml`** — RSS feed using `@astrojs/rss`. Maps posts to items with
title, pubDate, description, link.

### Index page (`index.astro`)

Queries `getPublishedPosts()` and renders a list of links. Each link:

```html
<a href={`/posts/${post.id}`}>
  <span class="post-title">{post.data.title}</span>
  <!-- dotted separator -->
  <time datetime={toISODate(post.data.date)}>{formatDate(post.data.date)}</time>
</a>
```

Note: `trailingSlash: "never"` means links are `/posts/slug` (no trailing slash).

### Meta & SEO

All metadata is set in `Layout.astro` via props:

- `title` (page title + `— jojo's thoughts` suffix on subpages)
- `description` (per-page; falls back to `SITE_DESCRIPTION`)
- `ogImage` (per-page; home uses `/og.png`, posts use `/og/{slug}.png`)
- `canonical` URL = `Astro.url.href`
- Twitter card: `summary_large_image`
- JSON-LD structured data on post pages (`BlogPosting` schema)
- RSS discovery link

### Middleware

None. No `src/middleware.ts`.

### Redirects

None configured. No `_redirects` file.

---

## Components & layouts

### `src/layouts/Layout.astro`

The single layout shell used by all pages. Props:

```ts
interface Props {
  title?: string;           // default: SITE_TITLE
  description?: string;     // default: SITE_DESCRIPTION
  ogImage?: string;         // OG image URL (optional)
  preloadAllFonts?: boolean; // preload all 4 Charter variants (default: false)
}
```

Responsibilities:

- DOCTYPE, `<html lang="en">`, charset, viewport meta
- SEO: `<title>`, `<meta description>`, OG tags, Twitter card, canonical, RSS link
- Font loading: `@font-face` declarations for Charter (regular/italic/bold/bold-italic),
  preloads regular (always) and optionally all 4
- Dark mode: inline `<script is:inline>` that applies `.dark` class before first paint (reads
  `localStorage`), re-applies on `astro:before-swap`
- Navigation state: adds `.is-navigating` class to clicked same-origin links on
  click/touchend, removes on `astro:after-swap`
- Touch-optimized navigation: `<script>` with `navigate()` from `astro:transitions/client`,
  fires on `touchend` before `click` for zero-latency mobile transitions, with 8px deadzone
  to distinguish taps from swipe/scroll
- Layout shell: skip-to-content link, `<main>` centered with `max-w-[65ch]`, ThemeToggle in
  top-right, `<slot />`
- Imports `globals.css`, `ThemeToggle`, `ClientRouter` from `astro:transitions`

#### Navigation handling detail

Two intertwined scripts in `<head>`:

1. **Inline script** (executes before framework): handles `.is-navigating` class on click,
   dark mode application, `astro:before-swap` hook
2. **Module script** (hydrated): intercepts `touchend` on same-origin anchor links, fires
   `navigate()` from `astro:transitions/client` to skip the click round-trip on mobile

### `src/components/ThemeToggle.astro`

A single `<button>` with sun/moon SVG icons (transition between them via CSS
opacity/rotation). Script:

- On click: toggles `.dark` on `<html>`, sets `colorScheme`, persists to `localStorage`
- Re-initializes on `astro:after-swap` (View Transitions re-attachment)

**Hydration**: No `client:*` directive — the script runs as a standard module script
(Astro's default hoisting/bundling behavior). The toggle works because the script runs after
DOM load and re-binds on page transitions.

### Client-side islands

None. No `client:load`, `client:visible`, `client:idle`, `client:only` directives anywhere in
the codebase. All interactivity is vanilla JS embedded in Astro components.

### Template patterns

- Homepage (`index.astro`): `<header>` with `<h1>{SITE_TITLE}</h1>` + `<hr>`, then a `<nav>`
  with a `<ul>` of post links (title + dotted separator + date)
- Post page (`[slug].astro`): back link, `<article>` with `<h1>`, `<time>` (long date format),
  `<div class="prose">` for content, optional `authorNote`, plus `BlogPosting` JSON-LD
- 404: simple centered message with a back-home link

---

## Styling

### CSS framework

**Tailwind CSS v4** via `@tailwindcss/vite` (Vite plugin, not PostCSS). Tailwind Typography
plugin (`@tailwindcss/typography`) via `@plugin` directive. Entry point:
`src/styles/globals.css`.

### Tailwind v4 specifics

Uses CSS-first configuration (no `tailwind.config.js`):

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@custom-variant dark (.dark &);
@custom-variant hover-hover (@media (hover: hover));
```

- The `dark` variant activates when a parent has class `.dark` (set on `<html>` by the dark
  mode script).
- The `hover-hover` variant is used to avoid sticky hover states on touch devices.

Theme override for the serif font stack:

```css
@theme {
  --font-serif: var(--font-charter), "Source Serif 4", Georgia, ui-serif, serif;
}
```

CSS custom property `--font-charter` is set inline on `<html>`:
`style="--font-charter: 'Charter';"`

### Design tokens

All colors are CSS custom properties on `:root` (light) and `.dark` (dark):

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-bg` | `#FDFBF7` | `#1A1A1A` | Body background |
| `--color-text` | `#1C1917` | `#E2E2E2` | Body text |
| `--color-accent` | `#8B5E3C` | `#D4A373` | Links, underlines, quote borders |
| `--color-muted` | `#78716C` | `#A8A29E` | Timestamps, muted text, back links |
| `--color-border` | `#D6D3D1` | `#333333` | `<hr>`, separator borders |
| `--color-selection` | `rgba(139,94,60,0.2)` | `rgba(212,163,115,0.25)` | `::selection`, inline code bg, toggle hover |

All light↔dark transitions use `transition: ... 0.4s ease` for smooth theme switching.

### Typography

**Primary font**: Charter (woff2, 4 variants) — self-hosted in `src/assets/fonts/`.

- `charter-regular.woff2` (weight 400, normal)
- `charter-italic.woff2` (weight 400, italic)
- `charter-bold.woff2` (weight 700, normal)
- `charter-bold-italic.woff2` (weight 700, italic)

**Monospace font** (OG cards, timestamps): `Hack Regular` (TTF) — self-hosted in
`src/assets/fonts/hack-regular.ttf`. Used in the OG image pipeline for dates only; blog page
timestamps use `ui-monospace, Menlo, Monaco, monospace` system stack.

**Fallback stack**: `"Source Serif 4", Georgia, ui-serif, serif`

**Body**: `font-serif` class, `line-height: 1.75`, antialiased.

**Timestamps**: `font-family: ui-monospace, 'Menlo', 'Monaco', monospace` — no serif.

**Prose content** (Tailwind Typography `.prose` classes on posts —
`prose prose-lg md:prose-xl`):

- Links get transparent→accent underline animation (same pattern as homepage post titles)
- Inline code: colored bg via `--color-selection`, no backticks (prose code
  `::before/::after` content: "")
- Quote borders: `--color-accent`
- Horizontal rules and table borders: `--color-border`

### Link styling pattern

A bespoke underline-on-hover pattern used on both homepage post titles and prose links:

```css
text-decoration: underline;
text-decoration-color: transparent;
text-decoration-thickness: 1px;
text-underline-offset: 4px;
transition: text-decoration-color 0s ease-out;  /* instant on hover-off */
```

On hover (only on devices with hover): `text-decoration-color: var(--color-accent);` with
`150ms ease-out`. On `:active` / `.is-navigating`: always colored (instant, no transition
dependency on hover media query).

### Layout

- Content max-width: `max-w-[65ch]`
- Horizontal padding: `px-6 sm:px-8`
- Vertical padding: `py-24 md:py-32`
- Theme toggle positioned absolutely at `top-6 right-6 md:top-12`

---

## Deployment

### Hosting: Cloudflare Workers (static assets)

The blog is a purely static Astro site. It is hosted on **Cloudflare Workers static assets**:
Cloudflare serves the contents of `dist/` from its global edge. There is **no Cloudflare
adapter and no Worker script** — the Worker is an assets-only Worker. The custom domain
`jojo.news` is attached to the Worker via a Cloudflare custom domain.

| | Value |
|---|---|
| Hosting | Cloudflare Workers static assets (global edge) |
| CI | Tangled spindles |
| Deploy step | `wrangler deploy` |
| DNS | Cloudflare nameservers (required for a Worker custom domain) |
| Secrets | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` |

Cloudflare docs: [Workers static assets](https://developers.cloudflare.com/workers/static-assets/),
[Astro on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/),
[SSG + custom 404](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/),
[Custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/),
[Wrangler](https://developers.cloudflare.com/workers/wrangler/).

### `wrangler.jsonc`

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "jojo-news",
  "compatibility_date": "2026-10-01",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page",
    "html_handling": "drop-trailing-slash"
  }
}
```

- No `main` field → static-only Worker (no Worker invocations billed).
- `not_found_handling: "404-page"` serves `dist/404.html` (matches `src/pages/404.astro`).
- `html_handling: "drop-trailing-slash"` matches Astro's `trailingSlash: "never"`.
- The custom domain is attached via the Cloudflare dashboard. It can optionally be made
  declarative with `"routes": [{ "pattern": "jojo.news", "custom_domain": true }]` once the
  zone is active.

### Deploy command

```bash
npx --yes wrangler@latest deploy
```

`wrangler` reads `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from the environment
(injected as Tangled secrets).

### Source of truth & git remotes

The canonical repository is **GitHub** (`github.com/sakn0m/blog`). It is configured as the
`origin` remote, and `main` tracks `origin/main`, so `git push` / `git pull` target GitHub.

**Tangled** (`git@tangled.org:jojo.news/blog`) is kept as a **separate** remote: its CI builds
and deploys to Cloudflare on pushes to `main`. It also has a second `pushurl` pointing at
GitHub, so `git push tangled` mirrors to GitHub as well.

| Remote | Fetch | Push |
|--------|-------|------|
| `origin` | `https://github.com/sakn0m/blog.git` | `https://github.com/sakn0m/blog.git` |
| `tangled` | `git@tangled.org:jojo.news/blog` | `git@tangled.org:jojo.news/blog` **and** `https://github.com/sakn0m/blog.git` (dual `pushurl`) |

- Publish code: `git push` (GitHub).
- Trigger the Cloudflare deploy via Tangled: `git push tangled main`.

### CI/CD: Tangled (`tangled.org`)

Tangled is a social coding platform built on AT Protocol. CI/CD pipelines run via
**spindles** — Nix-powered CI runners. Workflows are defined in `.tangled/workflows/` at the
repo root using YAML. Docs: https://docs.tangled.org/spindles.html. There are **no GitHub
Actions** — `.github/` does not exist.

#### Workflow: `.tangled/workflows/deploy.yml`

```yaml
when:
  - event: ["push"]
    branch: ["main"]

engine: "nixery"

dependencies:
  nixpkgs:
    - nodejs
  github:NixOS/nixpkgs/nixpkgs-unstable:
    - bun

steps:
  - name: "Build"
    command: |
      export PATH="$HOME/.nix-profile/bin:$PATH"
      bun install
      bun run build

  - name: "Deploy to Cloudflare"
    command: |
      export PATH="$HOME/.nix-profile/bin:$PATH"
      npx --yes wrangler@latest deploy
```

#### Pipeline details

- **Trigger**: pushes to `main` branch
- **Engine**: `nixery` (Nix-based containerized runner — each step runs in a fresh Docker
  container with dependencies layered via Nixery, workspace shared across steps)
- **Dependencies**: `nodejs` from stable nixpkgs, `bun` from nixpkgs-unstable. Astro 7
  requires Node `>=22.12.0`, so the nixpkgs `nodejs` must resolve to 22.12+.
- **Build**: uses Bun (not npm/node) for both `install` and `build`
- **Deploy**: `wrangler deploy` uploads `dist/` as Cloudflare Workers static assets
- **Secrets**: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are configured in Tangled's
  repo settings (not committed); injected at runtime by the spindle. Do not put secrets in a
  step's `environment:` block — reference them directly.
- **Default env vars available**: `CI=true`, `TANGLED_REPO_KNOT`, `TANGLED_REPO_DID`,
  `TANGLED_REPO_SHA`, etc.
- **Workers Builds is not used** — Cloudflare's own Git integration is intentionally bypassed;
  Tangled remains the CI.

### Environment variables

- `.env` file exists at root but is **empty** (0 bytes). No `.env.example`.
- `CLOUDFLARE_API_TOKEN` — set in Tangled repo settings, consumed by `wrangler deploy`
- `CLOUDFLARE_ACCOUNT_ID` — set in Tangled repo settings, consumed by `wrangler deploy`

### DNS

The `jojo.news` zone is on **Cloudflare nameservers** (changed from Spaceship). Records that
matter:

| Name | Type | Value | Notes |
|------|------|-------|-------|
| `jojo.news` | CNAME/A | managed by Cloudflare custom domain | points to the Worker |
| `jojo.news` | TXT | `protonmail-verification=...` | email/domain verification |

There are no MX/SPF/DKIM/DMARC records today (no custom-domain email).

### Build artifacts (in `dist/`)

- Static HTML + CSS + JS + fonts
- Assets hashed by Astro (e.g. `charter-regular.Bg9AUai9.woff2`)
- `dist/_astro/` contains hashed JS bundles and font files
- `dist/sitemap-index.xml`, `dist/sitemap-0.xml` (generated by `@astrojs/sitemap`)
- `dist/rss.xml` (RSS feed)
- `dist/og.png` (homepage OG image)
- `dist/404.html` (served by Cloudflare via `not_found_handling: "404-page"`)

### External services

- **Cloudflare Workers** — static hosting + edge + TLS
- No database
- No third-party analytics or tracking (explicitly anti-tracking in site ethos per
  `public/robots.txt`)

---

## Cloudflare migration runbook

The site was migrated from its previous host to Cloudflare Workers. These are the operational
steps, kept for reference.

### Part 1 — Move the DNS zone to Cloudflare

A Worker Custom Domain requires an **active Cloudflare zone**, i.e. `jojo.news` must use
Cloudflare's nameservers.

1. Cloudflare dashboard → **Add a site** → `jojo.news` → **Free** plan.
2. Verify the imported DNS records. **This must exist:**

   | Name | Type | Value | Why |
   |---|---|---|---|
   | `jojo.news` | TXT | `"protonmail-verification=ecda0d5d3d8f779f845d39e5d105003acd7bf036"` | ProtonMail verification |

   There are **no MX/SPF/DKIM/DMARC** records today (no custom-domain email), but re-check the
   registrar list before switching.
3. In **Spaceship** → `jojo.news` → **Nameservers** → replace `launch1/launch2.spaceship.net`
   with Cloudflare's two nameservers (`david.ns.cloudflare.com`, `nora.ns.cloudflare.com`).
4. Wait until Cloudflare shows the zone as **Active**.

### Part 2 — Cloudflare account prerequisites for `wrangler`

1. Find your **Account ID**: Cloudflare dashboard → **Workers & Pages** → right sidebar (or
   **Account Home** → API section).
2. Create an **API token** with permission to deploy Workers: **My Profile → API Tokens →
   Create Token**, use the **"Edit Cloudflare Workers"** template (Account: Workers Scripts:
   Edit; Zone: Workers Routes: Edit for `jojo.news`).
3. Store both as **Tangled repo secrets**:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

You do **not** need to create the Worker in the dashboard first — `wrangler deploy` creates
it. Do **not** choose "Continue with GitHub/GitLab" — that would set up Workers Builds, which
you're replacing with Tangled.

### Part 3 — Deploy

Push to `main` on Tangled (`git push tangled main`). Tangled runs:

```
bun install
bun run build
npx --yes wrangler@latest deploy
```

On success the site is live at `https://jojo-news.<subdomain>.workers.dev` and in the
Cloudflare dashboard under Workers & Pages.

### Part 4 — Attach the custom domain `jojo.news`

After the first successful deploy and once the zone is active:

1. Cloudflare dashboard → **Workers & Pages** → `jojo-news` → **Settings** → **Domains &
   Routes** → **Add** → **Custom Domain**.
2. Enter `jojo.news` → **Add Custom Domain**.
3. Cloudflare creates the DNS record + edge certificate automatically.

Optional: once this works, add the `routes`/`custom_domain` entry to `wrangler.jsonc` so it's
declarative on every deploy.

### Part 5 — Verify

```bash
curl -sSI https://jojo.news/                       # expect server: cloudflare, 200
curl -sSI https://jojo.news/posts/what-is-this     # 200, no forced trailing slash
curl -sSI https://jojo.news/does-not-exist         # 404 served from 404.html
curl -sS  https://jojo.news/rss.xml | head
curl -sSI https://jojo.news/og.png                 # image/png
```

### Costs / limits

Free plan is sufficient. Static-asset requests are free/unlimited (no `main` = no Worker
invocations billed). Workers Builds is not used.

### Risks and mitigations

| Risk | Mitigation |
|---|---|
| Email breakage | No MX today; re-check the registrar's full record set. |
| Trailing-slash / canonical mismatch | `html_handling: "drop-trailing-slash"` (already set). |
| Deploy fails because `wrangler.jsonc` `name` ≠ dashboard Worker name | Keep both `jojo-news`. |
| Custom domain not attachable before zone active | Custom domain is dashboard-only for now; zone must be Active first. |

### Rollback

Cloudflare keeps every Worker version. To roll back a bad deploy: Cloudflare dashboard →
**Workers & Pages** → `jojo-news` → **Deployments** → select the previous version →
**Rollback**. DNS and the custom domain stay attached.

---

## Conventions & gotchas

### OG image generation pipeline

A custom pipeline generates PNG Open Graph images at build time using two fonts:

1. **Font sources**:
   - `src/assets/fonts/charter-regular.woff2` → decompressed via `wawoff2` → used for titles
     (bold weight, simulated via Satori)
   - `src/assets/fonts/hack-regular.ttf` → loaded directly (TTF) → used for dates/timestamps
     (monospace)
2. **SVG rendering**: Satori (`lib/og.ts`) creates an SVG at 1200×630
3. **PNG conversion**: sharp converts the SVG to PNG buffer
4. **Two endpoints**:
   - `src/pages/og.png.ts` → homepage OG (title only, `isHomepage: true`)
   - `src/pages/og/[slug].png.ts` → per-post OG (title + formatted date)
5. **Colors** match blog design tokens: bg `#FDFBF7`, text `#1C1917`, date `#78716C`

**Gotcha**: Only TTF fonts work reliably with Satori. Woff2 decompression via `wawoff2` works
for Charter but not for some other fonts (e.g., Fira Code failed). Always test new font
formats at build time. The Hack TTF was sourced from GitHub releases.

**Gotcha**: `og-font.ts` uses `path.resolve('./src/assets/fonts/...')` — relies on Astro
setting CWD to project root at build time.

### Bun syntax quirks

The `bun` runtime (used in Tangled CI) is stricter than Node for certain TS patterns:

- **No `|| undefined` at end of expression**: `expr || undefined` after a chain fails. Use
  `if/else` or `let` with assignment instead.
- **No mixed `??` + `||`**: Combining nullish coalescing with logical OR in the same
  expression can fail. Use explicit `if/else` blocks.

### Bun for builds

The Tangled deploy uses `bun install` and `bun run build` — not npm. The `package-lock.json`
is npm's format. If dependencies drift between bun and npm resolutions, builds might fail.
Keep `package-lock.json` in sync.

### Dark mode implementation detail

The dark mode flash-prevention script uses `<script is:inline>` to set `.dark` class before
paint. It also hooks `astro:before-swap` to re-apply the theme on View Transitions. This
means:

- Never remove the `is:inline` attribute on the dark mode script
- The ThemeToggle component re-binds on `astro:after-swap` — both pieces are needed

### Draft filtering convention

`src/lib/posts.ts` checks `import.meta.env.PROD` to filter drafts — not a manual flag or env
var. This means every consumer of posts must use `getPublishedPosts()` rather than calling
`getCollection('posts')` directly (the index, post page, OG routes, and RSS feed all use it).

### Post slug = filename stem

No `slug` frontmatter field. The post's URL slug is its filename without `.md`. To change a
post's URL, rename the file. No redirects will be generated automatically.

### No adapter configured

`astro.config.mjs` has no `adapter` option. This means the default `static` mode. If switching
to SSR/hybrid mode in the future, you'll need to add an adapter and potentially adjust the OG
image generation (currently prerendered at build time via `getStaticPaths`).

### Navigation state class: `.is-navigating`

A custom pattern: when user clicks/taps a same-origin link, `.is-navigating` is added to the
link before the View Transition starts, so the link immediately shows its active state (accent
underline color). It's cleared on `astro:after-swap` and `touchcancel`. This bridging between
tap/click and View Transition completion is custom and would need careful handling if
navigation behavior changes.

### `robots.txt` — AI crawler blocking

`public/robots.txt` explicitly blocks major AI/LLM bots (GPTBot, ChatGPT-User, CCBot,
Google-Extended, anthropic/claude bots, PerplexityBot, etc.) while allowing all other
crawlers. Adding new bot user-agents goes here.

### Astro 7 notes (upgraded from 6.1.5)

The blog runs Astro 7, which changed several defaults:

- **Vite 8** — `@tailwindcss/vite` must be `^4.3.3` or newer (earlier 4.x capped the peer at
  Vite ^7). `astro.config.mjs` vite plugins are otherwise unchanged.
- **Rust compiler** — Astro 7 replaced the Go compiler with a Rust one that is stricter about
  invalid HTML (unclosed non-void tags now error; invalid nesting is no longer
  auto-corrected). Templates must be well-formed. Void elements (`<meta>`, `<link>`, `<hr>`,
  `<br>`, `<img>`, `<path>`, `<circle>`) do not need closing tags.
- **Markdown processor** — Astro 7 renders Markdown with **Sätteri** (native, GFM +
  smart punctuation) instead of remark/rehype. The blog uses no remark/rehype plugins, so nothing to
  port. If plugins are ever needed, install `@astrojs/markdown-remark` and set
  `markdown.processor: unified()`.
- **`compressHTML`** — Astro 7 defaults to `'jsx'` (strips whitespace between inline
  elements). This project sets `compressHTML: true` explicitly to preserve the pre-v7
  rendering.
- **`src/fetch.ts` is reserved** for advanced routing config — do not create one for another
  purpose (`fetchFile: null` disables it).
- **Zod** — import `z` from `astro/zod`, not from `astro:content` (deprecated since v6).
- **Node** — Astro 7 requires Node `>=22.12.0` (local and CI). Vite 8 also requires a modern
  Node.

### `.env` file

Empty file at root. No `.env.example`. Secrets are configured in Tangled's repo settings
(never committed):

- `CLOUDFLARE_API_TOKEN` — Cloudflare Workers deploy authentication
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account for `wrangler deploy`

### Minimal dependencies

The project is deliberately light:

- 6 runtime dependencies: astro, @astrojs/rss, @astrojs/sitemap, satori, sharp, wawoff2
- 4 devDependencies: @tailwindcss/typography, @tailwindcss/vite, tailwindcss, typescript
- No UI framework, no CMS, no analytics

### Remotes

GitHub is `origin` (`github.com/sakn0m/blog`) and is canonical. The `tangled` remote is kept
separately for the Cloudflare deploy pipeline and also mirrors to GitHub. See
[Source of truth & git remotes](#source-of-truth--git-remotes).

---

*Last verified: 2026-10-01 (aaffd1d)*
