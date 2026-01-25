# PR Auto-Labeling

This directory contains the configuration for automatically labeling pull requests based on the files that were changed.

## How it works

The workflow uses GitHub's official [labeler action](https://github.com/actions/labeler) to automatically add labels to PRs when they are opened, synchronized, or reopened.

## Labels

The following labels are automatically applied based on file changes:

| Label                  | Color   | Description                                  | Triggered by                          |
| ---------------------- | ------- | -------------------------------------------- | ------------------------------------- |
| `area: app`            | #FFD6E8 | Changes to the app directory                 | `src/app/**/*`                        |
| `area: components`     | #C1E1FF | Changes to React components                  | `src/components/**/*` (except UI)     |
| `area: ui`             | #D4C5F9 | Changes to UI components                     | `src/components/ui/**/*`              |
| `area: lib`            | #FFEAA7 | Changes to library utilities                 | `src/lib/**/*`                        |
| `area: workflows`      | #B2E6D4 | Changes to GitHub Actions workflows          | `.github/workflows/**/*`              |
| `area: scripts`        | #FFE4B5 | Changes to build/utility scripts             | `scripts/**/*`                        |
| `area: config`         | #E8DFF5 | Changes to configuration files               | Config files (*.config.*, tsconfig, etc.) |
| `area: docs`           | #B2DFDB | Changes to documentation                     | `**/*.md`, `LICENSE`                  |
| `area: dependencies`   | #FFE0B2 | Changes to package dependencies              | `package.json`, `package-lock.json`   |
| `area: assets`         | #F8BBD0 | Changes to public assets                     | `public/**/*`                         |

All labels use pastel colors for better visual organization and readability.

## Setup

To create these labels in the repository, run:

```bash
# Export your GitHub token
export GITHUB_TOKEN=your_github_token

# Run the setup script
npx tsx scripts/setup-labels.ts
```

The script will create or update the labels with the correct colors and descriptions.

## Configuration

The labeler configuration is defined in `.github/labeler.yml`. You can modify this file to:

- Add new labels
- Change file path patterns
- Adjust labeling logic

After modifying the configuration, update the labels table in this README and run the setup script to sync the labels.

## Workflow

The workflow is defined in `.github/workflows/pr-labeler.yml` and runs on:

- `pull_request:opened` - When a PR is first opened
- `pull_request:synchronize` - When new commits are pushed to the PR
- `pull_request:reopened` - When a PR is reopened

The workflow has the following permissions:

- `contents: read` - To read the repository files
- `pull-requests: write` - To add labels to PRs
