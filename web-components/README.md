# openfoodfacts-webcomponents

A set of web components for Open Food Facts to help build edition interfaces.

## Documentation

Link to documentation will be available soon.
You will see the list of available components and how to use them.

## Getting Started

### Installation with npm

`npm install @openfoodfacts/openfoodfacts-webcomponents`

### Import it in your project

You can use the components via ES6 modules or via script tag. To be sure webcomponents are handled correctly, you have to inport the polyfill.
More details [here](https://lit.dev/docs/v1/tools/use/).

#### Download polyfill

`npm install @webcomponents/webcomponentsjs`

#### Via ES6 modules

```js
import "@webcomponents/webcomponentsjs/webcomponents-loader.js"
import * as offWebComponents from "@openfoodfacts/openfoodfacts-webcomponents/dist/off-webcomponents.bundled.js"
```

#### Via script tag

```html
<script src="path-to/webcomponents-loader.js"></script>
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@openfoodfacts/openfoodfacts-webcomponents/dist/off-webcomponents.bundled.js"
></script>
`
```

### Usage

After importing you can use them in your HTML like this example :

```html
<robotoff-question
  product-code="0628233671356"
  insight-types=""
  options='{"showMessage": true, "showLoading": true, "showError": true}'
/>
```

To use components with good configuration you have to add only one time the `off-webcomponents-configuration` before every components in your HTML.
It has this parameters :

- `robotoff-configuration` : configuration for robotoff components
  - `api-url` : url of the robotoff api
  - `img-url` : url of the images of the products
  - `dry-run` : usefull for testing annotations without saving them, default is `false`. It will console.log the annotations instead of sending them to the api.
- `language-code` : language code of the user, default is `en`

The default configuration is :

```html
<off-webcomponents-configuration
  language-code="en"
  robotoff-configuration='{
          "dryRun": false,
          "apiUrl": "https://robotoff.openfoodfacts.net/api/v1",
          "imgUrl": "https://images.openfoodfacts.net/images/products"
        }'
></off-webcomponents-configuration>
```
