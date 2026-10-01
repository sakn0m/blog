# How to Write a Post

Posts are plain Markdown files in `src/content/posts/`. There is no CMS — you edit the file directly and push to `main`, which builds and deploys via Tangled → Cloudflare Workers (see `.AGENTS/deployment.md`).

## File name = URL slug

The filename (without `.md`) becomes the post slug:

- `src/content/posts/my-post.md` → `https://jojo.news/posts/my-post`
- OG image: `https://jojo.news/og/my-post.png`

Renaming the file changes the URL. No redirects are generated automatically.

## Frontmatter

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
| `description` | no | string | Used as-is for OG/meta/RSS. If omitted, auto-generated from the body (HTML truncated at 160 chars, standard.site at 300) |
| `draft` | no | boolean | Defaults to `false`. When `true`, hidden in production builds but visible in `astro dev` |
| `authorNote` | no | string | Rendered as a muted italic note below the content |

## Writing

This blog uses **Tailwind Typography** to style posts automatically — focus on writing, not layout.

**Paragraphs**: no `<br />` needed. Press **Enter twice** to start a new paragraph.

```markdown
This is the first paragraph.

This is the second paragraph. It will have nice spacing above it automatically.
```

**Bold & Italic**: `**text**` for bold, `*text*` for italic.

**Headings**: use `#`. Example: `## My Section Title`

**Lists**: `-` for bullet points.

**Quotes**: `>` for blockquotes.

## Images

Use standard Markdown images. They are optimized for speed and layout stability.

```markdown
![Description of image](/path/to/image.jpg)
```

**Note**: images must live in the `public` folder. An image at `public/my-dog.jpg` is linked as `/my-dog.jpg`.

## Preview before publishing

Run `npm run dev` (or `bun run dev`) to preview locally at `http://localhost:4321`. Drafts are visible in dev.
