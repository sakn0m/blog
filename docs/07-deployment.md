# Deploy e Produzione

Il blog è ottimizzato per il deploy su piattaforme di hosting statico o serverless come Vercel, Netlify, o un server VPS tradizionale.

## Vercel (Consigliato)

Essendo un progetto Astro, Vercel offre l'integrazione migliore.

1.  Collega il repository GitHub a Vercel.
2.  Vercel rileverà automaticamente che è un progetto Astro.
3.  Configurazione di build predefinita:
    -   **Build Command**: `astro build`
    -   **Output Directory**: `dist/`
    -   **Install Command**: `npm install`
4.  Deploy.

Ogni volta che fai push su `main`, Vercel ricostruirà il sito e aggiornerà i contenuti.

## Generazione di Immagini Open Graph (OG)

Il progetto genera le immagini OG al momento della build tramite `satori` e `sharp`:

- `src/pages/og.png.ts` — immagine OG per la homepage.
- `src/pages/og/[slug].png.ts` — immagini OG per ogni singolo post.

Le immagini vengono create automaticamente durante `astro build` e incluse nella cartella `dist/`. Non è necessaria alcuna configurazione manuale.

## Performance Check

Prima di andare in produzione, verifica:
-   **Lighthouse Score**: Esegui un audit in Chrome DevTools.
-   **Immagini**: Assicurati che le immagini in `public/` non siano eccessivamente pesanti (meglio usare WebP se possibile).
-   **Link Rotti**: Controlla che tutti i link nei file Markdown siano corretti.
