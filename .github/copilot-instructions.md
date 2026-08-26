# Open Food Facts Web Components

Open Food Facts Web Components is a TypeScript/Lit.js library that provides reusable web components for Open Food Facts applications. The components include robotoff question interfaces, folksonomy editors, product displays, donation banners, and more.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the information here.

## Working Effectively

### Bootstrap and Setup
- Navigate to the web-components directory: `cd web-components`
- Install dependencies: `npm install` - takes 30 seconds. NEVER CANCEL.
- The repository uses Node.js (current version v20+ works fine, ignore the invalid .nvmrc at repo root)

### Build Process
- **CRITICAL**: Set timeout to 30+ minutes for all build commands. NEVER CANCEL builds.
- Clean build artifacts: `npm run clean` - takes <1 second
- Full production build: `npm run build` - takes 16 seconds. NEVER CANCEL. Set timeout to 60+ minutes.
- Development build with watch: `npm run build:watch` - initial build takes 16 seconds, rebuilds take 5 seconds
- Build includes translation processing and rollup bundling, produces dist/ folder with bundled JS and localization files

### Development Server
- Start development server: `npm run dev` - takes 16 seconds initial build, then starts server on http://127.0.0.1:8000
- Uses concurrently to run build watch + web dev server
- **NEVER CANCEL** the dev server startup. Wait for "Web Dev Server started..." message.
- Access demo page at http://127.0.0.1:8000 to see all available components

### Testing
- **IMPORTANT**: All tests are currently commented out in `src/test/off-webcomponents_test.ts`
- Jest tests: `npm test` - currently finds no tests (expected)
- Web test runner: `npm run test:dev` - currently finds no test files (expected)
- Do not try to run tests as they are disabled in this codebase

### Code Quality
- Lint code: `npm run lint` - takes 30 seconds. NEVER CANCEL. Set timeout to 60+ minutes.
  - Runs lit-analyzer and eslint
  - Currently shows 44 problems (expected - not errors that block development)
- Format code: `npm run format` - takes 10 seconds, formats all source files
  - May show errors on dist/ files (build artifacts) - this is expected and safe to ignore

### Makefile Commands (Root Level)
- **KNOWN ISSUE**: Makefile contains typo "prepare:packagen" instead of "prepare:package"
- Available targets: `make help`
- `make build` - currently fails due to typo, use npm commands instead
- `make dev` - works, runs `cd web-components && npm run dev`
- `make test` - works, runs `cd web-components && npm test`

## Validation Scenarios

### Manual Validation After Changes
- ALWAYS build and run the development server after making changes
- Navigate to http://127.0.0.1:8000 and verify the demo page loads
- Test at least one component interaction (e.g., change language dropdown, test barcode scanner)
- Key components to verify: robotoff questions, product cards, folksonomy editor, donation banner
- **CRITICAL**: External API calls will fail in development (blocked by CORS/network) - this is expected
- Look for console errors that are NOT network-related (those indicate real issues)

### Before Committing Changes
- Always run `npm run format` to format code
- Always run `npm run lint` and ensure no new errors are introduced
- Always run `npm run build` to ensure build still works
- The CI pipeline (.github/workflows/check-build.yml and .github/workflows/ts-lint.yml) will fail if linting or building fails

## Repository Structure

### Key Directories
- `/web-components/` - Main package directory, work here for all development
- `/web-components/src/` - Source code (TypeScript/Lit components)
- `/web-components/src/components/` - Individual web components
- `/web-components/src/api/` - API integration code
- `/web-components/src/localization/` - Translation files
- `/web-components/dist/` - Build output (auto-generated, do not edit)
- `/web-components/docs/` - Documentation and demo pages

### Important Files
- `/web-components/package.json` - Dependencies and npm scripts
- `/web-components/src/off-webcomponents.ts` - Main entry point
- `/web-components/index.html` - Demo page
- `/web-components/rollup.config.js` - Build configuration
- `/web-components/web-test-runner.config.js` - Test configuration
- `/web-components/tsconfig.json` - TypeScript configuration

### Component Categories
- **Robotoff**: Question interfaces, ingredient detection, spellcheck, nutrient extraction
- **Folksonomy**: Property editor, property browser, product explorer
- **Product Display**: Product cards, knowledge panels, nutrition display
- **UI Elements**: Donation banners, mobile app badges, barcode scanner, loading components

## Common Tasks

### Adding New Components
1. Create component in `src/components/<category>/`
2. Export component in `src/off-webcomponents.ts`
3. Run `npm run translations:build` to rebuild translations
4. Add component to `index.html` for testing
5. Add component to `docs/index.html` for documentation
6. Always test with `npm run dev` and verify on demo page

### Translation Updates
- Extract translations: `npm run translations:extract`
- Build translations: `npm run translations:build` (included in main build)
- Translation files are in `src/localization/` and `xliff/`

### Working with APIs
- Open Food Facts API integration in `src/api/openfoodfacts.ts`
- Robotoff API integration in `src/api/robotoff.ts`
- Folksonomy API integration in `src/api/folksonomy.ts`
- API calls will fail in development due to network restrictions - use mock data for testing

## Known Issues and Workarounds

### Build Issues
- **Makefile typo**: Use npm commands directly instead of make commands
- **Circular dependency warning**: This is a known issue in the codebase, safe to ignore
- **Translation warnings**: Missing French translations are expected, uses fallback text

### Development Issues
- **API failures in demo**: Expected due to CORS/network blocks, not a code issue
- **BarcodeDetector not available**: Browser API not available in some environments, expected
- **Format errors on dist/ files**: Build artifacts shouldn't be formatted, safe to ignore

### Testing Issues
- **No tests found**: All tests are commented out, this is the current state of the project
- Do not attempt to enable tests without discussion with maintainers

## CI/CD Pipeline

### GitHub Workflows
- **check-build.yml**: Runs `npm install` and `npm run build` in web-components directory
- **ts-lint.yml**: Runs `npm run lint` in web-components directory  
- **package.yml**: Publishes to npm on releases
- All workflows use Node.js from .nvmrc and cache npm dependencies

### Publishing Process
- Package is published as `@openfoodfacts/openfoodfacts-webcomponents` on npm
- Manual publishing: `npm run publish:package` (requires npm permissions)
- Automatic publishing on GitHub releases

## Performance Notes

### Build Performance
- Clean build: ~16 seconds (production mode)
- Development build: ~5 seconds after initial build
- Translation processing adds ~10 seconds to build time
- Bundle size: ~336KB (production), ~654KB (development)

### Development Performance
- Hot reload works but requires full page refresh
- Large translation files (~1MB total) may slow initial load
- Use development mode for faster iteration, production mode for final testing