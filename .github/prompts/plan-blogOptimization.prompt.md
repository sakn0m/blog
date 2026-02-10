# Plan: Optimize Minimal Next.js Blog

**TL;DR:** The codebase is already lean (~10 source files, fully SSG). The highest-impact changes are: (1) adding per-post SEO metadata, (2) replacing framer-motion with CSS animations to cut ~30KB from the client bundle, (3) adding error handling in the posts lib, (4) using semantic `<time>` elements, and (5) generating a sitemap. These changes keep the site minimal while making it faster and more discoverable.

---

## Steps

### Critical / High Priority

**1. Add `generateMetadata` to the post page** — `app/posts/[slug]/page.tsx`
- Export an async `generateMetadata` function that reads the post's `title` and `date` via `getPostBySlug`, returning per-post `<title>`, `description`, and Open Graph tags (`og:title`, `og:type: "article"`, `og:description`).
- Also add `metadataBase` in `app/layout.tsx` (e.g. `new URL("https://yourdomain.com")`) so OG URLs resolve correctly.
- **Why:** Currently every page shares "jojo's thoughts / just whatever comes to my mind" in search results. Each post appearing with its own title is the single biggest SEO win.

**2. Replace framer-motion with CSS animations** — `app/template.tsx`
- Remove the `framer-motion` dependency entirely.
- Rewrite `template.tsx` as a server component (or lightweight client component) that uses a CSS `@keyframes` fade-slide animation applied via a class. Since `template.tsx` already re-mounts on every navigation, a CSS animation will trigger naturally on mount without JS.
- Use two CSS keyframes in `app/globals.css`: one for the initial page load (fade-up) and one for navigations (fade-in with slight directional slide). The "is first load" and "is post" directional logic can be simplified or dropped — a uniform subtle fade-in is enough for a minimal blog.
- **Why:** `framer-motion` is ~30-40KB parsed JS on the client for a single fade animation. Removing it is the biggest bundle size win and eliminates a client component boundary.

**3. Add error handling and slug sanitization in posts lib** — `app/lib/posts.ts`
- In `getPostBySlug`: validate that the resolved path stays within `postsDirectory` (e.g. `path.resolve(postsDirectory, ...)` then check it starts with `postsDirectory`). If not, throw a controlled error or return a 404.
- Wrap `fs.readFileSync` in a try/catch; if the file doesn't exist, call `notFound()` from `next/navigation` so Next.js renders a proper 404 page instead of a 500.
- **Why:** Defensive coding against path traversal and graceful handling of missing posts.

### Medium Priority

**4. Use semantic `<time>` elements for dates** — `app/page.tsx` and `app/posts/[slug]/page.tsx`
- Replace the `<span>` or `<div>` wrapping `post.date` with `<time datetime="2026-01-17">Jan 17, 2026</time>`.
- Add an ISO date field to the `Post` type (computed from the frontmatter date string) or compute it inline.
- **Why:** Semantic `<time>` helps search engines understand publish dates and improves accessibility.

**5. Add JSON-LD structured data for blog posts** — `app/posts/[slug]/page.tsx`
- Add a `<script type="application/ld+json">` block in the post page with `@type: "BlogPosting"`, `headline`, `datePublished`, `author`.
- **Why:** Enables rich snippets in Google search results (publish date, author) with minimal code.

**6. Generate a sitemap** — new file `app/sitemap.ts`
- Use Next.js's built-in `sitemap.ts` convention to export a function that reads all posts (via `getAllPosts`) and returns URL entries with `lastModified` dates.
- Update `public/robots.txt` to add a `Sitemap: https://yourdomain.com/sitemap.xml` directive.
- **Why:** Helps search engines discover all pages. Trivial to implement with Next.js.

**7. Fix `MarkdownImage` for better CLS** — `app/components/markdown-image.tsx`
- Replace `width={0} height={0}` with the `fill` prop and wrap in a `position: relative` container with a defined aspect ratio (e.g. `aspect-video`). Remove `{...props as any}`.
- **Why:** `width={0} height={0}` defeats layout shift prevention. A filled container with aspect ratio gives the browser a reserved space before the image loads.

**8. Add loading skeleton for ThemeToggle** — `app/theme-toggle.tsx`
- Instead of returning `null` before mount, return an empty `<div>` with the same dimensions (`w-10 h-10 rounded-full`) as the button.
- **Why:** Prevents minor CLS when the button pops in after hydration.

### Low Priority

**9. Use `@/*` path aliases consistently** — all files
- Replace relative imports like `../../lib/posts` with `@/app/lib/posts` across the codebase, matching the path alias already configured in `tsconfig.json`.
- **Why:** Cleaner imports, especially as the project grows. The alias exists but is unused.

**10. Fix lint script** — `package.json`
- Change `"lint": "eslint"` to `"lint": "next lint"` or `"lint": "eslint ."`.
- **Why:** The current script runs ESLint with no file targets, so it does nothing.

**11. Add a `not-found.tsx` page** — new file `app/not-found.tsx`
- Create a simple 404 page with a "← Back home" link, matching the blog's typography.
- **Why:** Better UX than the default Next.js 404. Works with the `notFound()` call added in step 3.

**12. Consider adding an RSS feed** — new file `app/feed.xml/route.ts`
- Optional: use a Next.js Route Handler to generate an RSS/Atom feed from `getAllPosts()`.
- **Why:** Blog readers and aggregators expect RSS. Easy to implement as a route handler.

### Not Recommended (Keep Simple)

- **ISR / revalidation:** The site is fully static with 1 post. SSG is the correct strategy. ISR adds complexity for no benefit here.
- **Edge Functions / Middleware:** No dynamic routes or auth. Not needed.
- **`vercel.json`:** Not needed — Next.js on Vercel works out of the box. Static assets already get optimal caching headers from Vercel's defaults.
- **React.memo / useMemo / useCallback:** The only client components are `Providers` (thin wrapper), `ThemeToggle` (tiny), and `Template` (being eliminated or simplified). There are no re-render issues to fix in this codebase.
- **Code splitting / lazy loading:** With framer-motion removed, the client JS is minimal. No need for `dynamic()` imports.

---

## Verification

- Run `next build` and check the build output for page sizes — client JS should drop significantly after removing framer-motion.
- Run `next lint` (after fixing the script) to catch any issues.
- Open each post URL and inspect `<head>` for correct `<title>`, OG tags, and JSON-LD.
- Check `/sitemap.xml` returns valid XML.
- Use Lighthouse on the deployed Vercel URL to verify: Performance ≥ 99, SEO ≥ 95, Accessibility ≥ 95.
- Test dark mode toggle for CLS (should no longer flash/shift).

## Decisions

- **Framer-motion → CSS:** Chose full removal over `framer-motion/m` (lighter subset) because the animation is trivially achievable with CSS and eliminates the dependency entirely.
- **No state management added:** No prop drilling or complex state exists — the codebase doesn't need Context/Zustand/etc.
- **Kept synchronous fs reads:** They're fine for static generation at build time. Async reads add complexity with no benefit here.
