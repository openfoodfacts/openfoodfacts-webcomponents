# Publishing

## Automatic releases

Release Please opens a release pull request. Merging it creates a GitHub release, which triggers the [package publication workflow](../.github/workflows/package.yml) for npm and GitHub Packages. Check the workflow results after the release.

## Manual publication

To publish manually, you need permission to publish packages in the Open Food Facts npm organization.

1. Update the version in `web-components/package.json` following [semantic versioning](https://semver.org/).
2. Update the changelog with the new version and its changes.
3. From `web-components`, run `npm run publish:package` to build and publish the package.
4. Tag the release commit with `git tag X.Y.Z`, replacing `X.Y.Z` with the package version, and push the tag with `git push --tags`.
