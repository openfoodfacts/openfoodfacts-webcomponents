# Changelog

## 1.8.0 - 2025-06-10

### Changed

- Add `language-codes` attribute to `robotoff-contribution-message` to filter insights by language.
- Group insights in one request to `robotoff-contribution-message` to reduce the number of requests.
- Add robotoff-ingredient-detection in `robotoff-modal` and `robotoff-contribution-message`.
- Update `robotoff-ingredient-detection` to fire state event
- Increase max width of `robotoff-nutrient-extraction` image to 700px.
- Add view product link to `robotoff-nutrient-extraction`, `robotoff-ingredient-detection` and `robotoff-ingredient-spellcheck`.

### Fixed

- Fix the `robotoff-ingredient-detection` issue that resets the image when the crop mode is toggled and the edit mode is enabled.

## [1.7.1] - 2025-06-10

### Changed

- Update dependencies to be up-to-date with the latest versions.
- Update translations

### Fixed

- Fix `mobile-badges` to display the correct path for the images.
- Fix `donation-banner` styling.
- Fix `folksonomy-editor` to display the autocomplete list correctly.

## [1.7.0] - 2025-05-26

### Added

- Add `robotoff-ingredient-detection` component.

### Changed

- Rename `robotoff-ingredients` to `robotoff-ingredient-spellcheck` to be closer to the API endpoint.
- Rename `robotoff-nutrients` to `robotoff-nutrient-extraction` to be closer to the API endpoint.
- Refactor `text-corrector` to create a new component to highlight the differences between the original text and the corrected text. This component is called `text-corrector-highlight`.

## [1.6.0] - 2025-05-26

### Added

- Add `LoadingWithTimeoutMixin` to avoid multiple submit.
- Add it to `robotoff-nutrients`, `robotoff-questions` and `robotoff-ingredients`.
- Add `displayInEditForm` keys by default except `alcohol` if it's not present.
- Add `loading-button` component to handle loading behavior.

### Changed

- Rename `robotoff-nutrients-table` to `robotoff-nutrients-form`.
- Remove `energy` key because it will be compute by Robotoff.

### Fixed

- Fix suggestions in `robotoff-nutrients-form` to avoid showing suggestions with similar values. For exemple : "0.5" and "0.50".
- Fix refresh `robotoff-ingredients` when `language-codes` change.
- Fix dependencies versions.

## [1.5.2] - 2025-05-22

### Fixed

- Fix robotoff ingredients annotation to send the good data format.

## [1.5.1] - 2025-05-19

### Fixed

- Fix robotoff suggestions to avoid showing `null` unit in `robotoff-nutrients-table`.

## [1.5.0] - 2025-05-19

### Added

- Add `autocomplete-input` web component for enhanced input fields with suggestion capabilities
- Add Folksonomy Editor Advanced Features for improved taxonomy management
- Add new translations for French and Spanish languages
- Add `contribution-message` web component for displaying user contribution messages

### Changed

- Improve autocomplete functionality with better suggestion handling
- Update Robotoff components (nutrients, contribution message) for better performance
- Update API interactions and type definitions for better integration

### Fixed

- Various bug fixes and performance improvements

## [1.4.2] - 2025-04-08

### Fixed

- Fix `runScanner` property to be kebab-case : `run-scanner`.
- Fix `runScanner` property to detect update, and start the scanner when it is set to `true` if the scanner has code reader available.

## [1.4.1] - 2025-04-08

### Fixed

- Fix `BarcodeScannerState` enum to be string instead of number.

## [1.4.0] - 2025-04-07

### Added

- Add `barcode-scanner` web component to scan a barcode and find out its details (health, preferences, etc.).
- Add `download-app-qr-code` web component to show the QR code to download the app.
- Add some translations for the web components.

### Changed

- Use kebab-case for each property of the web components to be more consistent.
- Fix boolean properties to be `false` by default.
- Update `robotoff-question` and `robotoff-nutrients` web components to be more easier to use in openfoodfacts website.

## [1.2.2] - 2025-03-26

### Added

- Add `donation-banner` web component to show the donation banner in the web components.
- Add parameter `assets-images-path` to `off-web-components-configuration` to allow to change the path of the assets images.
- Add `mobile-badges` web component to show the mobile badges in the web components.
- Update `donation-banner` web component to automatically update the year in the donation banner. And allow to change the year with the `year` property.

## [1.2.1] - 2025-03-18

### Changed

- Update event to simplify this behavior to simplify the code and make it more easier to integrate in openfoodfacts-server.
- Add `annotated: false` to insights api call to get only the nutrients without the annotations.

## [1.2.0] - 2025-03-05

### Changed

- Remove max-width from `robotoff-question` to allow it to be used in a flex container.
- Add `showImage` in `options` property of `robotoff-question` to allow to hide or show the image.

## [1.1.1] - 2025-03-05

### Fixed

- Fix the property `robotoff-configuration` in `off-web-components-configuration` to be correctly set has a property of the web component.

## [1.1.0] - 2025-03-05

### Changed

- Change the `robotoff-configuration` to `off-web-components-configuration` to add all possible configuration for the web components, in this case `language-code`
- Build language files with rollup for the web components to fix the issue wit html from lit.

## [1.0.0] - 2025-02-04

### Added

- Configure rollup to build the web components.
- Implementation of `robotoff-question` web component.
- Implementation of `robotoff-configuration` that allow to configure the interraction with the Robotoff API with :
  - `dryRun` : to simulate the API call without actually sending the data.
  - `apiUrl` : to configure the API URL.
  - `imgUrl` : to configure the image URL.
- Implementation of `robotoff-nutrients` web component.
- Add docs for the web components on `web-components/docs`
