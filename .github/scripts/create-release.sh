#!/bin/bash

# Custom release script for Changeset
# This script creates a Git tag with the changelog after Changeset's PR is merged

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting custom release process...${NC}"

# Get the current version from package.json
VERSION=$(node -p "require('./package.json').version")

if [ -z "$VERSION" ]; then
    echo -e "${RED}Error: Could not read version from package.json${NC}"
    exit 1
fi

TAG_NAME="v${VERSION}"

echo -e "${YELLOW}Version: ${VERSION}${NC}"
echo -e "${YELLOW}Tag: ${TAG_NAME}${NC}"

# Check if tag already exists
if git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
    echo -e "${YELLOW}Tag ${TAG_NAME} already exists, skipping release${NC}"
    exit 0
fi

# Extract changelog for this version
CHANGELOG_FILE="CHANGELOG.md"

if [ ! -f "$CHANGELOG_FILE" ]; then
    echo -e "${RED}Error: CHANGELOG.md not found${NC}"
    exit 1
fi

# Extract the changelog content for the current version
# This reads from the first version heading to the next version heading or end of file
RELEASE_NOTES=$(awk -v version="$VERSION" '
    /^## / {
        if (found) exit
        if (index($0, version) > 0) {
            found=1
            next
        }
    }
    found { print }
' "$CHANGELOG_FILE")

if [ -z "$RELEASE_NOTES" ]; then
    echo -e "${YELLOW}Warning: No changelog found for version ${VERSION}${NC}"
    RELEASE_NOTES="Release version ${VERSION}"
fi

echo -e "${GREEN}Creating Git tag: ${TAG_NAME}${NC}"

# Create the git tag
git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"
git tag -a "$TAG_NAME" -m "Release $TAG_NAME"

echo -e "${GREEN}Pushing tag to GitHub...${NC}"
git push origin "$TAG_NAME"

echo -e "${GREEN}Creating GitHub release...${NC}"

# Create GitHub release using gh CLI
# The GITHUB_TOKEN environment variable should be set by the workflow
if [ -n "$GITHUB_TOKEN" ]; then
    # Wait a moment for the tag to propagate to GitHub
    sleep 2
    
    echo "$RELEASE_NOTES" | gh release create "$TAG_NAME" \
        --title "Release $TAG_NAME" \
        --notes-file -
    
    echo -e "${GREEN}✓ Release ${TAG_NAME} created successfully!${NC}"
else
    echo -e "${RED}Error: GITHUB_TOKEN not set, cannot create GitHub release${NC}"
    echo -e "${YELLOW}Tag ${TAG_NAME} has been created but GitHub release was not created${NC}"
    exit 1
fi
