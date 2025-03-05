# Changelog

## [1.0.0] - 2025-02-04

### Added

- Configure rollup to build the web components.
- Implementation of `robotoff-question` web component.
- Implementation of `robotoff-configuration` that allow to configure the interraction with the Robotoff API with :
  - `dry-run` : to simulate the API call without actually sending the data.
  - `api-url` : to configure the API URL.
  - `img-url` : to configure the image URL.
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
