# openfoodfacts-webcomponents

[![npm](https://img.shields.io/npm/v/@openfoodfacts/openfoodfacts-webcomponents.svg)](https://www.npmjs.com/package/@openfoodfacts/openfoodfacts-webcomponents)

A set of web components for Open Food Facts to help build edition interfaces

- Currently, we have Search webcomponents (coded in Lit) in https://github.com/openfoodfacts/openfoodfacts-search
- Under development are components for nutrition editing, and Robotoff questions
- Projects/features that could benefit from having webcomponents: nutripatrol (display & input), folksonomy_api (display & input), knowledge panels (display), ingredients (display & input), photo upload, open prices (display & input), photo gallery/editing
- API calls could be delegated to [openfoodfacts-nodejs](https://github.com/openfoodfacts/openfoodfacts-nodejs)
- Candidates for using such webcomponents are: [openfoodfacts-server](https://github.com/openfoodfacts/openfoodfacts-server), [openfoodfacts-explorer](https://github.com/openfoodfacts/openfoodfacts-explorer) , [hunger-games](https://github.com/openfoodfacts/hunger-games) and potentially open-prices

## NPM Package

The components are now published on NPM here: https://www.npmjs.com/package/@openfoodfacts/openfoodfacts-webcomponents

### Publishing

To publish a new version, you need to be a member of the Open Food Facts organization on npm.

- Update the version in `package.json` following [semantic versioning](https://semver.org/).

- Update the `CHANGELOG.md` file with the new version number and the changes made in this version.

- Run the following command to build and publish the package:`npm run publish:package`

- Add a tag to the commit: `git tag X.Y.Z` (replace X.Y.Z with the package version number). Then push the tag to GitHub: `git push --tags`

## Getting Started

### Prerequisites

Ensure you have Node.js and npm installed on your machine. We recommend using the version specified in the .nvmrc file. You can use nvm directly to install it with : `nvm install` and `nvm use`. You can find more information [here](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating).

### Installation

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

## Usage

### Local Development

If you use nvm, you can use the .nvmrc file to set the right node version:

```bash
nvm use
nvm install
```

To run the project locally:

Navigate to the web-components directory (if not already there):

```bash
cd web-components
```

Install dependencies (if not already done):

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Go to http://localhost:8000 to see the demo.

#### How to test annotating in local

To test annotating nutrients in local you need credential cookie for dev api.
To have it, you need to follow these steps:

1. Run the project locally as described above.
2. Edit your hosts file `/etc/hosts` to add the following line:
   `127.0.0.1 wc.openfoodfacts.net`
3. Login to http://world.openfoodfacts.net with your Open Food Facts account. (the first basic auth login is off/off)
4. Go to any product page and upload an image that you want to annotate. The image should not already exist on this product.
5. Go to http://wc.openfoodfacts.net:8000 to get cookie for api. It will redirect you to the local index.html page.
6. Use the `barcode` of the product to annotate it.

### To use it like a library check the [web-components/README.md](web-components/README.md) file

## Documentation

Link to documentation will be available soon.

To work on document let see [this](web-components/docs/README.md)
