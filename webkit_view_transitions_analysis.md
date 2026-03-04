
# WebKit View Transitions Jank — Full Analysis

## The Problem

When navigating **backward** from the Iran article to the homepage on **iOS Safari/Brave** (WebKit), the slide transition animation is visibly **choppy/stuttery** ("va a scatti"). The issue:

- ✅ Homepage → article: **smooth**
- ❌ Article → homepage: **choppy** (Iran article only)
- ✅ Article → homepage: **smooth** (Hello World article — short content)

**Device:** iPhone 14, tested on both Safari and Brave (both use WebKit on iOS).

---

## Root Cause

The jank is caused by the **View Transitions API's page snapshot mechanism** in WebKit.

### How Astro View Transitions Work

When navigating between pages with Astro's `<ClientRouter>`, the browser:

1. **Captures a bitmap snapshot** of the current page's `transition:name` elements
2. **Fetches and renders** the new page
3. **Animates** between the old snapshot and the new content using CSS animations (slide, fade, etc.)

Step 1 is the bottleneck. The browser must **rasterize the entire rendered element** (not just what's visible in the viewport) into a GPU texture. For the Iran article — which renders to approximately **3000px tall** with dense `prose-lg`/`prose-xl` text — this creates a massive texture that overwhelms the mobile GPU's compositing pipeline, causing frame drops during the subsequent animation.

### Why Only Backward Navigation?

Going **forward** (homepage → article), the *outgoing* page being snapshot is the **homepage** (~835px tall, minimal content). This is trivially fast.

Going **backward** (article → homepage), the *outgoing* page being snapshot is the **article** (~3000px tall, dense text). This is where the GPU chokes.

### Why Only the Iran Article?

The Hello World article is 544 bytes / ~3 short paragraphs. The Iran article is 4,604 bytes / 8 dense paragraphs. The rendered height difference on mobile is enormous, and the snapshot cost scales with it.

### Why WebKit Specifically?

WebKit's View Transitions implementation (available from Safari 18+) is newer and less optimized than Chromium's. Chromium uses a more efficient compositing pipeline for view transition snapshots. On Chromium (tested via browser automation at 390×844 viewport), the Iran article transition was noticeably heavier than Hello World but didn't produce visible frame drops.

### Pre-existing Issue

Through `git checkout` testing against the original commit (`e0291a8`, before any changes this session), we confirmed the jank was **always present** — it just hadn't been noticed until focused mobile testing.

---

## Diagnosis Process

### Hypotheses Tested & Rejected

| # | Hypothesis | Fix Attempted | Result |
|---|-----------|--------------|--------|
| 1 | CSS animation stacking (fade-up + slide + bg transition) | Disabled `animate-fade-up` via `data-astro-transition` attribute during view transitions | ❌ No effect |
| 2 | `prose-xl` making the page too tall | Changed to responsive `prose-lg md:prose-xl` | ❌ No effect (was `prose-lg` on mobile anyway) |
| 3 | Slide animation too expensive | Changed backward animation from `slide` to `fade` | ❌ No effect |
| 4 | Off-screen content being rendered | Added `content-visibility: auto` to prose children | ❌ No effect (WebKit has limited support) |
| 5 | Named transition layer too heavy | Added `transition:animate="none"` to prose div | ❌ No effect + caused visual artifact (text lingering) |
| 6 | Entire transition causing the issue | Removed `transition` prop from article layout | ❌ Only removed forward animation, backward still ran via homepage's transition |

### Key Breakthrough

Adding `data-astro-reload` to the back link **should have** bypassed View Transitions entirely — but initially didn't work. Investigation revealed the **custom `touchend` handler** in [Layout.astro](file:///Users/giorgiovanini/repos/blog/src/layouts/Layout.astro):

```javascript
document.addEventListener('touchend', (e) => {
  const link = e.target.closest('a');
  if (!link || !link.href || ...) return;
  // ⚠️ No check for data-astro-reload!
  e.preventDefault();
  navigate(link.href); // Always uses View Transitions
});
```

This handler intercepts **all** internal link taps on mobile and calls `navigate()` from `astro:transitions/client`, which **always uses View Transitions** — completely bypassing the `data-astro-reload` attribute (which is only checked during the click event that the touchend handler prevents).

Once the handler was updated to skip `data-astro-reload` links, the back navigation became instant with zero jank.

---

## Final Solution

A two-part approach that **bypasses View Transitions for backward navigation** while preserving a visual slide animation:

### Part 1: Native Navigation for Back Link

**[slug].astro** — The back link uses `data-astro-reload` to force a native page load instead of an SPA navigation:
```html
<a href="/?from=post" data-astro-reload class="...">← back</a>
```

**Layout.astro** — The touchend handler respects `data-astro-reload`:
```javascript
if (link.hasAttribute('data-astro-reload')) return;
```

This completely skips the View Transitions API's expensive page snapshot step.

### Part 2: CSS-Only Slide Animation on Homepage

Since `data-astro-reload` causes a full page load (no View Transition animation), we fake the slide effect with a lightweight CSS animation on the **incoming** page (the homepage), which is small and renders instantly:

**globals.css:**
```css
@keyframes slide-from-left {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
```

**index.astro:**
```html
<script is:inline>
  if (new URLSearchParams(window.location.search).has('from')) {
    document.querySelectorAll('.animate-fade-up').forEach(el => {
      el.style.animation = 'slide-from-left 0.25s ease-out both';
      el.style.animationDelay = '0s';
    });
    history.replaceState(null, '', '/');
  }
</script>
```

The `?from=post` query parameter signals to the homepage that it arrived from an article. The URL is cleaned immediately via `history.replaceState`.

### Tradeoffs

| Aspect | Before | After |
|--------|--------|-------|
| Back link animation | Slide (both pages animate simultaneously) | CSS slide-in on homepage only |
| Back link performance | Janky on long articles (WebKit) | Smooth everywhere |
| Navigation method | SPA (instant DOM swap) | Full page load (network fetch) |
| Production impact | N/A | Negligible — static HTML from CDN is near-instant |
| Browser back button | Uses View Transitions (still janky) | Unchanged (still uses View Transitions) |

> [!NOTE]
> The browser back button/swipe gesture still uses Astro's View Transitions and may still exhibit jank on long articles. This is harder to intercept cleanly. The `← back` link is the primary navigation path and is now fully fixed.

---

## Other Changes Made This Session

| Change | File | Purpose |
|--------|------|---------|
| `prose-lg md:prose-xl` | `[slug].astro` | Better mobile typography (18px phone, 20px desktop) |
| `astro:before-swap` theme fix | [Layout.astro](file:///Users/giorgiovanini/repos/blog/src/layouts/Layout.astro) | Eliminates dark mode white flash during navigation |
| `.author-note` CSS class | [globals.css](file:///Users/giorgiovanini/repos/blog/src/styles/globals.css) | Reusable styling for author commentary at end of articles |
| Applied `.author-note` | `1-bombing-iran...md` | Replaced inline Tailwind classes with the new class |
