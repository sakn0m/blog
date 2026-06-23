# deployment

## Hosting: Wisp (`wisp.place`)

Wisp is a decentralized static site hosting platform built on the **AT Protocol**. Your site's files are stored as `place.wisp.fs` records in an AT Protocol repository (PDS). Hosting services watch the AT Protocol firehose, cache the files, and serve them with CDN-like performance. The PDS is the source of truth; hosting servers are read-only caches.

- **Domain**: `jojo.news` (custom domain mapped via DNS TXT record)
- **Deploy tool**: `wispctl` CLI
- **Docs**: https://docs.wisp.place

### wispctl deploy command (from workflow)

```bash
npx --yes wispctl@latest deploy "$WISP_HANDLE" \
  --path "$SITE_PATH" \
  --site "$SITE_NAME" \
  --password "$WISP_APP_PASSWORD"
```

- `WISP_HANDLE`: `jojo.news` (the domain/handle on Wisp)
- `SITE_PATH`: `dist` (the directory to upload)
- `SITE_NAME`: `blog` (site identifier within the handle)
- `WISP_APP_PASSWORD`: secret stored in Tangled's pipeline secrets (OpenBao-backed)

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

environment:
  SITE_PATH: "dist"
  SITE_NAME: "blog"
  WISP_HANDLE: "jojo.news"

steps:
  - name: "Sync to ATProto"
    command: |
      export PATH="$HOME/.nix-profile/bin:$PATH"
      bun install
      bun run scripts/sync-to-atproto.ts
    environment:
      ATPROTO_APP_PASSWORD: "$ATPROTO_APP_PASSWORD"

  - name: "Build"
    command: |
      export PATH="$HOME/.nix-profile/bin:$PATH"
      bun run build

  - name: "Deploy to Wisp"
    command: |
      export PATH="$HOME/.nix-profile/bin:$PATH"
      npx --yes wispctl@latest deploy "$WISP_HANDLE" \
        --path "$SITE_PATH" \
        --site "$SITE_NAME" \
        --password "$WISP_APP_PASSWORD"
```

### Pipeline details

- **Trigger**: pushes to `main` branch
- **Engine**: `nixery` (Nix-based containerized runner — each step runs in a fresh Docker container with dependencies layered via Nixery, workspace shared across steps)
- **Dependencies**: `nodejs` from stable nixpkgs, `bun` from nixpkgs-unstable
- **Build**: uses Bun (not npm/node) for both `install` and `build`
- **Secrets**: `WISP_APP_PASSWORD` and `ATPROTO_APP_PASSWORD` are configured in Tangled's repo settings (not committed); injected at runtime by the spindle. Tangled uses OpenBao for secrets management on the spindle.
- **Default env vars available**: `CI=true`, `TANGLED_REPO_KNOT`, `TANGLED_REPO_DID`, `TANGLED_REPO_SHA`, etc. (see Tangled docs for full list)

## Environment variables

- `.env` file exists at root but is **empty** (0 bytes). No `.env.example`.
- `WISP_APP_PASSWORD` — set in Tangled repo settings, consumed by `wispctl deploy`
- `ATPROTO_APP_PASSWORD` — set in Tangled repo settings, consumed by the ATProto sync script

## standard.site integration

This blog publishes its posts to the AT Protocol using the [standard.site](https://standard.site/) lexicon, enabling federated discovery and enhanced Bluesky link previews.

**Package**: `@kckempf/astro-standard-site` (v1.0.7, fork for Astro 5/6 compatibility)

### Architecture

- **Publication record** (`site.standard.publication`): represents the blog itself — name, URL, description, colors. One per site. DID: `did:plc:qiyhlatbxz3cr2dch5x5o3dy`.
- **Document records** (`site.standard.document`): one per blog post, with title, date, path. rkeys are auto-generated TIDs by the PDS.
- **rkey storage**: `src/data/standard-site-records.json` — git-tracked JSON mapping slugs to rkeys. Populated by the sync script, read by Astro at build time for `<link>` tags.
- **Well-known endpoint**: `src/pages/.well-known/site.standard.publication.ts` → `/.well-known/site.standard.publication` serves the publication's AT-URI, proving domain ownership.
- **Link tags**: each post page includes `<link rel="site.standard.document" href="at://...">` for document verification.
- **Sync script**: `scripts/sync-to-atproto.ts` — runs before each build in CI, creates/updates publication and document records, writes rkeys to the JSON file.

### Deploy flow

```
git push main → Tangled knot
  → spindle picks up pipeline
    → Step 1 (Sync): bun install, sync-to-atproto.ts → updates JSON + ATProto records
    → Step 2 (Build): astro build → reads JSON for link tags → dist/
    → Step 3 (Deploy): wispctl deploy dist/ → Wisp → PDS → CDN
```

## Build artifacts (in `dist/`)

- Static HTML + CSS + JS + fonts
- Assets hashed by Astro (e.g. `charter-regular.Bg9AUai9.woff2`)
- `dist/_astro/` contains hashed JS bundles and font files
- `dist/sitemap-index.xml`, `dist/sitemap-0.xml` (generated by `@astrojs/sitemap`)
- `dist/rss.xml` (RSS feed)
- `dist/og.png` (homepage OG image)
- `dist/.well-known/site.standard.publication` (text/plain, AT-URI for verification)

## No external services

- No object storage (R2, S3, etc.)
- No database
- No third-party analytics or tracking (explicitly anti-tracking in site ethos per `public/robots.txt`)

*Last verified: 2026-06-23 (d628adf)*

