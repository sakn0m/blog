# Deploy e Produzione

Il blog è ottimizzato per il deploy su piattaforme di hosting statico o serverless come Vercel, Netlify, o un server VPS tradizionale.

## Vercel (Consigliato)

Essendo un progetto Next.js, Vercel offre l'integrazione migliore.

1.  Collega il repository GitHub a Vercel.
2.  Vercel rileverà automaticamente che è un progetto Next.js.
3.  Configurazione di build predefinita:
    -   **Build Command**: `next build`
    -   **Output Directory**: `.next`
    -   **Install Command**: `npm install`
4.  Deploy.

Ogni volta che fai push su `main`, Vercel ricostruirà il sito e aggiornerà i contenuti.

## Generazione di Immagini Open Graph (OG)

Il progetto include `opengraph-image.tsx` nella cartella `app/posts/[slug]/`.
Next.js genererà automaticamente un'immagine di anteprima per i social media per ogni post, basandosi sul titolo o altri metadati del post. Non è necessaria alcuna configurazione manuale.
L'immagine sarà disponibile all'URL del post.

## Performance Check

Prima di andare in produzione, verifica:
-   **Lighthouse Score**: Esegui un audit in Chrome DevTools.
-   **Immagini**: Assicurati che le immagini in `public/` non siano eccessivamente pesanti (meglio usare WebP se possibile, anche se Next.js ottimizza molto).
-   **Link Rotti**: Controlla che tutti i link nei file Markdown siano corretti.
