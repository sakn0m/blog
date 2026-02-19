# Gestione dei Contenuti (CMS)

Il blog utilizza file Markdown locali come fonte dati. Non c'è un database tradizionale; il "database" è la cartella `posts/`.

## Creare un Nuovo Post

1.  Naviga nella cartella `posts/` nella root del progetto.
2.  Crea un nuovo file con estensione `.md`, ad esempio `nuovo-articolo.md`. Il nome del file diventerà lo **slug** nell'URL.
3.  All'inizio del file, inserisci il blocco **Frontmatter** (metadati YAML) delimitato da `---`.

### Esempio di Post Completo

File: `posts/il-mio-primo-post.md`

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

## Frontmatter Richiesto

Ogni post **DEVE** avere i seguenti campi nel frontmatter:

-   **`title`** (stringa): Il titolo mostra nella homepage e nella pagina del post.
-   **`date`** (stringa): La data di pubblicazione in formato `YYYY-MM-DD` o stringa leggibile. Usata per l'ordinamento.

## Sintassi Supportata

Il rendering è gestito da `markdown-to-jsx` e supporta:
-   **Testo in grassetto/corsivo**: `**bold**`, `*italic*`
-   **Elenchi**: `-` o `1.`
-   **Citazioni**: `>`
-   **Codice**: Blocchi di codice con o senza language syntax highlighting.
-   **Link**: `[testo](url)`
-   **Immagini**: `![alt](src)` (renderizzate tramite un componente personalizzato `MarkdownImage` per ottimizzazione).

## Immagini

Le immagini vengono ottimizzate automaticamente se si trovano nella cartella `public`.
Quando scrivi il percorso dell'immagine nel Markdown, usa il percorso assoluto dalla root (ovvero iniziando con `/`).
Esempio: `![banner](/images/banner.png)` carica l'immagine da `public/images/banner.png`.
