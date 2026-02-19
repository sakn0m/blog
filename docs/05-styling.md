# Styling e Temi

Il progetto utilizza **Tailwind CSS v4** per tutto lo styling. Non ci sono file CSS separati per i componenti (CSS Modules); tutto è gestito tramite classi di utilità in un unico file CSS globale configurato per Astro.

## Configurazione Tailwind (`src/styles/globals.css`)

Dalla versione 4, Tailwind non richiede più necessariamente un `tailwind.config.js` o complessi integrazioni con postcss. La configurazione risiede principalmente nel file CSS.

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  --font-serif: var(--font-charter), Georgia, ui-serif, serif;
}
```

-   **`@import "tailwindcss"`**: Carica il framework (e Tailwind gestisce il Vite plugin dietro le quinte in `astro.config.mjs`).
-   **`@plugin "@tailwindcss/typography"`**: Attiva il plugin `prose` (testo strutturato base).
-   **`@theme`**: Definisce le variabili del tema. Qui viene sovrascritto il font serif base per forzare il WebFont `Charter`.

## Dark Mode

La modalità scura è implementata tramite Vanilla JS minimale e classi CSS native, in una pura architettura "Isola". Non dipende dallo stato globale React/NextThemes.

### Come Funziona
1.  Nel `Layout.astro`, c'è uno script `is:inline` nell'`<head>` che legge `localStorage` o le preferenze di sistema e inietta la classe `.dark` nel `<html lang="en">` prima che la pagina appaia. Questo elimina il fastidioso sfarfallio (FOUC) tipico delle SPA.
2.  Tailwind è configurato per onorare questa classe:
    ```css
    @custom-variant dark (.dark &);
    ```
3.  Nel CSS globale, la transizione tra chiaro e scuro è dichiarata così:
    ```css
    body {
        @apply transition-colors duration-500 bg-white text-neutral-900;
    }
    .dark body, body.dark {
        @apply bg-neutral-950 text-neutral-50;
    }
    ```

### Utilizzo nei Componenti
Usa semplicemente il prefisso `dark:` nelle classi.
```html
<div class="bg-white dark:bg-black text-black dark:text-white">
  Contenuto adattivo
</div>
```

## Animazioni e Micro-Interazioni

Sono state definite alcune animazioni custom css keyframed per regalare una presentazione fluida al caricamento pagina (specialmente sfruttate assieme a `@astrojs/transitions`).

**Animazioni Base:**
-   `animate-fade-up`
-   `animate-slide-left`
-   `animate-slide-right`

**Classi per Staggering (Ritardi temporizzati):**
Aggiungendo queste classi ad elementi fratelli generi un effetto a "cascata".
-   `delay-100` (100ms)
-   `delay-200`
-   `delay-300`

**Esempio in Astro:**
```html
<h1 class="animate-fade-up">Titolo (appare per primo)</h1>
<p class="animate-fade-up delay-100">Sottotitolo (appare poco dopo)</p>
<div class="animate-fade-up delay-200">Contenuto (appare ultimo)</div>
```
