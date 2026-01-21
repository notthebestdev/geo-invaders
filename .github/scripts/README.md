# Release Scripts

This directory contains custom scripts used in the GitHub Actions release workflow.

## create-release.sh

A custom release script for Changeset that automatically creates Git tags and GitHub releases with changelog content.

### Purpose

This script is triggered automatically after Changeset's "Version Packages" PR is merged. It:

1. Reads the current version from `package.json`
2. Extracts the corresponding changelog from `CHANGELOG.md`
3. Creates a Git tag (e.g., `v0.2.2`)
4. Creates a GitHub release with the extracted changelog as release notes

### Usage

The script is automatically called by the `.github/workflows/release.yml` workflow. It runs when:

- A commit with the message "ci(repo): version packages" is pushed to the `main` branch
- This indicates that the Changeset version PR was just merged

### Requirements

- Node.js (to read `package.json`)
- Git (to create and push tags)
- GitHub CLI (`gh`) - Pre-installed on GitHub-hosted runners
- `GITHUB_TOKEN` environment variable (provided by GitHub Actions)

**Note**: The script relies on the GitHub CLI (`gh`) which is pre-installed on all GitHub-hosted runners. If running in a self-hosted environment, ensure `gh` is installed.

### How It Works

1. **Detection**: The release workflow checks if the last commit message contains "ci(repo): version packages"
2. **Execution**: If detected, the script runs automatically
3. **Tag Creation**: Creates an annotated Git tag based on the package version
4. **Release Creation**: Uses `gh` CLI to create a GitHub release with changelog content
5. **Idempotency**: If a tag already exists for the current version, the script exits gracefully

### Manual Testing

To test the script locally (without actually creating a release):

```bash
# Dry run - check what would be created
VERSION=$(node -p "require('./package.json').version")
echo "Would create tag: v${VERSION}"

# Extract changelog for current version
awk -v version="$VERSION" '
    /^## / {
        if (found) exit
        if ($0 ~ version) {
            found=1
            next
        }
    }
    found { print }
' CHANGELOG.md
```

### Troubleshooting

- **Tag already exists**: The script will exit with code 0 (success) and log a message
- **No CHANGELOG.md**: The script will exit with an error
- **No changelog for version**: A default message will be used
- **GITHUB_TOKEN not set**: Tag will be created but GitHub release will fail
