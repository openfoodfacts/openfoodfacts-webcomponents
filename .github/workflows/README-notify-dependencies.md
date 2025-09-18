# Release Notification Workflow

This workflow automatically creates issues in dependent repositories when a new version of openfoodfacts-webcomponents is released.

## How it works

1. **Trigger**: The workflow runs automatically when a release is published (not drafts or prereleases)
2. **Target Repositories**: Creates issues in:
   - `openfoodfacts/openfoodfacts-server`
   - `openfoodfacts/openfoodfacts-explorer` 
   - `openfoodfacts/hunger-games`
3. **Issue Content**: Each issue includes:
   - Release version and link
   - Release notes from the changelog
   - NPM package link
   - Step-by-step update instructions

## Manual Testing

The workflow can be triggered manually for testing purposes:

1. Go to the Actions tab in GitHub
2. Select "Notify dependency repositories on release"
3. Click "Run workflow"
4. Check the "Run in dry-run mode" option to test without creating real issues

## Error Handling

- If creating an issue fails in one repository, the workflow continues with the others
- Duplicate issues are detected and avoided
- Permission errors are handled gracefully (expected for cross-organization access)
- Detailed logging helps with troubleshooting

## Labels Applied

Each created issue gets these labels:
- `dependencies` - Indicates this is a dependency update
- `webcomponents-update` - Specific to webcomponents updates  
- `automated` - Shows this was created automatically

## Permissions

The workflow uses the built-in `GITHUB_TOKEN` which may have limited permissions for external repositories. This is expected and the workflow handles permission errors gracefully.