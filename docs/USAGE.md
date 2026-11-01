# Using the library

## Installation

`npm install @openfoodfacts/openfoodfacts-webcomponents`

ES module imports use the unbundled package modules.

## With CDN

The CDN build is an ES module with the component code bundled. It loads locale chunks on demand from
`dist/lang/esm/`:
[https://cdn.jsdelivr.net/npm/@openfoodfacts/openfoodfacts-webcomponents/dist/off-webcomponents.bundled.js](https://cdn.jsdelivr.net/npm/@openfoodfacts/openfoodfacts-webcomponents/dist/off-webcomponents.bundled.js)

## Import it in your project

You can use the components via ES6 modules or via script tag. To be sure webcomponents are handled correctly, you have to import the polyfill.
More details can be found in the [Lit web components polyfill documentation](https://lit.dev/docs/v1/tools/use/).

### Download polyfill

`npm install @webcomponents/webcomponentsjs`

### Via ES6 modules

```js
import "@webcomponents/webcomponentsjs/webcomponents-loader.js"
import "@openfoodfacts/openfoodfacts-webcomponents"
```

### Via script tag

```html
<script src="<path-to-webcomponentsjs>/webcomponents-loader.js"></script>
<script
  type="module"
  src="<path-to-openfoodfacts-webcomponents>/dist/off-webcomponents.bundled.js"
></script>
```

The locale chunks are shipped with the package. When self-hosting the build, copy `dist/lang/esm/`
alongside the bundle and preserve that path (or copy the entire `dist/` directory). You do not need to
copy locale files individually.

## Component example

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
- `assets-images-path` : path of the images in assets/images folder, default is `/assets/images`

The default configuration is :

```html
<off-webcomponents-configuration
  language-code="en"
  robotoff-configuration='{
          "dryRun": false,
          "apiUrl": "https://robotoff.openfoodfacts.net/api/v1",
          "imgUrl": "https://images.openfoodfacts.net/images/products"
        }'
  assets-images-path="/assets/images"
></off-webcomponents-configuration>
<off-boolean-attribute></off-boolean-attribute>
```

### Boolean attributes

For boolean we follow the convention of lit [here](https://lit.dev/docs/components/properties/#boolean-attributes) Boolean is set to `false` by default and ca be use like this:

- `true` :

```html
<off-boolean-attribute hide></off-boolean-attribute>
```

- `false` :

```html
<off-boolean-attribute></off-boolean-attribute>
```
