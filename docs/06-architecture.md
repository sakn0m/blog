# Architettura e Componenti

Dettagli tecnici sui componenti React e la logica di backend (Next.js Server Components).

## Data Fetching (`app/lib/posts.ts`)

Questa libreria è il cuore del blog. Espone tre funzioni principali:

1.  **`getPostSlugs()`**: Legge la directory `posts/` e ritorna i nomi dei file `.md`.
2.  **`getPostBySlug(slug)`**:
    -   Legge il file specifico.
    -   Usa `gray-matter` per parsare titolo, data e contenuto.
    -   Gestisce errori 404 se il file non esiste o tenta un path traversal.
3.  **`getAllPosts()`**: Ritorna tutti i post ordinati per data (dal più recente).

## Componenti Chiave

### `app/layout.tsx` (Root Layout)
Definisce lo scheletro HTML `<html>` e `<body>`. Renderizza:
-   Il `ThemeProvider` (per la dark mode).
-   La Navbar/Header (se presente, o il `ThemeToggle`).
-   Il contenuto della pagina (`children`).
-   Il Footer.

### `app/page.tsx` (Homepage)
Componente Server (RSC).
-   Chiama `getAllPosts()`.
-   Itera sui post e renderizza una lista di anteprime (titolo, data, link).

### `app/posts/[slug]/page.tsx` (Post Detail)
Componente Server dinamico.
-   Riceve `params.slug`.
-   Chiama `getPostBySlug(slug)`.
-   Renderizza il contenuto Markdown usando `Markdown` (wrapper di `markdown-to-jsx`).
-   Usa le classi `prose` e `prose-neutral` (dal plugin typography) per stilizzare automaticamente l'HTML generato dal Markdown.
    ```tsx
    <article className="prose prose-neutral dark:prose-invert ...">
        <Markdown options={{ ... }}>{post.content}</Markdown>
    </article>
    ```

### `app/theme-toggle.tsx`
Un Client Component (`"use client"`) che permette all'utente di switchare tra chiaro e scuro.
-   Usa l'hook `useTheme` di `next-themes`.
-   Renderizza icone diverse (Sole/Luna) in base allo stato attuale.

### `app/components/markdown-image.tsx`
Un componente personalizzato per renderizzare le immagini all'interno del Markdown.
-   Viene passato come override a `markdown-to-jsx`.
-   Permette di applicare classi CSS extra o logica (es. lazy loading, Next/Image) a tutte le immagini dei post senza modificare i file Markdown originali.
