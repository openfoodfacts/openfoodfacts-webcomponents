# openfoodfacts-webcomponents

[![npm](https://img.shields.io/npm/v/@openfoodfacts/openfoodfacts-webcomponents.svg)](https://www.npmjs.com/package/@openfoodfacts/openfoodfacts-webcomponents)

A set of web components for Open Food Facts to help build edition interfaces

- Currently, we have Search webcomponents (coded in Lit) in https://github.com/openfoodfacts/openfoodfacts-search
- Under development are components for nutrition editing, and Robotoff questions
- Projects/features that could benefit from having webcomponents: nutripatrol (display & input), folksonomy_api (display & input), knowledge panels (display), ingredients (display & input), photo upload, open prices (display & input), photo gallery/editing
- API calls could be delegated to [openfoodfacts-nodejs](https://github.com/openfoodfacts/openfoodfacts-nodejs)
- Candidates for using such webcomponents are: [openfoodfacts-server](https://github.com/openfoodfacts/openfoodfacts-server), [openfoodfacts-explorer](https://github.com/openfoodfacts/openfoodfacts-explorer) , [hunger-games](https://github.com/openfoodfacts/hunger-games) and potentially open-prices

## Currently available webcomponents

- Nutrition editing (with Nutri-Sight integration)
- Robotoff Questions
- Donation banner
- Mobile badges
- Knowledge Panels

## Design

- openfoodfacts-webcomo is a set of web components for Open Food Facts to help build interfaces (view and edits). The idea is to reach feature parity on the essential stuff with the main frontend to eventually replace it, with a great responsive UI (80%+ of our traffic is mobile web).
- We currently don’t have any real visual mockup of it, nor “artistic direction” so for the time being, we're copying key features from the current frontend, improving them whenever we can.
- [![Figma](https://img.shields.io/badge/figma-%23F24E1E.svg?logo=figma&logoColor=white) Mockups on the current website](<[https://www.figma.com/design/Qg9URUyrjHgYmnDHXRsTTB/Current-Website-design?m=auto&t=RokuCr1uXrGFMhTB-6](https://www.figma.com/design/Qg9URUyrjHgYmnDHXRsTTB/Current-Website-design?m=auto&t=RokuCr1uXrGFMhTB-6)>)
- TODO: Create a webcomponents FIGMA file

## Weekly meetings

- We e-meet Wednesdays · 11:00 – 11:25am - Time zone: Europe/Paris
- ![Google Meet](https://meet.google.com/uep-fhvf-gto) Video call link: https://meet.google.com/uep-fhvf-gto
- Join by phone: https://tel.meet/uep-fhvf-gto?pin=8160344286211
- Add the Event to your Calendar by [adding the Open Food Facts community calendar to your calendar](https://wiki.openfoodfacts.org/Events)
- [Weekly Agenda](https://docs.google.com/document/d/1BGHfvrgx5eFIGjK8aTNPK2QwAggRp4oohGuYG9lNX8g/edit?tab=t.0): please add the Agenda items as early as you can. Make sure to check the Agenda items in advance of the meeting, so that we have the most informed discussions possible, leading to argumented decisions.
- The meeting will handle Agenda items first, and if time permits, collaborative bug triage.
- We strive to timebox the core of the meeting (decision making) to 30 minutes, with an optional free discussion/live debugging afterwards.
- We take comprehensive notes in the Weekly Agenda of agenda item discussions and of decisions taken.

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

#### In addition to above steps, please also follow the below steps to generate translations and for tests.

1. Export your component in `webcomponents/src/off-webcomponents.ts`
2. Run `npm run translations:build` to build translation.
3. Add this to `webcomponents/index.html` to display it during test.
4. Also add the new component in `webcomponents/docs/index.html`.

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

You can find the documentation [here](https://openfoodfacts.github.io/openfoodfacts-webcomponents)

To work on documentation let see [this](web-components/docs/README.md)

## Rules

Each component has to follow this rules :

- its own folder in the `src` folder.
- attributes are in kebab-case
- boolean attributes have to be `false` by default
