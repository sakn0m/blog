# Panoramica del Progetto

Questo repository contiene un blog statico/dinamico costruito con tecnologie moderne. È progettato per essere veloce, accessibile e facilmente gestibile tramite file Markdown locali.

## Stack Tecnologico

Il progetto utilizza le seguenti tecnologie principali:

- **Framework**: [Next.js 16.1.1](https://nextjs.org/) (App Router)
- **Linguaggio**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Libraries**:
  - [Lucide React](https://lucide.dev/) (Icone)
  - [Next Themes](https://github.com/pacocoursey/next-themes) (Gestione Dark Mode)
- **Gestione Contenuti**:
  - [Gray-matter](https://github.com/jonschlinkert/gray-matter) (Parsing Frontmatter)
  - [Markdown-to-JSX](https://github.com/quantizor/markdown-to-jsx) (Rendering Markdown come Componenti React)
- **Linting & Formatting**: ESLint 9

## Obiettivo

L'obiettivo è fornire una piattaforma di blogging semplice ma potente dove:
1.  I contenuti sono scritti in Markdown puro.
2.  Il design è gestito centralmente tramite Tailwind CSS.
3.  La performance è massimizzata grazie a Next.js (SSR/SSG).
4.  L'esperienza utente è fluida (transizioni, dark mode).

## Caratteristiche Chiave

-   **Routing Dinamico**: Le pagine dei post sono generate dinamicamente basandosi sugli slug dei file Markdown. (Vedi `app/posts/[slug]`).
-   **Dark Mode**: Supporto nativo per tema chiaro/scuro con persistenza delle preferenze utente.
-   **SEO Friendly**: Metadata dinamici, Open Graph Images generate automaticamente, Sitemap.
-   **Responsive**: Layout adattivo per mobile, tablet e desktop.
