# openfoodfacts-webcomponents

A set of web components for Open Food Facts to help build edition interfaces

- Currently, we have Search webcomponents (coded in Lit) in https://github.com/openfoodfacts/openfoodfacts-search
- Candidates for using such webcomponents are: https://github.com/openfoodfacts/openfoodfacts-server, https://github.com/openfoodfacts/openfoodfacts-explorer, https://github.com/openfoodfacts/hunger-games and potentially open-prices

## Getting Started

### Prerequisites

Ensure you have Node.js and npm installed on your machine.

### Installation

from `web-components` folder run `npm install`.

### Usage

#### Local

If you use nvm, you can use the `.nvmrc` file to set the right node version.

To use .nvmrc file, run the following command in root of project :

```bash
nvm use
nvm install

```

To run the project locally, use the following command to build from `web-components` folder:
`npm install`
and then
`npm run dev`

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
