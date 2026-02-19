# Struttura del Progetto

Questa sezione descrive l'organizzazione delle cartelle e dei file principali del progetto.

## Alberatura

```
/
├── app/                  # Logica applicativa (App Router)
│   ├── components/       # Componenti specifici dell'app (es. markdown-image.tsx)
│   ├── lib/              # Funzioni di utilità (es. parsing dei post)
│   ├── posts/            # Routing dinamico per i singoli post
│   │   └── [slug]/       # Cartella dinamica base slug
│   │       ├── page.tsx  # Pagina del singolo post
│   │       └── opengraph-image.tsx # Generazione immagine OG
│   ├── globals.css       # Stili globali e configurazione Tailwind
│   ├── layout.tsx        # Layout principale (Root Layout)
│   ├── page.tsx          # Homepage (lista dei post)
│   ├── providers.tsx     # Provider per il contesto (es. ThemeProvider)
│   └── theme-toggle.tsx  # Componente per il cambio tema
├── docs/                 # Documentazione del progetto
├── posts/                # Contenuti del blog (file .md)
├── public/               # File statici (immagini, favicon)
├── .github/              # Workflow GitHub (CI/CD)
├── package.json          # Dipendenze e script npm
├── tsconfig.json         # Configurazione TypeScript
└── next.config.ts        # Configurazione Next.js
```

## Dettagli Cartelle Chiave

### `app/`

Contiene tutto il codice sorgente dell'applicazione Next.js.
-   **`layout.tsx`**: Definisce la struttura comune a tutte le pagine (header, footer, meta tag globali). Include il `theme-toggle`.
-   **`page.tsx`**: La homepage. Recupera la lista dei post usando `getAllPosts()` da `lib/posts.ts` e li visualizza.
-   **`globals.css`**: Importa Tailwind e definisce le variabili CSS per i temi e le animazioni.

### `app/lib/`

Contiene la logica di business separata dall'interfaccia.
-   **`posts.ts`**: Gestisce la lettura del file system per recuperare i file Markdown dalla cartella `posts/` root. Usa `gray-matter` per separare i metadati dal contenuto.

### `posts/` (Root)

Questa è la cartella **più importante per i contenuti**. Qui risiedono i file Markdown (`.md`) che diventano le pagine del blog.
-   Ogni file qui dentro corrisponde a un URL: `posts/mio-articolo.md` -> `yoursite.com/posts/mio-articolo`.

### `public/`

Contiene asset statici come immagini, icone, fonts.
-   Le immagini inserite qui sono accessibili dalla root `/`. Esempio: `public/logo.png` -> `<img src="/logo.png" />`.
