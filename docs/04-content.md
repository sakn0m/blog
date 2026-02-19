# Gestione dei Contenuti (CMS)

Il blog utilizza file Markdown locali come fonte dati. Il "database" è la cartella `src/content/posts/`.

## Creare un Nuovo Post

1.  Naviga nella cartella `src/content/posts/` nella root del progetto.
2.  Crea un nuovo file con estensione `.md`, ad esempio `nuovo-articolo.md`. Il nome del file diventerà lo **slug** nell'URL.
3.  All'inizio del file, inserisci il blocco **Frontmatter** (metadati YAML) delimitato da `---`.

### Esempio di Post Completo

File: `src/content/posts/il-mio-primo-post.md`

```markdown
---
title: "Il Mio Primo Post"
date: "2024-05-20"
---

Questo è il contenuto del post. Puoi usare la sintassi Markdown standard.

## Sottotitolo

Ecco una lista:
- Elemento 1
- Elemento 2

### Immagini
Per inserire immagini, assicurati che il file immagine sia nella cartella `public/`.
Esempio: se hai `public/foto.jpg`:

![Descrizione foto](/foto.jpg)
```

## Frontmatter Richiesto (Zod Validation)

Astro verificherà che ogni post abbia i campi richiesti come definito nello schema in `src/content.config.ts`. Di default:

-   **`title`** (stringa): Il titolo mostrato nella homepage e nella pagina del post.
-   **`date`** (stringa): La data di pubblicazione in formato `YYYY-MM-DD` o stringa leggibile. Usata per l'ordinamento.

Se ometti questi campi, la build di Astro fallirà, garantendo solidità dei dati.

## Sintassi Supportata

Astro elabora nativamente il Markdown e Markdown-flavored componenti:
-   **Testo in grassetto/corsivo**: `**bold**`, `*italic*`
-   **Elenchi**: `-` o `1.`
-   **Citazioni**: `>`
-   **Codice**: Blocchi di codice.

## Immagini

Le immagini statiche vanno nella cartella `public`.
Quando scrivi il percorso dell'immagine nel Markdown, usa il percorso assoluto dalla root (ovvero iniziando con `/`).
Esempio: `![banner](/immagini/banner.png)` caricherà l'immagine da `public/immagini/banner.png`.
