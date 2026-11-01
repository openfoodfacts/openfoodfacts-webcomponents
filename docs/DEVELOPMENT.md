# Development

## Prerequisites

Use Node.js 24 and npm for development. The `.nvmrc` file specifies the version used by CI. With [nvm](https://github.com/nvm-sh/nvm#installing-and-updating), run `nvm install` and `nvm use` from the repository root.

## Installation

Clone the repository:

```bash
git clone https://github.com/openfoodfacts/openfoodfacts-webcomponents.git
```

Navigate to the web-components directory:

```bash
cd openfoodfacts-webcomponents/web-components
```

Install dependencies:

```bash
npm install
```

## Local development

From the `web-components` directory, start the development server:

```bash
npm run dev
```

Go to http://localhost:6006 to see Storybook.

## Test local changes in another project

Build the webcomponents with `npm run build` in the `openfoodfacts-webcomponents/web-components` directory.

In the consuming project's `package.json`, add the following entry to `dependencies`, adjusting the relative path to point to your local `web-components` directory:

```json
"@openfoodfacts/openfoodfacts-webcomponents": "file:../openfoodfacts-webcomponents/web-components"
```

Then run `npm install` to install the local version of the webcomponents.

## Adding a component

1. Export your component in `web-components/src/off-webcomponents.ts`.
2. Run `npm run translations:build` to build translation.
3. Add a Storybook story to demonstrate and test the component.

## Test nutrient annotation locally

To test annotating nutrients in local you need credential cookie for dev api.
To have it, you need to follow these steps:

1. Run the project locally as described above.
2. Edit your hosts file `/etc/hosts` to add the following line:
   `127.0.0.1 wc.openfoodfacts.net`
3. Login to http://world.openfoodfacts.net with your Open Food Facts account. (the first basic auth login is off/off)
4. Go to any product page and upload an image that you want to annotate. The image should not already exist on this product.
5. Go to http://wc.openfoodfacts.net:6006 to get cookie for api.
6. Use the `barcode` of the product to annotate it.

## Component rules

Each component has to follow this rules :

- its own folder in the `src` folder.
- attributes are in kebab-case
- boolean attributes have to be `false` by default to follow this [rule](https://lit.dev/docs/components/properties/#boolean-attributes)
