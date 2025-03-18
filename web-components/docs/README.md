# Web Components Documentation

This is a documentation for the Open Food Facts Web Components.

## Getting Started

### Prerequisites

Install project like its described [here](../../README.md)

### Serve documentation locally

To serve the documentation locally, run the following command: `npm run dev:doc`. It will serve the documentation on `http://localhost:8000`.

```bash
npm run serve:doc
```

### Update documentation

To update the documentation, your need to uncomment `<script type="module" src="dist/off-webcomponents.bundled.js"></script>` in [index.html](./index.html) and comment `<script type="module" src="https://cdn.jsdelivr.net/npm/@openfoodfacts/openfoodfacts-webcomponents/dist/off-webcomponents.bundled.js"></script>`.

Run the following command: `npm run dev:doc`. This will :

- build the web components
- update `custom-elements.json` that is used by api-viewer-element to display the documentation.
- serve the documentation on `http://localhost:8000`.

Now you can then update the documentation.

Do not forget to comment `<script type="module" src="dist/off-webcomponents.bundled.js"></script>` and uncomment `<script type="module" src="https://cdn.jsdelivr.net/npm/@openfoodfacts/openfoodfacts-webcomponents/dist/off-webcomponents.bundled.js"></script>` before committing.
