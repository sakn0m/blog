# Deploying jojo.news to Cloudflare Workers — Tangled as CI

> Based on Cloudflare's current docs (checked 2026-10-01):
> - Workers static assets: <https://developers.cloudflare.com/workers/static-assets/>
> - Astro on Workers: <https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/>
> - SSG + custom 404: <https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/>
> - Custom domains: <https://developers.cloudflare.com/workers/configuration/routing/custom-domains/>
> - Wrangler: <https://developers.cloudflare.com/workers/wrangler/>

**Architecture:** the blog is a purely static Astro site. **Tangled** runs the CI pipeline
(sync to ATProto → build), and the final step runs `wrangler deploy` to publish `./dist` to
**Cloudflare Workers static assets**. No Cloudflare adapter and no Worker code are needed.

---

## Configuration

| | Value |
|---|---|
| Hosting | Cloudflare Workers static assets (global edge) |
| CI | Tangled spindles |
| Deploy step | `wrangler deploy` |
| DNS | Cloudflare nameservers (required for a Worker custom domain) |
| ATProto `standard.site` publishing | `scripts/sync-to-atproto.ts` (unchanged) |
| Secrets | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `ATPROTO_APP_PASSWORD` |

The ATProto/Bluesky side is independent of hosting: `sync-to-atproto.ts` writes to the PDS
regardless of where the HTML is served.

---

## Already done in the repo

- **`wrangler.jsonc`** added at the repo root:

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

  - No `main` / no adapter → static-only Worker serving `./dist`.
  - `not_found_handling: "404-page"` serves `dist/404.html` (matches `src/pages/404.astro`).
  - `html_handling: "drop-trailing-slash"` matches Astro's `trailingSlash: "never"`.
  - The **custom domain is intentionally not in this file** yet, so the first deploys don't fail
    if the Cloudflare zone isn't active. It's added in the dashboard later (Part 4). Once the
    zone is active you can move it here as `"routes": [{ "pattern": "jojo.news", "custom_domain": true }]`.

- **`.tangled/workflows/deploy.yml`** final step:

  ```yaml
  - name: "Deploy to Cloudflare"
    command: |
      export PATH="$HOME/.nix-profile/bin:$PATH"
      npx --yes wrangler@latest deploy
  ```

  `wrangler` reads `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from the environment
  (Tangled injects secrets automatically; do not put them in an `environment:` block).

---

## Part 1 — Move the DNS zone to Cloudflare

A Worker Custom Domain requires an **active Cloudflare zone**, i.e. `jojo.news` must use
Cloudflare's nameservers.

1. Cloudflare dashboard → **Add a site** → `jojo.news` → **Free** plan.
2. Verify the imported DNS records. **These must exist:**
   | Name | Type | Value | Why |
   |---|---|---|---|
   | `_atproto.jojo.news` | TXT | `"did=did:plc:qiyhlatbxz3cr2dch5x5o3dy"` | **CRITICAL** — verifies the `jojo.news` Bluesky/ATProto handle |
   | `jojo.news` | TXT | `"protonmail-verification=ecda0d5d3d8f779f845d39e5d105003acd7bf036"` | ProtonMail verification |
   There are **no MX/SPF/DKIM/DMARC** records today (no custom-domain email), but re-check the
   registrar list before switching.
3. In **Spaceship** → `jojo.news` → **Nameservers** → replace `launch1/launch2.spaceship.net`
   with Cloudflare's two nameservers (`david.ns.cloudflare.com`, `nora.ns.cloudflare.com`).
4. Wait until Cloudflare shows the zone as **Active**.

---

## Part 2 — Cloudflare account prerequisites for `wrangler`

1. Find your **Account ID**: Cloudflare dashboard → **Workers & Pages** → right sidebar
   (or **Account Home** → API section).
2. Create an **API token** with permission to deploy Workers:
   **My Profile → API Tokens → Create Token**, use the **"Edit Cloudflare Workers"** template
   (Account: Workers Scripts: Edit; Zone: Workers Routes: Edit for `jojo.news`).
3. Store both as **Tangled repo secrets**:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   (Repo settings → secrets.)
4. Keep `ATPROTO_APP_PASSWORD`.

You do **not** need to create the Worker in the dashboard first — `wrangler deploy` creates it.
On Cloudflare's **"Create an app"** screen you can skip it entirely. (If you prefer to see the
Worker first, click **Start with Hello World!**, name it `jojo-news`, then let the next Tangled
deploy overwrite it.) Do **not** choose "Continue with GitHub/GitLab" — that would set up
Workers Builds, which you're replacing with Tangled.

---

## Part 3 — Deploy

Push to `main` (your normal `git push tangled` flow). Tangled runs:

```
bun install
bun run scripts/sync-to-atproto.ts
bun run build
npx --yes wrangler@latest deploy
```

Watch the Tangled logs. On success the site is live at `https://jojo-news.<subdomain>.workers.dev`
and in the Cloudflare dashboard under Workers & Pages.

---

## Part 4 — Attach the custom domain `jojo.news`

After the first successful deploy and once the zone is active:

1. Cloudflare dashboard → **Workers & Pages** → `jojo-news` → **Settings** →
   **Domains & Routes** → **Add** → **Custom Domain**.
2. Enter `jojo.news` → **Add Custom Domain**.
3. Cloudflare creates the DNS record + edge certificate automatically.

(Optional: once this works, add the `routes`/`custom_domain` entry to `wrangler.jsonc` so it's
declarative on every deploy.)

---

## Part 5 — Verify

```bash
curl -sSI https://jojo.news/                       # expect server: cloudflare, 200
curl -sSI https://jojo.news/posts/what-is-this     # 200, no forced trailing slash
curl -sSI https://jojo.news/does-not-exist         # 404 served from 404.html
curl -sS  https://jojo.news/rss.xml | head
curl -sS  https://jojo.news/.well-known/site.standard.publication
curl -sSI https://jojo.news/og.png                 # image/png
dig +short TXT _atproto.jojo.news                  # must still return did=did:plc:...
```

Also confirm in the Tangled logs that the ATProto sync succeeded and (optionally) that a new
post publishes correctly to Bluesky/standard.site.

---

## Costs / limits

- Free plan is sufficient. Static-asset requests are free/unlimited (no `main` = no Worker
  invocations billed). Workers Builds is not used.

---

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Losing `_atproto` TXT → broken `jojo.news` handle | Recreate/verify it in Cloudflare before switching NS. |
| Email breakage | No MX today; re-check the registrar's full record set. |
| Trailing-slash / canonical mismatch | `html_handling: "drop-trailing-slash"` (already set). |
| Deploy fails because `wrangler.jsonc` `name` ≠ dashboard Worker name | Keep both `jojo-news`. |
| Custom domain not attachable before zone active | Custom domain is dashboard-only for now; zone must be Active first. |

---

## Rollback

Cloudflare keeps every Worker version. To roll back a bad deploy: Cloudflare dashboard →
**Workers & Pages** → `jojo-news` → **Deployments** → select the previous version → **Rollback**.
DNS and the custom domain stay attached.
