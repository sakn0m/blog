# Architettura e Componenti

Dettagli tecnici sui componenti di Astro, il fetching dei dati e la Core API.

## Data Fetching (Content Collections)

Astro gestisce i file Markdown (i post del blog) tramite un'API chiamata **Content Collections**.

1.  **Definizione (`src/content.config.ts`)**: Lo schema, validato da `zod`, obbliga i post ad avere quantomeno un `title` e una `date`. Se i file in `src/content/posts` non soddisfano questo schema, la build fallisce garantendo solidità dei dati al 100%.
2.  **Accesso ai Dati**: I componenti chiamano `getCollection('posts')` per ottenere tutti i post senza dover scrivere script Node.js custom o parsare file manualmente.

## Routing e Pagine Chiave

Essendo una SSG (Static Site Generation), tutte le pagine sono pre-costruite al tempo di build e pesano letteralmente `0 kB` di JavaScript se non contengono componenti interattivi espliciti.

### `src/layouts/Layout.astro` (Root Layout)
Definisce l'HTML di base. Include:
- La gestione del Font custom Charter.
- Il `<ViewTransitions />` engine di Astro, per navigazioni ultra veloci stile Single Page App.
- Uno `script inline` per determinare il tema scuro/chiaro prima del primo paint (evitando flash visivi).

### `src/pages/index.astro` (Homepage)
- Interroga `getCollection('posts')` ordinando i risultati per data.
- Definisce animazioni di transition (`slide` da/verso sinistra) in modo che aprendo un post l'homepage sembri "scivolare" via nativamente.
- Sfutta classi CSS (`animate-fade-up`) con delay per presentare i contenuti elegantemente in sequenza al mount.

### `src/pages/posts/[slug].astro` (Post Detail)
Router dinamico per i singoli post.
- Usa `getStaticPaths()` per indicare ad Astro le rotte da creare, mappando il nome del file (slug) all'ID del contenuto.
- Usa `render(post)` per convertire in HTML nativo il contenuto Markdown. Nessuna libreria runtime come React Markdown è necessaria.
- Applica classi `.prose` al `<Content />` per lo styling automatico Tailwind.  
- Aggiunge uno script JSON-LD per migliorare l'indicizzazione semantica di Google (SEO).

### `src/pages/og/[slug].png.ts` (Generazione Immagini Open Graph)
Riscrittura Astro del vecchio sistema Next.js.
- Durante la compilazione, Astro itera sui post e genera vere immagini PNG usando i pacchetti `satori` (per convertire HTML/CSS in SVG) e `sharp` (per creare PNG finali compressi).
- Carica il font base in locale dal disco per assicurare uniformità grafica sui social preview.

### `src/components/ThemeToggle.astro`
Gestisce la Dark Mode ("Island Architecture").
Questo è un componente "Isola" di pura interattività. Invece di richiedere pesanti pacchetti (es. `next-themes`), legge la preferenza utente o il tema di sistema aggiornando classi su `html` usando poche righe di Vanilla JS ultra-ottimizzato.
