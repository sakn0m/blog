# conventions-and-gotchas

## OG image generation pipeline

A custom and non-trivial pipeline generates PNG Open Graph images at build time:

1. **Font source**: `src/assets/fonts/charter-regular.woff2`
2. **Decompression**: `wawoff2` (`wawoff2.d.ts` declares the type since the module has no types) → `lib/og-font.ts` caches the decompressed `ArrayBuffer`
3. **SVG rendering**: Satori (`lib/og.ts`) creates an SVG of the title + optional subtitle at 1200×630
4. **PNG conversion**: sharp converts the SVG to PNG buffer
5. **Two endpoints**:
   - `src/pages/og.png.ts` → homepage OG (title: SITE_TITLE, no subtitle, `isHomepage: true`)
   - `src/pages/og/[slug].png.ts` → per-post OG (title: post title, subtitle: formatted date, italic)

**Gotcha**: `og-font.ts` uses `path.resolve('./src/assets/fonts/charter-regular.woff2')` — this relies on Astro setting CWD to project root at build time. If the build context changes (e.g., monorepo), this could break.

## Dark mode implementation detail

The dark mode flash-prevention script uses `<script is:inline>` to set `.dark` class before paint. It also hooks `astro:before-swap` to re-apply the theme on View Transitions. This means:
- Never remove the `is:inline` attribute on the dark mode script
- The ThemeToggle component re-binds on `astro:after-swap` — both pieces are needed

## Draft filtering convention

`src/lib/posts.ts` checks `import.meta.env.PROD` to filter drafts — not a manual flag or env var. This means every consumer of posts must use `getPublishedPosts()` rather than calling `getCollection('posts')` directly (the index, post page, OG routes, and RSS feed all use it).

## Post slug = filename stem

No `slug` frontmatter field. The post's URL slug is its filename without `.md`. To change a post's URL, rename the file. No redirects will be generated automatically.

## No adapter configured

`astro.config.mjs` has no `adapter` option. This means the default `static` mode. If switching to SSR/hybrid mode in the future, you'll need to add an adapter and potentially adjust the OG image generation (currently prerendered at build time via `getStaticPaths`).

## Bun for builds

The Tangled deploy uses `bun install` and `bun run build` — not npm. The `package-lock.json` is npm's format. If dependencies drift between bun and npm resolutions, builds might fail. Keep `package-lock.json` in sync.

## robots.txt — AI crawler blocking

`public/robots.txt` explicitly blocks major AI/LLM bots (GPTBot, ChatGPT-User, CCBot, Google-Extended, anthropic/claude bots, PerplexityBot, etc.) while allowing all other crawlers. Adding new bot user-agents goes here.

## `.claude/` directory

Contains Claude Code agent settings (`settings.local.json`) with permission allowlists for bash commands. Not relevant to the Astro build but present at repo root. Gitignored.

## `.env` file

Empty file at root. No `.env.example`. The only environment variable in use is `WISP_APP_PASSWORD` (set externally in Tangled, never committed).

## Minimal dependencies

The project is deliberately light:
- Only 5 runtime dependencies (astro, @astrojs/rss, @astrojs/sitemap, satori, sharp, wawoff2)
- Only 3 devDependencies (tailwind, typescript, and typography plugin)
- No UI framework (React, Vue, Svelte, Solid)
- No CMS
- No analytics

## Navigation state class: `.is-navigating`

A custom pattern: when user clicks/taps a same-origin link, `.is-navigating` is added to the link before the View Transition starts, so the link immediately shows its active state (accent underline color). It's cleared on `astro:after-swap` and `touchcancel`. This bridging between tap/click and View Transition completion is custom and would need careful handling if navigation behavior changes.

*Last verified: 2026-06-23 (d628adf)*
