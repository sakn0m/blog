# Panoramica del Progetto

Questo repository contiene un blog statico/dinamico costruito con tecnologie moderne. È progettato per essere veloce, accessibile e facilmente gestibile tramite file Markdown locali.

## Stack Tecnologico

Il progetto utilizza le seguenti tecnologie principali:

- **Framework**: [Astro 5](https://astro.build/)
- **Linguaggio**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Libraries & Tools**:
  - `satori` e `sharp` per la generazione di immagini Open Graph
- **Gestione Contenuti**:
  - Astro Content Collections (`astro:content`) con validazione Zod per i post in Markdown.
- **Transizioni**:
  - View Transitions native di Astro per navigazioni fluide tipo SPA.

## Obiettivo

L'obiettivo è fornire una piattaforma di blogging semplice ma potente dove:
1. I contenuti sono scritti in Markdown puro.
2. Il design è gestito centralmente tramite Tailwind CSS.
3. La performance è massimizzata grazie ad Astro (zero JS by default).
4. L'esperienza utente è fluida (animazioni staggered, transizioni SPA-like, dark mode inline).

## Caratteristiche Chiave

- **Content Collections**: I post sono strettamente tipizzati tramite schema Zod (Vedi `src/content.config.ts`).
- **Dark Mode Island**: Supporto nativo per tema chiaro/scuro ottimizzato per prevenire il flash of unstyled content (FOUC).
- **SEO Friendly**: Metadata dinamici, Open Graph Images generate automaticamente, Sitemap.
- **Responsive & Animato**: Layout adattivo con micro-animazioni CSS temporizzate per un effetto elegante al primo caricamento.
