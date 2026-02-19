# Configurazione e Avvio

Questa guida spiega come configurare l'ambiente di sviluppo locale e avviare il server.

## Prerequisiti

Assicurati di avere installato:
-   **Node.js**: Versione 20 o superiore (raccomandata LTS).
-   **npm**: Gestore pacchetti (incluso con Node.js).
-   **Git**: Per clonare il repository.

## Installazione

1.  **Clona il repository**:
    ```bash
    git clone <url-del-repository>
    cd blog
    ```

2.  **Installa le dipendenze**:
    ```bash
    npm install
    ```
    Questo installerà tutte le librerie elencate in `package.json`, inclusi Astro e Tailwind CSS.

## Comandi Disponibili

### Sviluppo

Per avviare il server di sviluppo con hot-reloading:

```bash
npm run dev
```

Il sito sarà accessibile a `http://localhost:4321` (porta di default di Astro).

### Build di Produzione

Per creare una build ottimizzata per la produzione:

```bash
npm run build
```

Questo comando genererà i file statici nella cartella `dist/`.

### Avvio Preview Locale

Per testare la build di produzione localmente prima del deploy:

```bash
npm run preview
```
