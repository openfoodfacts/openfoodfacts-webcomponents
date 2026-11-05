# openfoodfacts-webcomponents

A set of WebComponents for Open Food Facts to help build edition interfaces.

## Documentation

Link to documentation will be available soon.
You will see the list of available components and how to use them.

## Getting Started

### Installation with npm

`npm install @openfoodfacts/openfoodfacts-webcomponents`

### With CDN

Link : [https://cdn.jsdelivr.net/npm/@openfoodfacts/openfoodfacts-webcomponents/dist/off-webcomponents.bundled.js](https://cdn.jsdelivr.net/npm/@openfoodfacts/openfoodfacts-webcomponents/dist/off-webcomponents.bundled.js)

### Import it in your project

You can use the components via ES6 modules or via script tag. To be sure webcomponents are handled correctly, you have to import the polyfill.
More details can be found in the [Lit web components polyfill documentation](https://lit.dev/docs/v1/tools/use/).

#### Download polyfill

`npm install @webcomponents/webcomponentsjs`

#### Via ES6 modules

```js
import "@webcomponents/webcomponentsjs/webcomponents-loader.js"
import "@openfoodfacts/openfoodfacts-webcomponents"
```

Then you have to copy the localization files to your project.
If you use vite you can use the plugin [vite-plugin-static-copy](https://github.com/sapphi-red/vite-plugin-static-copy) to copy the localization files to your project.

```bash
npm install vite-plugin-static-copy
```

```javascript
import copy from "rollup-plugin-copy"
import path from "path"
export default defineConfig({
  // ...
  plugins: [
    // ...
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(
            __dirname,
            "node_modules/@openfoodfacts/openfoodfacts-webcomponents/dist/localization/locales/*.js"
          ),
          dest: "assets/localization/locales",
        },
      ],
    }),
  ],
  // ...
})
```

#### Via script tag

```html
<script src="<path-to-webcomponentsjs>/webcomponents-loader.js"></script>
<script
  type="module"
  src="<path-to-openfoodfacts-webcomponents>/dist/off-webcomponents.bundled.js"
></script>
```

Be sure to copy all the files in the `dist/localization/locales` folder to your project.

### Usage

After importing you can use them in your HTML like this example :

```html
<robotoff-question
  product-code="0628233671356"
  insight-types=""
  options='{"showMessage": true, "showLoading": true, "showError": true}'
/>
```

### Theming

Components that support the shared theme contract accept a `theme` attribute:

```html
<news-feed theme="auto"></news-feed>
<news-feed theme="light"></news-feed>
<news-feed theme="dark"></news-feed>
```

- `auto` (the default) follows the system color preference.
- `light` and `dark` select a mode independently of the system preference.

Shared styles use semantic `--off-color-*` custom properties. Define these on
an ancestor to style all compatible components, or directly on a component to
customize only that instance. A value defined directly on the host takes
precedence over an inherited ancestor value; either takes precedence over the
component's built-in fallback.

```css
.open-food-facts-page {
  --off-color-surface: #ffffff;
  --off-color-text: #1f2937;
  --off-color-border: #e5e7eb;
}

.featured-news {
  --off-color-surface: #fff7ed;
}
```

```html
<news-feed class="featured-news" theme="light"></news-feed>
```

Components can retain component-specific color properties where their palette
needs them. Those properties should fall back to shared semantic tokens, so
existing host customizations continue to work as the shared contract expands.

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

#### Boolean attributes

For boolean we follow the convention of lit [here](https://lit.dev/docs/components/properties/#boolean-attributes) Boolean is set to `false` by default and ca be use like this:

- `true` :

```html
<off-boolean-attribute hide></off-boolean-attribute>
```

- `false` :

```html
<off-boolean-attribute></off-boolean-attribute>
```
