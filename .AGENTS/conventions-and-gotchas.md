# conventions-and-gotchas

## OG image generation pipeline

A custom pipeline generates PNG Open Graph images at build time using two fonts:

1. **Font sources**:
   - `src/assets/fonts/charter-regular.woff2` → decompressed via `wawoff2` → used for titles (bold weight, simulated via Satori)
   - `src/assets/fonts/hack-regular.ttf` → loaded directly (TTF) → used for dates/timestamps (monospace)
2. **SVG rendering**: Satori (`lib/og.ts`) creates an SVG at 1200×630
3. **PNG conversion**: sharp converts the SVG to PNG buffer
4. **Two endpoints**:
   - `src/pages/og.png.ts` → homepage OG (title only, `isHomepage: true`)
   - `src/pages/og/[slug].png.ts` → per-post OG (title + formatted date)
5. **Colors** match blog design tokens: bg `#FDFBF7`, text `#1C1917`, date `#78716C`

**Gotcha**: Only TTF fonts work reliably with Satori. Woff2 decompression via `wawoff2` works for Charter but not for some other fonts (e.g., Fira Code failed). Always test new font formats at build time. The Hack TTF was sourced from GitHub releases.

**Gotcha**: `og-font.ts` uses `path.resolve('./src/assets/fonts/...')` — relies on Astro setting CWD to project root at build time.

## standard.site integration

The blog publishes to AT Protocol using `@kckempf/astro-standard-site` (v1.0.7, fork for Astro 5/6 compatibility).

### Publication record gotchas

- **No `basicTheme`**: The publisher's `publishPublication()` doesn't add `$type` discriminators for theme colors (`site.standard.theme.color#rgb`), making the record invalid per the standard.site lexicon. The sync script explicitly removes `basicTheme` via a raw `putRecord` call.
- **Icon upload**: The publisher has no blob upload support. The sync script uses `AtpAgent.api.com.atproto.repo.uploadBlob()` + raw `putRecord` with `blobRes.data.blob` (must use the server response directly; reconstructing `ref: { $link }` manually drops the `$link` key).
- **DID, not handle**: Log in with the DID (`did:plc:qiyhlatbxz3cr2dch5x5o3dy`) directly to skip handle resolution and avoid extra network calls.

### Document record gotchas

- **Binding**: Documents should reference the publication AT-URI (`at://did:plc:.../site.standard.publication/rkey`) as their `site` field, not the URL. This binds them to the publication for proper verification.
- **Descriptions**: If no `description` frontmatter exists, the sync script auto-generates one from the post body (strip markdown, collapse whitespace, truncate at 300 chars + `...`). Explicit frontmatter descriptions are used as-is.

### CI pipeline gotchas

- **Steps must be in order**: Sync → Build → Deploy. The sync writes rkeys to `src/data/standard-site-records.json`, the build reads them for `<link>` tags and the well-known endpoint.
- **Tangled secrets**: Secrets are auto-injected as env vars by Tangled. Do NOT put them in the `environment:` block of a step — that overrides with the literal string. Reference them directly in the shell command (like `$WISP_APP_PASSWORD` is used).
- **Records file is ephemeral**: `standard-site-records.json` is overwritten on each CI run by querying the PDS. The repo copy is a placeholder — the live rkeys are always fetched at sync time.

## Bun syntax quirks

The `bun` runtime (used in Tangled CI) is stricter than Node for certain TS patterns:

- **No `|| undefined` at end of expression**: `expr || undefined` after a chain fails. Use `if/else` or `let` with assignment instead.
- **No mixed `??` + `||`**: Combining nullish coalescing with logical OR in the same expression can fail. Use explicit `if/else` blocks.

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

Empty file at root. No `.env.example`. Two secrets are configured in Tangled's repo settings (never committed):
- `WISP_APP_PASSWORD` — Wisp deploy authentication
- `ATPROTO_APP_PASSWORD` — Bluesky app password for standard.site publishing

## Minimal dependencies

The project is deliberately light:
- 7 runtime dependencies: astro, @astrojs/rss, @astrojs/sitemap, @kckempf/astro-standard-site, satori, sharp, wawoff2
- 3 devDependencies: @tailwindcss/typography, @tailwindcss/vite, tailwindcss, typescript
- No UI framework, no CMS, no analytics

## Navigation state class: `.is-navigating`

A custom pattern: when user clicks/taps a same-origin link, `.is-navigating` is added to the link before the View Transition starts, so the link immediately shows its active state (accent underline color). It's cleared on `astro:after-swap` and `touchcancel`. This bridging between tap/click and View Transition completion is custom and would need careful handling if navigation behavior changes.

*Last verified: 2026-06-23 (d82bfe7)*
