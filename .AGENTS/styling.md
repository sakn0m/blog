# styling

## CSS framework

**Tailwind CSS v4** via `@tailwindcss/vite` (Vite plugin, not PostCSS). Tailwind Typography plugin (`@tailwindcss/typography`) via `@plugin` directive.

Entry point: `src/styles/globals.css`.

## Tailwind v4 specifics

Uses CSS-first configuration (no `tailwind.config.js`):
```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@custom-variant dark (.dark &);
@custom-variant hover-hover (@media (hover: hover));
```

The `dark` variant activates when a parent has class `.dark` (set on `<html>` by the dark mode script).

The `hover-hover` variant is used to avoid sticky hover states on touch devices.

Theme override for the serif font stack:
```css
@theme {
  --font-serif: var(--font-charter), "Source Serif 4", Georgia, ui-serif, serif;
}
```

CSS custom property `--font-charter` is set inline on `<html>`: `style="--font-charter: 'Charter';"`

## Design tokens

All colors are CSS custom properties on `:root` (light) and `.dark` (dark):

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-bg` | `#FDFBF7` | `#1A1A1A` | Body background |
| `--color-text` | `#1C1917` | `#E2E2E2` | Body text |
| `--color-accent` | `#8B5E3C` | `#D4A373` | Links, underlines, quote borders |
| `--color-muted` | `#78716C` | `#A8A29E` | Timestamps, muted text, back links |
| `--color-border` | `#D6D3D1` | `#333333` | `<hr>`, separator borders |
| `--color-selection` | `rgba(139,94,60,0.2)` | `rgba(212,163,115,0.25)` | `::selection`, inline code bg, toggle hover |

All light↔dark transitions use `transition: ... 0.4s ease` for smooth theme switching.

## Typography

**Primary font**: Charter (woff2, 4 variants) — self-hosted in `src/assets/fonts/`.
- `charter-regular.woff2` (weight 400, normal)
- `charter-italic.woff2` (weight 400, italic)
- `charter-bold.woff2` (weight 700, normal)
- `charter-bold-italic.woff2` (weight 700, italic)

**Monospace font** (OG cards, timestamps): `Hack Regular` (TTF) — self-hosted in `src/assets/fonts/hack-regular.ttf`. Used in the OG image pipeline for dates only; blog page timestamps use `ui-monospace, Menlo, Monaco, monospace` system stack.

**Fallback stack**: `"Source Serif 4", Georgia, ui-serif, serif`

**Body**: `font-serif` class, `line-height: 1.75`, antialiased.

**Timestamps**: `font-family: ui-monospace, 'Menlo', 'Monaco', monospace` — no serif.

**Prose content** (Tailwind Typography `.prose` classes on posts — `prose prose-lg md:prose-xl`):
- Links get transparent→accent underline animation (same pattern as homepage post titles)
- Inline code: colored bg via `--color-selection`, no backticks (prose code `::before/::after` content: "")
- Quote borders: `--color-accent`
- Horizontal rules and table borders: `--color-border`

## Link styling pattern

A bespoke underline-on-hover pattern used on both homepage post titles and prose links:
```css
text-decoration: underline;
text-decoration-color: transparent;
text-decoration-thickness: 1px;
text-underline-offset: 4px;
transition: text-decoration-color 0s ease-out;  /* instant on hover-off */
```
On hover (only on devices with hover): `text-decoration-color: var(--color-accent);` with `150ms ease-out`. On `:active` / `.is-navigating`: always colored (instant, no transition dependency on hover media query).

## Layout

- Content max-width: `max-w-[65ch]`
- Horizontal padding: `px-6 sm:px-8`
- Vertical padding: `py-24 md:py-32`
- Theme toggle positioned absolutely at `top-6 right-6 md:top-12`

*Last verified: 2026-06-23 (d82bfe7)*
