# content-model

## Collections

There is one collection: **posts**.

Defined in `src/content.config.ts`.

## Schema (`zod`)

```ts
title:        z.string()                    // required
date:         z.date()                      // required
description:  z.string().optional()         // OG / RSS / meta
draft:        z.boolean().default(false)    // hidden in production builds
authorNote:   z.string().optional()         // rendered below post content
```

## Source files

Posts are markdown files in `src/content/posts/` loaded via `glob({ pattern: "**/*.md", base: "./src/content/posts" })`.

File naming convention: `post-id.md` — the filename (without extension) becomes the `post.id`, used as:
- URL slug: `/posts/{post.id}`
- OG image slug: `/og/{post.id}.png`

Current posts:
- `src/content/posts/what-is-this.md`
- `src/content/posts/bombing-iran-won-t-free-it.md`

## Draft behavior

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

## No CMS layer

There is no CMS (Keystatic, Decap, etc.). Authors edit markdown directly. A style guide lives at `docs/guide.md` explaining how to use Markdown features with the Tailwind Typography prose classes.

## No i18n

Single language (English). No locale folders, no locale frontmatter, no locale-aware routing.

## Custom field: `authorNote`

Renders as an italic note below the post content, separated by a border:
```astro
{post.data.authorNote && (
  <p class="author-note">{post.data.authorNote}</p>
)}
```
Styled in `globals.css` as `.author-note` with muted color, italic, top border.

*Last verified: 2026-06-23 (d628adf)*
