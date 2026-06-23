# routing-and-pages

## URL → file mapping

| URL | Source file | Type |
|-----|------------|------|
| `/` | `src/pages/index.astro` | Static page |
| `/posts/{slug}` | `src/pages/posts/[slug].astro` | Dynamic (SSG) |
| `/og.png` | `src/pages/og.png.ts` | API endpoint (static) |
| `/og/{slug}.png` | `src/pages/og/[slug].png.ts` | API endpoint (dynamic SSG) |
| `/rss.xml` | `src/pages/rss.xml.ts` | API endpoint (static) |
| `/404` | `src/pages/404.astro` | Custom error page |
| `/favicon.png`, `/robots.txt`, `/images/*` | `public/` | Static assets |

## Dynamic routes

### `[slug].astro` → `/posts/{slug}`

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

### `[slug].png.ts` → `/og/{slug}.png`

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

## Static API routes

### `og.png.ts` → `/og.png`

Homepage OG image. Calls `renderOgImage(SITE_TITLE, '', { isHomepage: true })` and returns `image/png` response.

### `rss.xml.ts` → `/rss.xml`

RSS feed using `@astrojs/rss`. Maps posts to items with title, pubDate, description, link.

## Index page (`index.astro`)

Queries `getPublishedPosts()` and renders a list of links. Each link:
```html
<a href={`/posts/${post.id}`}>
  <span class="post-title">{post.data.title}</span>
  <!-- dotted separator -->
  <time datetime={toISODate(post.data.date)}>{formatDate(post.data.date)}</time>
</a>
```
Note: `trailingSlash: "never"` means links are `/posts/slug` (no trailing slash).

## Meta & SEO

All metadata is set in `Layout.astro` via props:
- `title` (page title + `— jojo's thoughts` suffix on subpages)
- `description` (per-page; falls back to `SITE_DESCRIPTION`)
- `ogImage` (per-page; home uses `/og.png`, posts use `/og/{slug}.png`)
- `canonical` URL = `Astro.url.href`
- Twitter card: `summary_large_image`
- JSON-LD structured data on post pages (`BlogPosting` schema)
- RSS discovery link

## Middleware

None. No `src/middleware.ts`.

## Redirects

None configured. No `_redirects` file.

*Last verified: 2026-06-23 (d628adf)*
