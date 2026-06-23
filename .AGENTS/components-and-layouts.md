# components-and-layouts

## Layouts

### `src/layouts/Layout.astro`

The single layout shell used by all pages. Props:

```ts
interface Props {
  title?: string;           // default: SITE_TITLE
  description?: string;     // default: SITE_DESCRIPTION
  ogImage?: string;         // OG image URL (optional)
  preloadAllFonts?: boolean; // preload all 4 Charter variants (default: false)
}
```

Responsibilities:
- DOCTYPE, `<html lang="en">`, charset, viewport meta
- SEO: `<title>`, `<meta description>`, OG tags, Twitter card, canonical, RSS link
- Font loading: `@font-face` declarations for Charter (regular/italic/bold/bold-italic), preloads regular (always) and optionally all 4
- Dark mode: inline `<script is:inline>` that applies `.dark` class before first paint (reads `localStorage`), re-applies on `astro:before-swap`
- Navigation state: adds `.is-navigating` class to clicked same-origin links on click/touchend, removes on `astro:after-swap`
- Touch-optimized navigation: `<script>` with `navigate()` from `astro:transitions/client`, fires on `touchend` before `click` for zero-latency mobile transitions, with 8px deadzone to distinguish taps from swipe/scroll
- Layout shell: skip-to-content link, `<main>` centered with `max-w-[65ch]`, ThemeToggle in top-right, `<slot />`
- Imports `globals.css`, `ThemeToggle`, `ClientRouter` from `astro:transitions`

### Navigation handling detail

Two intertwined scripts in `<head>`:
1. **Inline script** (executes before framework): handles `.is-navigating` class on click, dark mode application, `astro:before-swap` hook
2. **Module script** (hydrated): intercepts `touchend` on same-origin anchor links, fires `navigate()` from `astro:transitions/client` to skip the click round-trip on mobile

## Components

### `src/components/ThemeToggle.astro`

A single `<button>` with sun/moon SVG icons (transition between them via CSS opacity/rotation). Script:
- On click: toggles `.dark` on `<html>`, sets `colorScheme`, persists to `localStorage`
- Re-initializes on `astro:after-swap` (View Transitions re-attachment)

**Hydration**: No `client:*` directive — the script runs as a standard module script (Astro's default hoisting/bundling behavior). The toggle works because the script runs after DOM load and re-binds on page transitions.

## Client-side islands

None. No `client:load`, `client:visible`, `client:idle`, `client:only` directives anywhere in the codebase. All interactivity is vanilla JS embedded in Astro components.

## Template patterns

- Homepage (`index.astro`): minimal — just a `<nav>` with a `<ul>` of post links
- Post page (`[slug].astro`): back link, `<article>` with `<h1>`, `<time>`, `<div class="prose">` for content, optional `authorNote`
- 404: simple centered message with a back-home link

*Last verified: 2026-06-23 (d628adf)*
