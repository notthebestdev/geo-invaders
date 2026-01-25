---
"geo-invaders": patch
---

feat(workflows): add automatic PR labeling based on changed files

Added a new GitHub Actions workflow that automatically labels pull requests based on the files that were changed. Labels include:
- area: app - for Next.js app directory changes
- area: components - for React component changes
- area: ui - for UI component changes
- area: lib - for library utility changes
- area: workflows - for GitHub Actions workflow changes
- area: scripts - for build/utility script changes
- area: config - for configuration file changes
- area: docs - for documentation changes
- area: dependencies - for package.json changes
- area: assets - for public asset changes

All labels use pastel colors for better visual organization. Also includes a setup script to create these labels in the repository.
