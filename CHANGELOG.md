# Changelog

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

## [1.1.0] - 2025-03-05

## Changed

- Change the `robotoff-configuration` to `off-web-components-configuration` to add all possible configuration for the web components, in this case `language-code`
- Build language files with rollup for the web components to fix the issue wit html from lit.

## [1.1.1] - 2025-03-05

## Fixed

- Fix the property `robotoff-configuration` in `off-web-components-configuration` to be correctly set has a property of the web component.

## [1.2.0] - 2025-03-05

## Changed

- Remove max-width from `robotoff-question` to allow it to be used in a flex container.
- Add `showImage` in `options` property of `robotoff-question` to allow to hide or show the image.

## [1.2.1] - 2025-03-18

## Changed

- Update event to simplify this behavior to simplify the code and make it more easier to integrate in openfoodfacts-server.
- Add `annotated: false` to insights api call to get only the nutrients without the annotations.

## [1.2.2] - 2025-03-26

## Changed

- Add `donation-banner` web component to show the donation banner in the web components.
- Add parameter `assets-images-path` to `off-web-components-configuration` to allow to change the path of the assets images.

## [1.3.0] - 2025-04-02

## Changed

- Add `mobile-badges` web component to show the mobile badges in the web components.
- Update `donation-banner` web component to automatically update the year in the donation banner. And allow to change the year with the `year` property.

## [1.4.0] - 2025-04-07

- Use kebab-case for each property of the web components to be more consistent.
- Add `barcode-scanner` web component to scan a barcode and find out its details (health, preferences, etc.).
- Add `download-app-qr-code` web component to show the QR code to download the app.
- Fix boolean properties to be `false` by default.
- Update `robotoff-question` and `robotoff-nutrients` web components to be more easier to use in openfoodfacts website.
- Add some translations for the web components.

## [1.4.1] - 2025-04-08

- Fix `BarcodeScannerState` enum to be string instead of number.

## [1.4.2] - 2025-04-08

- Fix `runScanner` property to be kebab-case : `run-scanner`.
- Fix `runScanner` property to detect update, and start the scanner when it is set to `true` if the scanner has code reader available.
