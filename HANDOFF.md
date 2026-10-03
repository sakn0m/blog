# HANDOFF — audit, cleanup e ottimizzazione di `jojo.news`

> Documento di passaggio per un agente valutatore. Descrive cosa è stato fatto, perché, e come
> verificarlo in autonomia.
>
> **Stato:** `main` = `origin/main` (GitHub), HEAD `d54fe68`. Repo Astro statico, sito `jojo.news`
> su Cloudflare Workers (static assets). Cloudflare (dashboard/DNS/dominio) **non** è stato
> modificato dal lavoro sul repo; solo la configurazione git locale e i file del repo.

## Contesto iniziale

Il repo aveva: documentazione duplicata in `docs/` + `.AGENTS/`, integrazione `standard.site`/ATProto,
deploy via Tangled CI, alcune incongruenze (build Bun in CI vs lockfile npm, RSS non canonico,
favicon 143 KB). Obiettivi richiesti: codice pulito senza workaround, versioni allineate, zero
inefficienze, tutto funzionante.

## 1. Documentazione unificata (`552f30e`)

Unificati `docs/guide.md`, `docs/cloudflare-workers-migration.md` e i 7 file `.AGENTS/*` in un
unico `README.md` alla root; eliminati `docs/` e `.AGENTS/`. Ogni affermazione verificata contro il codice.

## 2. Git / identity (config locale; doc in `e0bc2a7`)

- Remote `github` → **`origin`**; `main` traccia `origin/main`.
- `user.email` locale: da `did:plc:…` a `81561474+sakn0m@users.noreply.github.com` (avatar GitHub).
- Remote `tangled` mantenuto separato (legacy). Branch `feat/standard-site` eliminato da locale,
  `origin` e `tangled`.

## 3. Rimozione totale standard.site / ATProto (`3d65f85`)

- Eliminati: `scripts/sync-to-atproto.ts`, `src/pages/.well-known/site.standard.publication.ts`,
  `src/data/standard-site-records.json`.
- Rimossa la dipendenza `@kckempf/astro-standard-site`; semplificati `src/pages/posts/[slug].astro`
  (via `generateDocumentLinkTag`/`headExtras`) e `src/layouts/Layout.astro` (prop `headExtras` rimossa).
- CI: rimosso lo step di sync.
- **PDS**: cancellati 2 `site.standard.document` e 1 `site.standard.publication` con il tool `goat`;
  verificato che non restino collection `site.standard.*`.
- README ripulito; grep di conferma senza riferimenti residui (solo falsi positivi in hash di lock).

## 4. Pipeline deploy → Cloudflare Workers Builds (`8d749be`)

- Rimozione `.tangled/` e passaggio a **Cloudflare Workers Builds** collegato a GitHub:
  build `npm run build`, deploy `npx wrangler deploy`, token API gestito automaticamente da Cloudflare.
- `.wrangler/` aggiunto a `.gitignore`.

## 5. Ottimizzazioni

| Commit | Cosa |
|---|---|
| `b105dc2` | **RSS**: `trailingSlash:false` (coerente con `trailingSlash:"never"` + `drop-trailing-slash`); description autogenerata via helper condiviso `src/lib/description.ts` |
| `aafd65c` | **`public/_headers`**: `Cache-Control: immutable` per `/_astro/*`, security header, `X-Robots-Tag: noindex` per `*.workers.dev` |
| `3742f5f` | **Favicon**: 16/32/180 + apple-touch-icon al posto del PNG 1024×1024/143 KB |
| `0ccf651` | **SEO/a11y**: `og:site_name`, `og:image:alt`/`twitter:image:alt`, `theme-color` light/dark, `og:type=article`+`article:published_time`, JSON-LD (`url`/`mainEntityOfPage`/`image`), `aria-pressed` sul toggle |
| `081e9a1` | **Type-check**: `@astrojs/check`, `npm run check`, `build = astro check && astro build`. Sistemati 4 type error reali |
| `9d8c2ce` | **Biome**: lint+format su TS/JSON |
| `e310f72` | **`engines`** Node ≥22.12 + advisory documentata |
| `0f435c8` | **satori 0.26 → 0.35** (OG byte-identici prima/dopo) |
| `7ca8d27`,`0b29eda`,`bd71cf6` | Doc sul perché TypeScript resta su `^5` |

Dettagli utili:
- **Biome** esclude `.astro` (non collega import↔uso nel template → falsi positivi) e
  `globals.css` (sintassi Tailwind v4 `@plugin`/`@theme`/`@custom-variant` non parsabile).
  Sistemate le segnalazioni reali (escape regex inutile, template literal, `context.site!`).
- **TypeScript**: `@astrojs/check` usa l'API JS del compilatore; TS 7 è il port nativo Go (`tsgo`) e
  consegna solo `tsc` (niente `tsserver`, niente API JS). Supporto rimandato, non rimosso.

## 6. Pass di qualità

| Commit | Cosa |
|---|---|
| `45e3d71` | **`fflate` override** a `^0.8.2`: `satori 0.35` pinnava `fflate 0.7.3` (advisory moderate ZIP64). `satori` usa solo `inflateSync`; OG identici |
| `a63d803` | **Refactor OG**: bold reale (`charter-bold.woff2`) invece del regular duplicato; **bug latente** in `wawoff2` risolto (heap wasm condiviso → serializzazione + copia `.slice(0)`) |
| `72deebd` | **CSS consolidato**: `@font-face` e `--font-charter` spostati da `Layout.astro` a `globals.css` |
| `d54fe68` | `og:image:width/height` (1200×630); `stripMarkdown` reso non esportato |

Nota sul "workaround" rimosso: `import.meta.url` è stato provato al posto di `path.resolve('src/assets/fonts')`
ma **non** funziona perché Astro prerenderizza da `dist/.prerender`; la risoluzione da CWD è quindi un
**vincolo reale** del build, documentato come tale.

## Verifica eseguita

- `npm run build` (include `astro check && astro build`): verde (4 pagine + 3 OG + RSS + sitemap).
- `npx astro check`: **0 error / 0 warning / 0 hint**.
- `npx biome check .`: pulito.
- Controllo asset: ogni URL referenziato risolve a un file in `dist/` (unico match `/404`, servito da
  `404.html` via Cloudflare).
- Ispezione visiva delle PNG OG (home + post): corrette, bold reale.
- **Live** (deploy Cloudflare): `/` 200, `/nope` 404, security header attivi, `/_astro/*`
  `max-age=31536000, immutable`, `/og.png` `image/png`, CSS con 4 `@font-face`, RSS senza slash,
  favicon 16/32/180 → 200, meta OG/`og:type=article`/`theme-color` presenti.

## Limitazioni / scelte consapevoli

- **`http-cache-semantics`** (CVE-2026-93748): 2 advisory high **non azzerabili** (`patched: none`),
  build-time, non esposti dal sito statico. Documentati in README.
- **TypeScript 7** non adottato (vedi §5).
- **Biome** non copre `.astro` né il CSS Tailwind v4.
- **Nessuna CSP**: `security.csp` di Astro richiederebbe test dedicati con gli script inline; non
  introdotta per non rischiare regressioni.
- **Favicon master** 1024px rimosso dal working tree (recuperabile da git history).
- **`_headers` workers.dev** noindex non verificabile dal repo (serve il sottodominio account).

## File toccati

Modificati: `package.json`, `package-lock.json`, `README.md`, `.gitignore`, `public/_headers`,
`public/favicon-16x16.png`, `public/favicon-32x32.png`, `public/apple-touch-icon.png`,
`src/layouts/Layout.astro`, `src/components/ThemeToggle.astro`, `src/pages/index.astro`,
`src/pages/404.astro`, `src/pages/og.png.ts`, `src/pages/rss.xml.ts`,
`src/pages/posts/[slug].astro`, `src/pages/og/[slug].png.ts`,
`src/lib/description.ts`, `src/lib/og.ts`, `src/lib/og-font.ts`, `src/styles/globals.css`, `biome.json`.
Eliminati: `docs/`, `.AGENTS/`, `.tangled/`, `scripts/`, `src/data/`, `src/pages/.well-known/`.

## Come verificare in autonomia

```bash
npm ci
npm run check        # astro check → 0/0/0
npm run lint         # biome check → clean
npm run build        # astro check && astro build → dist/
npx astro preview    # oppure ispeziona dist/
npm audit            # atteso: 2 high (http-cache-semantics + astro), nessun fix
npm outdated         # atteso: solo typescript 7
```

## Post-review follow-up

Dopo la prima valutazione dell'agente:

- Rimossi i file `.DS_Store` (root, `public/`, `src/`, `src/content/`) che finivano in `dist/` a ogni build locale.
- Aggiunto `public/favicon.ico` (ICO con PNG 32×32) e `<link rel="icon" href="/favicon.ico" sizes="any">` per i crawler legacy.
- Reso coerente il remote `tangled`: rimossa la `pushurl` ridondante verso GitHub (ora fetch/push solo su `tangled.org`).

Rilievi aperti (non bloccanti):
- Ripuliti tutti i branch non-`main` in locale e su `origin` e `tangled` (resta solo `main`).
- Regola `_headers` per `*.workers.dev`: mantenuta (innocua; il `<link canonical>` copre già il
  duplicate content). Non verificabile dal repo (serve il sottodominio dell'account).
