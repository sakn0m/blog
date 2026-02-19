# Struttura del Progetto

Questa sezione descrive l'organizzazione delle cartelle e dei file principali del progetto.

## Alberatura

```
/
├── src/                  # Codice sorgente principale di Astro
│   ├── components/       # Componenti UI (es. ThemeToggle.astro)
│   ├── content/          # Collezioni di contenuti gestite da Astro
│   │   └── posts/        # File originali Markdown (.md)
│   ├── layouts/          # Layout delle pagine (es. Layout.astro)
│   ├── pages/            # Router file-based
│   │   ├── index.astro   # Homepage
│   │   ├── 404.astro     # Pagina errore
│   │   ├── og.png.ts     # Generazione dinamica OG per la homepage
│   │   ├── posts/
│   │   │   └── [slug].astro # Pagina dinamica per ogni post
│   │   └── og/
│   │       └── [slug].png.ts # Generazione dinamica OG per singoli post
│   ├── styles/           # CSS globale (Tailwind)
│   └── content.config.ts # Definizione schema Zod per i Content
├── docs/                 # Documentazione del progetto
├── public/               # File statici serviti senza elaborazione (immagini, fonts)
├── .github/              # Workflow GitHub (CI/CD)
├── astro.config.mjs      # Configurazione vite, tailwind e sitemap per Astro 
├── vercel.json           # Configurazione routing proxy/headers per Vercel
├── package.json          # Dipendenze e script npm
└── tsconfig.json         # Configurazione TypeScript
```

## Dettagli Cartelle Chiave

### `src/`
Tutta la logica, stile e contenuto processato del blog.
- **`pages/`**: Definisce le rotte pubbliche. I file qui dentro diventano automaticamente URL. `index.astro` è la `/`.
- **`content/`**: Sostituisce la vecchia logica manuale di parsing Markdown. Tutti i file qui sono tipizzati e validati.
- **`layouts/`**: `Layout.astro` costruisce la struttura HTML base, includendo SEO headers e il `ViewTransitions` engine.

### `public/`
Usata per asset come la favicon e i file *font* locali (`.woff2`) per garantire stabilità visiva.
Tutto ciò che sta qui è servito dritto nella root del server (es: `/favicon.png`).
