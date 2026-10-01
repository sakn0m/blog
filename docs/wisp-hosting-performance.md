# Briefing: jojo.news hosting architecture and latency investigation

> **Purpose of this document.** This is a self-contained technical briefing written so that
> another AI assistant (or engineer) with no prior context can understand the entire setup,
> reproduce the measurements, and answer follow-up questions about *why the blog is slower
> than the author's other site, and what can be done about it*.
>
> It intentionally includes raw evidence (IPs, DNS records, HTTP headers, timing numbers,
> commands) rather than only conclusions. Facts verified by measurement are marked
> **[VERIFIED]**; inferences are marked **[INFERRED]**; things not yet confirmed are marked
> **[OPEN]**. Nothing here should be treated as a Wisp/ATProto specification — it is an
> observed snapshot taken on **2026-10-01** from a client located in **Italy**.

---

## Table of contents

1. [TL;DR / executive summary](#1-tldr--executive-summary)
2. [The two websites being compared](#2-the-two-websites-being-compared)
3. [Cast of characters: identifiers and endpoints](#3-cast-of-characters-identifiers-and-endpoints)
4. [How the blog is built and deployed (CI/CD)](#4-how-the-blog-is-built-and-deployed-cicd)
5. [What the AT Protocol and a PDS are](#5-what-the-at-protocol-and-a-pds-are)
6. [What Wisp is and how it works internally](#6-what-wisp-is-and-how-it-works-internally)
7. [DNS: registrar, nameservers, and records](#7-dns-registrar-nameservers-and-records)
8. [The latency investigation: method and raw data](#8-the-latency-investigation-method-and-raw-data)
9. [Root-cause analysis](#9-root-cause-analysis)
10. [The candidate fix and evidence it works](#10-the-candidate-fix-and-evidence-it-works)
11. [Alternative fixes and trade-offs](#11-alternative-fixes-and-trade-offs)
12. [Repo-side optimizations (micro)](#12-repo-side-optimizations-micro)
13. [Risks, caveats, and open questions](#13-risks-caveats-and-open-questions)
14. [Glossary](#14-glossary)
15. [Appendix A: raw commands and outputs](#appendix-a-raw-commands-and-outputs)
16. [Appendix B: Blog toolchain snapshot](#appendix-b-blog-toolchain-snapshot)

---

## 1. TL;DR / executive summary

- The blog **jojo.news** is an Astro static site deployed to **Wisp** (`wisp.place`), a
  decentralized static-host built on the **AT Protocol**.
- The author also runs **giorgiovanini.eu**, a static site on **Vercel**, and observes it is
  "a tiny bit slower" on the blog. Measurement shows the blog's first-byte time is roughly
  **5× slower** from Italy (~0.60 s vs ~0.11 s TTFB).
- **This is not caused by the blog's code, assets, or the Astro upgrade.** The blog is
  actually *lighter* than the other site (2.3 KB gzipped HTML vs 3.7 KB).
- **Root cause:** Wisp separates *storage* (the author's PDS, which is in **Germany**) from
  *serving* (one or more Wisp **hosting nodes**). The DNS A record for `jojo.news` points to
  a Wisp hosting node in **California, USA**. Every request therefore crosses the Atlantic.
  Vercel, by contrast, serves giorgiovanini.eu from an edge node in **Frankfurt**, ~20 ms away.
- **A European Wisp hosting node exists** (`sites.wisp.place` → `152.53.121.97`, netcup,
  **Nuremberg, Germany**). It already serves `jojo.news` **byte-for-byte identically** with a
  valid TLS certificate, at **~0.11 s TTFB** — same as Vercel.
- **Proposed fix:** change the `jojo.news` **A record** at the DNS provider (Spaceship) from
  `152.44.44.138` to `152.53.121.97`. No code change required. [OPEN] Confirm with Wisp that
  pointing a custom domain at the EU `sites` node is a supported configuration.

---

## 2. The two websites being compared

| Property | **jojo.news** (the blog) | **giorgiovanini.eu** (the baseline) |
|---|---|---|
| Source repo (local) | `/Users/giorgiovanini/repos/blog` | `/Users/giorgiovanini/repos/PersonalWebsite` |
| Framework | **Astro 7.3.5** (Vite 8, Sätteri markdown) | **Astro 5.7.x** |
| Hosting | **Wisp** (decentralized, ATProto-backed) | **Vercel** |
| CI/CD | **Tangled** spindles (Nix CI) → Wisp | Vercel Git integration |
| Canonical repo | `git@tangled.org:jojo.news/blog` | GitHub (`sakn0m/PersonalWebsite`) |
| GitHub mirror | `github.com/sakn0m/blog` (secondary pushurl) | n/a |
| Client JS bundles | 3 small bundles (~1.2 KB total, View Transitions) | 0 external bundles |
| Fonts | Self-hosted Charter woff2 (4 files) | @fontsource (Syne, Space Grotesk, Space Mono) |
| HTML size (over the wire) | **2,293 bytes gzip** | 3,684 bytes brotli |
| Compression | gzip | brotli |
| Server header | `via: 1.1 Caddy`, `x-cache-tier: …` | `server: Vercel`, `x-vercel-cache: HIT` |
| Measured TTFB (from Italy) | **~0.52–0.65 s** | **~0.10–0.19 s** |

The blog is a deliberately minimal, text-focused site. It has: a homepage (list of posts),
post pages, a 404, an RSS feed, auto-generated OG images (PNG via Satori + sharp), a sitemap,
and a `standard.site` (ATProto) integration. No analytics, no tracking, no UI framework.

---

## 3. Cast of characters: identifiers and endpoints

These are the real values involved. An AI answering follow-ups should treat these as ground truth.

| Thing | Value | Notes |
|---|---|---|
| Blog domain | `jojo.news` | apex domain used both as site URL and as ATProto handle |
| ATProto **DID** | `did:plc:qiyhlatbxz3cr2dch5x5o3dy` | author's decentralized identifier (PLC directory) |
| Author's **PDS** | `https://eurosky.social` | Personal Data Server — stores the ATProto repo |
| PDS IP / location | `138.199.244.49` | Hetzner Online GmbH, **Gunzenhausen, Bavaria, Germany** **[VERIFIED]** |
| Wisp **handle** | `jojo.news` | handle used by `wispctl deploy` |
| Wisp **site name** | `blog` | site identifier within the handle |
| Wisp main app | `https://wisp.place` | dashboard/OAuth/upload backend; IP `84.17.59.115` (Datacamp, **Milan, Italy**) **[VERIFIED]** |
| Wisp **serving host (path-based)** | `https://sites.wisp.place` | IP `152.53.121.97` (netcup, **Nuremberg, Germany**) **[VERIFIED]** |
| Wisp hosting node currently serving jojo.news | `152.44.44.138` | UpCloud USA Inc., San Jose / Clovis, **California, US** **[VERIFIED]** |
| DNS registrar / nameservers | Spaceship | NS: `launch1.spaceship.net`, `launch2.spaceship.net` **[VERIFIED]** |
| Blog's ATProto app password secret | `ATPROTO_APP_PASSWORD` | stored in Tangled repo settings, not in the repo |
| Wisp deploy secret | `WISP_APP_PASSWORD` | stored in Tangled repo settings, not in the repo |

> Note: the blog's **canonical** storage lives in the PDS at `eurosky.social` (Germany).
> The **serving** is done by a *different* machine (a Wisp hosting node), currently in
> California. This storage/serving split is the crux of the whole investigation.

---

## 4. How the blog is built and deployed (CI/CD)

The blog is a **static site**. The build pipeline is defined in
`.tangled/workflows/deploy.yml` and runs on **Tangled** (`tangled.org`), a code-hosting
platform built on the AT Protocol whose CI runners are called **spindles**.

Workflow summary:

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

  - name: "Build"
    command: |
      export PATH="$HOME/.nix-profile/bin:$PATH"
      bun run build

  - name: "Deploy to Wisp"
    command: |
      export PATH="$HOME/.nix-profile/bin:$PATH"
      npx --yes wispctl@latest deploy "$WISP_HANDLE" \
        --path "$SITE_PATH" --site "$SITE_NAME" --password "$WISP_APP_PASSWORD"
```

End-to-end flow:

```
git push main → Tangled knot
  → spindle: bun install
  → Step 1: scripts/sync-to-atproto.ts  (publishes publication/document records to the PDS)
  → Step 2: astro build → ./dist
  → Step 3: wispctl deploy dist/ → Wisp → writes place.wisp.fs record + blobs to the PDS
              → Wisp firehose sees the record → caches the site on hosting node(s)
              → hosting node serves https://jojo.news
```

Key repo facts:

- The local clone has two remotes. `tangled` (`git@tangled.org:jojo.news/blog`) has **two
  pushurls** (`git@tangled.org:jojo.news/blog` **and** `https://github.com/sakn0m/blog.git`),
  so a single `git push` publishes to Tangled **and** mirrors to GitHub.
- There is **no GitHub Actions** and no `.github/` directory.
- Secrets (`WISP_APP_PASSWORD`, `ATPROTO_APP_PASSWORD`) are injected by Tangled at runtime.

---

## 5. What the AT Protocol and a PDS are

**AT Protocol** (ATProto) is the protocol behind Bluesky. Two ideas matter here:

1. **DIDs** — decentralized identifiers. The author is `did:plc:qiyhlatbxz3cr2dch5x5o3dy`.
   The DID document (resolvable at `https://plc.directory/<did>`) lists the user's services,
   including their **PDS**.
2. **PDS (Personal Data Server)** — the server that stores a user's data as a signed
   **repository** of **records**. Records are addressed as AT-URIs, e.g.
   `at://<did>/<collection>/<rkey>`.

The author's PDS is **`https://eurosky.social`**, hosted at **Hetzner, Germany**.
`eurosky.social` is a third-party/community PDS (the author does not self-host it) **[INFERRED]**.

The blog writes at least two kinds of records to that PDS:

- `place.wisp.fs` — the Wisp site manifest + file blobs (this is what a Wisp site *is*).
- `site.standard.publication` and `site.standard.document` — the `standard.site` lexicon,
  which federates blog posts (used for Bluesky link previews). The DID in those records is the
  same `did:plc:qiyhlatbxz3cr2dch5x5o3dy`.

**The PDS is the source of truth, but it does not serve the website to browsers.** This is
stated explicitly in Wisp's docs and confirmed by measurement (the browser's TCP connection
goes to a hosting node, not to `eurosky.social`).

---

## 6. What Wisp is and how it works internally

From the Wisp documentation (`https://docs.wisp.place/`):

> "wisp.place enables you to host static websites directly in your AT Protocol repository.
> Your Personal Data Server (PDS) holds the cryptographically signed manifest and files as the
> authoritative source of truth, while hosting services index and serve them with CDN-like
> performance."

### 6.1 The three services

| Service | Role | Listens |
|---|---|---|
| **Main backend** | OAuth, site upload/manage, custom-domain registration, admin panel. | `:8000` (behind Caddy at `wisp.place`) |
| **Firehose service** (write path) | Watches the ATProto relay/firehose for `place.wisp.fs` / `place.wisp.settings` changes; downloads blobs from the user's PDS; writes processed files to shared storage; publishes a Redis cache-invalidation event. Never serves users. | `:3002` |
| **Hosting service** (read path) | "A read-only CDN built with Hono." Resolves the site from the request hostname, reads files from **tiered storage**, applies path rewriting and `_redirects`, and serves the file. Subscribes to Redis for invalidation. | `:3001` (behind Caddy) |

### 6.2 Tiered storage (hot → warm → cold)

```
Read:   Hot (in-memory LRU) → Warm (disk) → Cold (S3/R2, or disk in dev)
```

- **Hot:** in-memory LRU, small, lost on restart.
- **Warm:** on-disk cache, survives restarts.
- **Cold:** shared S3-compatible storage (e.g. Cloudflare R2) in production.
- HTML/CSS/JS go into hot/warm/cold; large files (images, fonts) skip the hot tier.

The HTTP header `x-cache-tier: hot|warm|cold` returned by the hosting node reveals which tier
answered a request. In our tests the US node answered `hot`, the EU node `warm` (see §8).

### 6.3 Request path property (important)

> "The hosting service is read-only. ... It never resolves a DID, downloads blobs, or writes
> site data on the request path." — Wisp docs

So when a browser hits `jojo.news`, it is served entirely from the hosting node's cache. The
PDS is only touched asynchronously (firehose → cache).

### 6.4 Custom domains

- A custom domain is registered in Wisp's main backend, stored in a Postgres `domains` table.
- Ownership is proven with a DNS **TXT** record:
  `_wisp.jojo.news  TXT  "did:plc:qiyhlatbxz3cr2dch5x5o3dy"` **[VERIFIED — exists]**
  A verification worker checks every 10 minutes.
- The **A record** of the custom domain must point to a Wisp **hosting** node. Caddy on the
  hosting node does **on-demand TLS** and issues a Let's Encrypt certificate for the custom
  hostname the first time it's requested (confirmed: both nodes present a valid
  `CN=jojo.news` Let's Encrypt cert) **[VERIFIED]**.

### 6.5 Scaling model (why multiple nodes exist)

Wisp's docs describe a "Scaled" deployment: *"Run multiple hosting instances behind a load
balancer. Each has its own hot and warm tiers but shares S3 and Redis invalidation."*
This explains why the EU node can serve `jojo.news` even though the A record points at the US
node: both hosting instances share the same cold tier (S3) and the same source of truth (the
PDS), so any node can reconstruct any site. **[INFERRED, strongly supported by tests]**

---

## 7. DNS: registrar, nameservers, and records

- The domain `jojo.news` is managed at **Spaceship** (a registrar). Its nameservers are
  `launch1.spaceship.net` and `launch2.spaceship.net`. **[VERIFIED]**
- DNS records observed **[VERIFIED]**:

```
jojo.news.            A     152.44.44.138
jojo.news.            TXT   "protonmail-verification=ecda0d5d3d8f779f845d39e5d105003acd7bf036"
_wisp.jojo.news.      TXT   "did:plc:qiyhlatbxz3cr2dch5x5o3dy"
```

- There is **no CNAME** on the apex and (at the time of measurement) no other A record.
- The `protonmail-verification` TXT is unrelated (email). Do not touch it.
- The `_wisp.jojo.news` TXT is the Wisp domain-ownership proof. **Do not touch it.**
- The **A record `152.44.44.138` is the single record whose value determines which Wisp
  hosting node serves the site.** This is the record the proposed fix would change.

### 7.1 What Spaceship is *not*

Spaceship is **not** broken and is **not** the cause. It is simply the place where the address
record is stored. The problem is the *value* of the A record (which server it points to), not
the DNS provider. Analogy: Spaceship is the phone book; the phone-book entry for `jojo.news`
currently lists a slow long-distance server.

---

## 8. The latency investigation: method and raw data

### 8.1 Method

Measurements were taken with `curl` from a client in **Italy**, using `-w` timing variables:

- `time_namelookup` — DNS resolution
- `time_connect` — TCP connect
- `time_appconnect` — TLS handshake complete
- `time_starttransfer` — time to first byte (TTFB)
- `time_total` — full transfer
- `size_download` — bytes received

`--compressed` was used to observe real transfer sizes with the server's compression.
`--resolve host:443:IP` was used to force a request to a specific node while keeping the
`Host`/SNI as `jojo.news`, which is how the EU node was tested.

### 8.2 HTML timing, repeated (from Italy)

Direct `https://jojo.news/` (California node):

```
connect=0.176s tls=0.431s ttfb=0.653s total=0.656s
connect=0.263s tls=0.444s ttfb=0.623s total=0.625s
connect=0.174s tls=0.349s ttfb=0.524s total=0.524s
connect=0.180s tls=0.364s ttfb=0.640s total=0.640s
connect=0.183s tls=0.362s ttfb=0.551s total=0.551s
```

`https://jojo.news/` **forced to the German node** `152.53.121.97`:

```
connect=0.040s tls=0.083s ttfb=0.119s total=0.143s
connect=0.035s tls=0.072s ttfb=0.109s total=0.136s
connect=0.128s tls=0.169s ttfb=0.204s total=0.204s
connect=0.033s tls=0.072s ttfb=0.108s total=0.109s
connect=0.037s tls=0.074s ttfb=0.125s total=0.152s
```

`https://giorgiovanini.eu/` (Vercel, Frankfurt edge):

```
connect=0.100s tls=0.144s ttfb=0.194s total=0.194s
connect=0.078s tls=0.131s ttfb=0.169s total=0.169s
connect=0.027s tls=0.068s ttfb=0.107s total=0.107s
```

### 8.3 Packet round-trip time (ICMP ping from Italy)

```
jojo.news (152.44.44.138):   min/avg/max = 176.5 / 205.1 / 241.8 ms
giorgiovanini.eu (216.198.79.1): min/avg/max = 16.5 / 44.8 / 98.6 ms
```

### 8.4 Response headers

`jojo.news` (California node):

```
HTTP/2 200
cache-control: public, max-age=600
content-encoding: gzip
content-length: 2293
via: 1.1 Caddy
x-cache-tier: hot
```

`giorgiovanini.eu` (Vercel):

```
HTTP/2 200
server: Vercel
cache-control: public, max-age=0, must-revalidate
x-vercel-cache: HIT
content-encoding: br
content-length: 3684
```

`jojo.news` via the German node:

```
HTTP/2 200
via: 1.1 Caddy
x-cache-tier: warm
content-type: text/html
```

### 8.5 Proving the two nodes serve the same site

- HTML SHA-256 from both nodes (US direct vs EU forced) was **identical**:
  `ca5a2bb2a633bb3b14c50b1aeae1b09e2a0df6acbe0665832f197a57b9b4c63a` **[VERIFIED]**
- CSS asset returned `200`, `41747` bytes from both nodes. **[VERIFIED]**
- Font asset returned `200`, `14648` bytes from the EU node. **[VERIFIED]**
- AES/Let's Encrypt certificate for `jojo.news` is valid on both nodes:
  `subject=CN=jojo.news`, `issuer=Let's Encrypt (YE2)`, valid `Sep 15 → Dec 14 2026`. **[VERIFIED]**
- `sites.wisp.place` presents a Let's Encrypt wildcard cert `*.wisp.place`. **[VERIFIED]**

### 8.6 A note on variance

A few individual requests spiked (e.g. one HTML TTFB measured ~1.05 s; one TLS handshake to the
EU node was 0.78 s on first contact, then settled to ~0.07–0.17 s). These are consistent with
cold cache / on-demand TLS issuance / network jitter and do not change the conclusion, which
holds across repeated runs.

---

## 9. Root-cause analysis

1. **The blog's content is not the problem.** Its HTML is smaller than the baseline site's,
   its JS bundle total is ~1.2 KB, and it has no heavy third-party scripts.

2. **The dominant cost is network RTT to the origin.** The blog's requests terminate on a
   machine in **California** (~180–240 ms RTT from Italy). Every phase — TCP connect, TLS
   handshake, TTFB, and each subsequent asset request — pays that latency. The baseline
   terminates in **Frankfurt** (~10–20 ms RTT), so it is ~5–10× faster per round trip.

3. **Multiple round trips amplify it.** A first page load involves: HTML, render-blocking CSS,
   the preloaded font, and a few small JS modules. With high RTT, each adds up. This is why
   the *perceived* difference can be larger than a single TTFB number suggests.

4. **Secondary inefficiencies on the blog's origin (minor):**
   - The hashed, immutable assets (CSS, fonts) are served with `cache-control: public,
     max-age=600` (10 minutes). Vercel serves fingerprinted assets with long/immutable caching.
     This causes extra revalidations on repeat visits.
   - Compression is gzip, not brotli (marginal for tiny files).
   - CSS is an external render-blocking request rather than inlined (one extra RTT).

5. **The German node proves the latency is purely locational.** Serving the identical site
   from `152.53.121.97` (Nuremberg) yields ~0.11 s TTFB — matching Vercel — because the
   client is in Italy. The site, the cache, and the cert are all fine; only the *location of
   the serving node* differs.

**Conclusion: nothing in the blog is "done wrong." The blog is being served from a US hosting
node while the audience and the storage PDS are in Europe.**

---

## 10. The candidate fix and evidence it works

**Change the `jojo.news` A record from `152.44.44.138` (California) to `152.53.121.97`
(Nuremberg, Germany).**

Evidence it is safe:

- The EU node already serves `jojo.news` with a valid, trusted TLS certificate (Let's Encrypt
  `CN=jojo.news`). **[VERIFIED]**
- HTML from the EU node is byte-identical (same SHA-256) to the current US node. **[VERIFIED]**
- Subresources (CSS, fonts) return `200` from the EU node. **[VERIFIED]**
- TTFB drops from ~0.60 s to ~0.11 s from the test client. **[VERIFIED]**

Operational steps at Spaceship (the user must do this; it is outside the repo):

1. Open `jojo.news` → **DNS / Advanced DNS**.
2. Locate the **A** record whose value is `152.44.44.138` (host is typically `@`).
3. Change the value to `152.53.121.97`; save.
4. Leave the `_wisp.jojo.news` TXT and the ProtonMail TXT records **unchanged**.
5. Allow DNS propagation (minutes to hours). A low TTL (if set) speeds this up.

[OPEN] Before/after the switch, confirm with the Wisp maintainers that pointing a custom domain
to the `sites.wisp.place` node is intended. The docs describe multi-instance serving but do not
document per-region host selection for custom domains. Technically it works today; the
question is whether it will remain a supported target.

---

## 11. Alternative fixes and trade-offs

| Option | What it does | Pros | Cons |
|---|---|---|---|
| **A. Repoint A record to the EU Wisp node** (proposed) | Serve from `152.53.121.97` | Simplest; no code change; keeps full Wisp/ATProto architecture; ~5× faster from Europe | Ties DNS to one specific node; not officially documented; a node change by Wisp would require a DNS update; still slower than a global CDN for non-European visitors |
| **B. Cloudflare in front of Wisp** | Proxy `jojo.news` through Cloudflare (orange cloud) pointing at a Wisp node | Global edge caching; brotli; DDoS/TLS; keeps the Wisp origin | Adds a centralization layer; must configure SSL mode Full (strict) and caching rules; cache invalidation on deploy relies on `cache-control`/purge; [OPEN] interaction with Wisp's on-demand TLS |
| **C. Self-host a Wisp node in the EU** | Run Wisp's hosting service (and firehose) on an EU VPS | Full control; can place it anywhere; stays decentralized | Significant ops (Postgres, S3/R2 or disk, Redis, Caddy); not trivial |
| **D. Move off Wisp to a global CDN host** | Deploy `dist/` to Vercel/Netlify/Cloudflare Pages | Fastest/most reliable globally; trivial | Loses the decentralized ATProto/Wisp property entirely; changes the whole deployment philosophy |
| **E. Do nothing** | Keep California node | No work | Persistent ~0.5 s penalty for European visitors |

The author's implied values (self-hosting, decentralization, anti-tracking — see the blog's
`robots.txt` and its "what is this?" post) make **Option A** the best fit, with **Option B** as
a possible later enhancement for global audiences.

---

## 12. Repo-side optimizations (micro)

These are small and independent of the hosting decision. None are required to fix the main
issue.

1. **Inline CSS** — set `build.inlineStylesheets: 'always'` in `astro.config.mjs` to remove a
   render-blocking round trip. On a high-latency origin this can save a full RTT.
2. **Longer cache headers for hashed assets** — ideally `immutable, max-age=31536000`. This is
   controlled by the Wisp hosting node, not by the repo, so it would need host support or a
   `_headers`-style mechanism (check whether Wisp supports one).
3. **Brotli** — also a host concern.
4. Consider whether the two small **View Transitions** JS bundles are worth their (tiny) cost;
   they enable smooth client-side navigation. Low priority.

The blog toolchain was recently upgraded to **Astro 7.3.5** (Vite 8, Sätteri markdown
processor, `compressHTML: true`), with compatible integration bumps and 0 `npm audit`
vulnerabilities. This upgrade is unrelated to the latency issue. See Appendix B.

---

## 13. Risks, caveats, and open questions

- **[OPEN]** Is `152.53.121.97` (the `sites.wisp.place` node) an officially supported target for
  arbitrary custom domains, or an incidental artifact of Wisp's shared backend? The docs
  describe scaled hosting with shared S3/Redis, which supports the "any node can serve" model,
  but per-region selection is undocumented.
- **[OPEN]** How stable is that node's IP? If Wisp uses dynamic/load-balanced addressing, an
  A-record pin could break. Check whether Wisp recommends an A record to a fixed IP or a
  CNAME to a stable name (a CNAME to `sites.wisp.place` might be more robust, if the apex
  supports CNAME flattening — Spaceship may or may not).
- **[OPEN]** Does Wisp emit cache-invalidation to *all* hosting instances when a site updates?
  The architecture suggests yes (Redis pub/sub + shared S3), but this was not verified by
  deploying and observing both nodes.
- **[OPEN]** Any terms-of-service considerations to moving custom-domain traffic to the
  `sites.wisp.place` host.
- **Risk of the switch:** transient downtime during DNS propagation; some resolvers/caches may
  keep the old IP until TTL expiry.
- **Rollback:** revert the A record to `152.44.44.138` at any time.

---

## 14. Glossary

- **AT Protocol / ATProto** — open protocol behind Bluesky; decentralized identity + data.
- **DID** — Decentralized IDentifier, e.g. `did:plc:…`; resolves to a DID document listing services.
- **PDS (Personal Data Server)** — stores a user's signed ATProto repository of records.
- **Repo / record / AT-URI** — the PDS holds an author's repo; data is stored as records
  addressed `at://<did>/<collection>/<rkey>`.
- **Collection** — a record type namespace, e.g. `place.wisp.fs`, `site.standard.document`.
- **Blob** — binary data (files, images) stored alongside records.
- **Firehose / Jetstream** — real-time streams of ATProto events; Wisp watches them.
- **Wisp** — decentralized static hosting on ATProto (`wisp.place`).
- **`place.wisp.fs`** — the Wisp lexicon record representing a site (manifest + file references).
- **Hosting node / hosting service** — read-only CDN process that serves Wisp sites from cache.
- **Firehose service** — Wisp's write path; syncs PDS → cache.
- **Tiered storage** — hot (memory) / warm (disk) / cold (S3) cache.
- **TTFB** — Time To First Byte; server latency before content starts arriving.
- **TLS handshake** — connection encryption setup; costs one RTT (plus cert issuance if on-demand).
- **RTT** — Round-Trip Time; base network latency between client and server.
- **on-demand TLS** — Caddy issuing a cert on first request for a hostname.
- **Caddy** — web server/reverse proxy used by Wisp (and by both hosting nodes we observed).
- **Vercel edge** — globally distributed CDN/serverless platform; the baseline site's host.
- **`standard.site`** — ATProto lexicon for publishing long-form content (blog posts).
- **Tangled / spindle** — ATProto code host / its Nix-based CI runners.
- **`wispctl`** — Wisp's CLI used to deploy a directory of static files.

---

## Appendix A: raw commands and outputs

Commands used (run from Italy, 2026-10-01):

```bash
# DNS
dig +short jojo.news A                 # 152.44.44.138
dig +short TXT jojo.news               # protonmail-verification=...
dig +short TXT _wisp.jojo.news         # did:plc:qiyhlatbxz3cr2dch5x5o3dy
dig +short NS jojo.news                # launch1/launch2.spaceship.net
dig +short wisp.place                  # 84.17.59.115 (Milan)
dig +short sites.wisp.place            # 152.53.121.97 (Nuremberg)
dig +short eurosky.social              # 138.199.244.49 (Hetzner, Germany)
dig +short -x 152.53.121.97            # v2202601334020429597.quicksrv.de

# PDS discovery
curl -s https://plc.directory/did:plc:qiyhlatbxz3cr2dch5x5o3dy   # serviceEndpoint https://eurosky.social

# Timing (example)
curl -sS -o /dev/null -w \
  "connect=%{time_connect}s tls=%{time_appconnect}s ttfb=%{time_starttransfer}s total=%{time_total}s\n" \
  https://jojo.news/

# Force a request to a specific node while keeping Host/SNI
curl -sS -o /dev/null --resolve jojo.news:443:152.53.121.97 \
  -w "code=%{http_code} ttfb=%{time_starttransfer}s\n" https://jojo.news/

# Headers
curl -sSI https://jojo.news/
curl -sSI --resolve jojo.news:443:152.53.121.97 https://jojo.news/

# Byte-for-byte comparison
curl -s https://jojo.news/ | shasum -a 256
curl -s --resolve jojo.news:443:152.53.121.97 https://jojo.news/ | shasum -a 256

# Certificate inspection
echo | openssl s_client -connect 152.53.121.97:443 -servername jojo.news 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates -ext subjectAltName
```

Geolocation facts (via `ipinfo.io`):

```
152.44.44.138   UpCloud USA Inc.        Clovis, California, US   (Wisp node currently serving jojo.news)
152.53.121.97   netcup GmbH             Nuremberg, Bavaria, DE   (Wisp sites.wisp.place node)
138.199.244.49  Hetzner Online GmbH     Gunzenhausen, Bavaria, DE (author's PDS eurosky.social)
84.17.59.115    Datacamp Limited        Milan, Italy             (Wisp main app wisp.place)
216.198.79.1    Vercel                  (edge, fra1 Frankfurt)   (baseline site giorgiovanini.eu)
```

---

## Appendix B: Blog toolchain snapshot

As of 2026-10-01, the blog's `package.json` dependencies:

```json
{
  "dependencies": {
    "@astrojs/rss": "^4.0.19",
    "@astrojs/sitemap": "^3.7.4",
    "@kckempf/astro-standard-site": "^1.1.7",
    "astro": "^7.3.5",
    "satori": "^0.26.0",
    "sharp": "^0.35.5",
    "wawoff2": "^2.0.1"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.20",
    "@tailwindcss/vite": "^4.3.3",
    "tailwindcss": "^4.3.3",
    "typescript": "^5"
  }
}
```

Notable config:

- `astro.config.mjs`: `site: "https://jojo.news"`, `trailingSlash: "never"`,
  `compressHTML: true`, `@astrojs/sitemap`, Tailwind v4 via `@tailwindcss/vite`,
  `prefetch: { defaultStrategy: 'viewport' }`.
- Astro 7 uses the **Sätteri** markdown pipeline (no remark/rehype plugins here).
- `src/content.config.ts` imports `z` from `astro/zod` (Content Layer API).
- OG images generated at build time with Satori + sharp.
- The blog ships 4 self-hosted Charter `.woff2` fonts (~15 KB each);
  `hack-regular.ttf` (309 KB) is used only at build time for OG images, never sent to browsers.
- `public/robots.txt` deliberately blocks major AI/LLM crawlers; no analytics/tracking.

Build verified locally with both `npm run build` and `bun run build`; dev server smoke-tested.

---

*End of briefing.*
