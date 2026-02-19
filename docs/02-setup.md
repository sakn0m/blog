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
    Questo installerà tutte le librerie elencate in `package.json`, inclusi Next.js, React, e Tailwind CSS.

## Comandi Disponibili

### Sviluppo

Per avviare il server di sviluppo con hot-reloading:

```bash
npm run dev
```

Il sito sarà accessibile a `http://localhost:3000`.

### Build di Produzione

Per creare una build ottimizzata per la produzione:

```bash
npm run build
```

Questo comando genererà i file statici e compilerà il codice server-side nella cartella `.next`.

### Avvio Produzione

Per avviare il server usando la build di produzione (necessita di `npm run build` prima):

```bash
npm run start
```

### Linting

Per verificare la qualità del codice e trovare errori comuni:

```bash
npm run lint
```
