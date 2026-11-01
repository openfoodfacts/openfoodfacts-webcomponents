# openfoodfacts-webcomponents

[![npm](https://img.shields.io/npm/v/@openfoodfacts/openfoodfacts-webcomponents.svg)](https://www.npmjs.com/package/@openfoodfacts/openfoodfacts-webcomponents)

Building an Open Food Facts interface? These reusable web components help with everything from editing nutrition data and answering Robotoff questions to displaying products. Explore the components below or browse their [documentation](https://openfoodfacts.github.io/openfoodfacts-webcomponents/).

For search components, see [openfoodfacts-search](https://github.com/openfoodfacts/openfoodfacts-search).

## 🚀 Using the library

Install the package with npm:

```bash
npm install @openfoodfacts/openfoodfacts-webcomponents @webcomponents/webcomponentsjs
```

Import the library and the web components polyfill in your JavaScript entry point:

```js
import "@webcomponents/webcomponentsjs/webcomponents-loader.js";
import "@openfoodfacts/openfoodfacts-webcomponents";
```

Then use a component in your HTML:

```html
<robotoff-question
  product-code="0628233671356"
  insight-types=""
  options='{"showMessage": true, "showLoading": true, "showError": true}'
></robotoff-question>
```

See the full [usage guide](docs/USAGE.md) for CDN usage, configuration, and more details.

## 🧩 Components

The following components are available in the library:

### 🤖 Robotoff

- [Nutrition editing (with Nutri-Sight integration)](https://openfoodfacts.github.io/openfoodfacts-webcomponents/#robotoff-nutrient-extraction)
- [Robotoff Questions](https://openfoodfacts.github.io/openfoodfacts-webcomponents/#robotoff-question)
- [Robotoff Ingredients Spellcheck](https://openfoodfacts.github.io/openfoodfacts-webcomponents/#robotoff-ingredient-spellcheck)
- [Robotoff Ingredients Detection](https://openfoodfacts.github.io/openfoodfacts-webcomponents/#robotoff-ingredient-detection)
- [Robotoff Contribution Message](https://openfoodfacts.github.io/openfoodfacts-webcomponents/#robotoff-contribution-message)

### Interface elements

- [Donation Banner](https://openfoodfacts.github.io/openfoodfacts-webcomponents/#donation-banner)
- [Donation Meter](https://openfoodfacts.github.io/openfoodfacts-webcomponents/#donation-meter)
- [Mobile Badges](https://openfoodfacts.github.io/openfoodfacts-webcomponents/#mobile-badges)
- [Barcode Scanner](https://openfoodfacts.github.io/openfoodfacts-webcomponents/#barcode-scanner)
- [Autocomplete Input](https://openfoodfacts.github.io/openfoodfacts-webcomponents/#autocomplete-input)
- [Product Card](https://openfoodfacts.github.io/openfoodfacts-webcomponents/#product-card)

### 🔖 Folksonomy Engine

- [Folksonomy Editor](https://openfoodfacts.github.io/openfoodfacts-webcomponents/#folksonomy-editor)
- Folksonomy property listings

### ⚙️ Configuration

- [Off WebComponents configuration](https://openfoodfacts.github.io/openfoodfacts-webcomponents/#off-webcomponents-configuration)

### 🚧 Work in progress

- Knowledge Panels

## 🛠️ Development

Want to build or improve a component? The [development guide](docs/DEVELOPMENT.md) covers setup, testing, and component guidelines.

## 🎨 Design

Components should support responsive interfaces for viewing and editing Open Food Facts data. Use these design files as references:

- [Current website designs](https://www.figma.com/design/Qg9URUyrjHgYmnDHXRsTTB/Current-Website-design?m=auto&t=RokuCr1uXrGFMhTB-6)
- [Web component designs](https://www.figma.com/design/X8nBndPdBfikAcevBiBxKo/Web-Components?node-id=0-1&p=f&t=A7yCwKqyW9klqYq8-0)

## 📚 Documentation

Explore the [component documentation](https://openfoodfacts.github.io/openfoodfacts-webcomponents/).

Component examples and documentation are maintained in Storybook stories.

## 📆 Weekly meetings

Come meet the team on Wednesdays from 11:00 to 11:25 (Europe/Paris)! Join via [Google Meet](https://meet.google.com/uep-fhvf-gto) or [by phone](https://tel.meet/uep-fhvf-gto?pin=8160344286211). You can also add the [Open Food Facts community calendar](https://wiki.openfoodfacts.org/Events) to your calendar.

Please add topics to the [weekly agenda](https://docs.google.com/document/d/1BGHfvrgx5eFIGjK8aTNPK2QwAggRp4oohGuYG9lNX8g/edit?tab=t.0) and review it before the meeting. The team records discussions and decisions there, and may use remaining time for bug triage or debugging.
