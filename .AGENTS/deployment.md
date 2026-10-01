# deployment

## Hosting: Cloudflare Workers (static assets)

The blog is a purely static Astro site. It is hosted on **Cloudflare Workers static assets**:
Cloudflare serves the contents of `dist/` from its global edge. There is **no Cloudflare
adapter and no Worker script** — the Worker is an assets-only Worker. The custom domain
`jojo.news` is attached to the Worker via a Cloudflare custom domain.

- **Domain**: `jojo.news` (zone is on Cloudflare nameservers; custom domain managed by Cloudflare)
- **Deploy tool**: `wrangler` CLI
- **Worker name**: `jojo-news`
- **Config**: `wrangler.jsonc` at the repo root
- **Docs**: https://developers.cloudflare.com/workers/static-assets/

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

- No `main` field → static-only Worker.
- `not_found_handling: "404-page"` serves `dist/404.html` for unknown routes.
- `html_handling: "drop-trailing-slash"` matches Astro's `trailingSlash: "never"`.
- The custom domain is attached via the Cloudflare dashboard. It can optionally be made
  declarative with `"routes": [{ "pattern": "jojo.news", "custom_domain": true }]` once the
  zone is active.

### Deploy command (from workflow)

```bash
npx --yes wrangler@latest deploy
```

`wrangler` reads `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from the environment
(injected as Tangled secrets).

## Source of truth & git remotes

The canonical repository is on **Tangled** (`git@tangled.org:jojo.news/blog`). A GitHub repository (`github.com/sakn0m/blog`) exists only as a **mirror** — it holds no CI/CD and is not used for deployment.

Configured remotes in the local clone:

| Remote | Fetch | Push |
|--------|-------|------|
| `tangled` | `git@tangled.org:jojo.news/blog` | `git@tangled.org:jojo.news/blog` **and** `https://github.com/sakn0m/blog.git` (dual `pushurl`) |
| `github` | `https://github.com/sakn0m/blog.git` | `https://github.com/sakn0m/blog.git` |

Because `tangled` has two `pushurl` entries, `git push tangled` sends the same commit to both Tangled and GitHub. The Tangled push triggers the deploy pipeline; the GitHub push is a backup/mirror only. To drop the mirror, remove the second `pushurl`:

```bash
git remote set-url --delete --push tangled https://github.com/sakn0m/blog.git
```

## Retired: Wisp hosting

The blog was previously hosted on **Wisp** (`wisp.place`), a decentralized static host built on
the AT Protocol (files stored as a `place.wisp.fs` record in the PDS, served by Wisp cache
nodes). Hosting moved to Cloudflare for performance: the Wisp serving node for `jojo.news` was
in California while the audience/PDS are in Europe. See `docs/wisp-hosting-performance.md` for
the full investigation and `docs/cloudflare-workers-migration.md` for the migration steps.

Wisp is no longer part of the deployment, but ATProto publishing continues (see below).

## Retired: Keystatic CMS

The blog was previously editable through a self-hosted **Keystatic** CMS at `cms.jojo.news` (separate repo `github.com/sakn0m/keystatic-blog`, deployed to Vercel). That CMS has been decommissioned. Content is now authored as markdown directly in `src/content/posts/` (see `docs/guide.md`).

## CI/CD: Tangled (`tangled.org`)

Tangled is a social coding platform built on AT Protocol. CI/CD pipelines run via **spindles** — Nix-powered CI runners. Workflows are defined in `.tangled/workflows/` at the repo root using YAML.

- **Docs**: https://docs.tangled.org/spindles.html
- **No GitHub Actions** — `.github/` does not exist.

### Workflow: `.tangled/workflows/deploy.yml`

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
  - name: "Sync to ATProto"
    command: |
      export PATH="$HOME/.nix-profile/bin:$PATH"
      bun install
      bun run scripts/sync-to-atproto.ts

  - name: "Build"
    command: |
      export PATH="$HOME/.nix-profile/bin:$PATH"
      bun run build

  - name: "Deploy to Cloudflare"
    command: |
      export PATH="$HOME/.nix-profile/bin:$PATH"
      npx --yes wrangler@latest deploy
```

### Pipeline details

- **Trigger**: pushes to `main` branch
- **Engine**: `nixery` (Nix-based containerized runner — each step runs in a fresh Docker container with dependencies layered via Nixery, workspace shared across steps)
- **Dependencies**: `nodejs` from stable nixpkgs, `bun` from nixpkgs-unstable. Astro 7 requires Node `>=22.12.0`, so the nixpkgs `nodejs` must resolve to 22.12+.
- **Build**: uses Bun (not npm/node) for both `install` and `build`
- **Deploy**: `wrangler deploy` uploads `dist/` as Cloudflare Workers static assets
- **Secrets**: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `ATPROTO_APP_PASSWORD` are configured in Tangled's repo settings (not committed); injected at runtime by the spindle. Do not put secrets in a step's `environment:` block — reference them directly (wrangler reads the Cloudflare vars from the environment).
- **Default env vars available**: `CI=true`, `TANGLED_REPO_KNOT`, `TANGLED_REPO_DID`, `TANGLED_REPO_SHA`, etc. (see Tangled docs for full list)
- **Workers Builds is not used** — Cloudflare's own Git integration is intentionally bypassed; Tangled remains the CI.

## Environment variables

- `.env` file exists at root but is **empty** (0 bytes). No `.env.example`.
- `CLOUDFLARE_API_TOKEN` — set in Tangled repo settings, consumed by `wrangler deploy`
- `CLOUDFLARE_ACCOUNT_ID` — set in Tangled repo settings, consumed by `wrangler deploy`
- `ATPROTO_APP_PASSWORD` — set in Tangled repo settings, consumed by the ATProto sync script

## DNS

The `jojo.news` zone is on **Cloudflare nameservers** (changed from Spaceship). Records that
matter:

| Name | Type | Value | Notes |
|------|------|-------|-------|
| `jojo.news` | CNAME/A | managed by Cloudflare custom domain | points to the Worker |
| `_atproto.jojo.news` | TXT | `did=did:plc:qiyhlatbxz3cr2dch5x5o3dy` | **critical** — verifies the ATProto/Bluesky handle |
| `jojo.news` | TXT | `protonmail-verification=...` | email/domain verification |

## standard.site integration

This blog publishes its posts to the AT Protocol using the [standard.site](https://standard.site/) lexicon, enabling federated discovery and enhanced Bluesky link previews. This is independent of hosting and continues to run in the Tangled pipeline.

**Package**: `@kckempf/astro-standard-site` (^1.1.7, fork for Astro 6/7 + Zod 4 compatibility)

### Architecture

- **Publication record** (`site.standard.publication`): represents the blog itself — name, URL, description, colors. One per site. DID: `did:plc:qiyhlatbxz3cr2dch5x5o3dy`.
- **Document records** (`site.standard.document`): one per blog post, with title, date, path. rkeys are auto-generated TIDs by the PDS.
- **rkey storage**: `src/data/standard-site-records.json` — git-tracked JSON mapping slugs to rkeys. Populated by the sync script, read by Astro at build time for `<link>` tags.
- **Well-known endpoint**: `src/pages/.well-known/site.standard.publication.ts` → `/.well-known/site.standard.publication` serves the publication's AT-URI, proving domain ownership.
- **Link tags**: each post page includes `<link rel="site.standard.document" href="at://...">` for document verification.
- **Sync script**: `scripts/sync-to-atproto.ts` — runs before each build in CI, creates/updates publication and document records, writes rkeys to the JSON file. The author's PDS is `https://eurosky.social`.

### Deploy flow

```
git push main → Tangled knot
  → spindle picks up pipeline
    → Step 1 (Sync): bun install, sync-to-atproto.ts → updates JSON + ATProto records
    → Step 2 (Build): astro build → reads JSON for link tags → dist/
    → Step 3 (Deploy): wrangler deploy → Cloudflare Workers static assets → global edge
```

## Build artifacts (in `dist/`)

- Static HTML + CSS + JS + fonts
- Assets hashed by Astro (e.g. `charter-regular.Bg9AUai9.woff2`)
- `dist/_astro/` contains hashed JS bundles and font files
- `dist/sitemap-index.xml`, `dist/sitemap-0.xml` (generated by `@astrojs/sitemap`)
- `dist/rss.xml` (RSS feed)
- `dist/og.png` (homepage OG image)
- `dist/.well-known/site.standard.publication` (text/plain, AT-URI for verification)
- `dist/404.html` (served by Cloudflare via `not_found_handling: "404-page"`)

## External services

- **Cloudflare Workers** — static hosting + edge + TLS
- No database
- No third-party analytics or tracking (explicitly anti-tracking in site ethos per `public/robots.txt`)

*Last verified: 2026-10-01 (aaffd1d)*
