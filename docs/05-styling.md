# Styling e Temi

Il progetto utilizza **Tailwind CSS v4** per tutto lo styling. Non ci sono file CSS separati per i componenti (CSS Modules); tutto è gestito tramite classi di utilità.

## Configurazione Tailwind (`app/globals.css`)

Dalla versione 4, Tailwind non richiede più necessariamente un `tailwind.config.js` complesso. La configurazione risiede principalmente nel file CSS.

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  --font-serif: var(--font-charter), Georgia, ui-serif, serif;
}
```

-   **`@import "tailwindcss"`**: Carica il framework.
-   **`@plugin "@tailwindcss/typography"`**: Attiva il plugin `prose` per formattare automaticamente il contenuto Markdown (HTML grezzo).
-   **`@theme`**: Definisce le variabili del tema. Qui viene sovrascritto il font serif di default.

## Dark Mode

La modalità scura è implementata tramite `next-themes` e classi CSS native.

### Come Funziona
1.  Il provider in `app/providers.tsx` avvolge l'app e gestisce lo stato del tema (`light`, `dark`, `system`).
2.  Tailwind è configurato per usare selettori specifici per la dark mode:
    ```css
    @custom-variant dark (.dark &);
    ```
3.  Nel CSS globale (`app/globals.css`), i colori di base del body vengono definiti con transizioni fluide:
    ```css
    body {
        @apply transition-colors duration-500 bg-white text-neutral-900;
        
        &.dark,
        .dark & {
           @apply bg-neutral-950 text-neutral-50;
        }
    }
    ```

### Utilizzo nei Componenti
Per applicare stili specifici per la dark mode, usa il prefisso `dark:` nelle classi Tailwind.
Esempio:
```tsx
<div className="bg-white dark:bg-black text-black dark:text-white">
  Contenuto adattivo
</div>
```

## Animazioni

Sono state definite alcune animazioni custom in `app/globals.css`:
-   `animate-fade-up`: Apparizione dal basso verso l'alto.
-   `animate-slide-left`: Scorrimento da destra a sinistra.
-   `animate-slide-right`: Scorrimento da sinistra a destra.

Possono essere usate come normali classi di utilità: `<div className="animate-fade-up">...</div>`.
