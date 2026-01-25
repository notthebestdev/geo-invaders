#!/usr/bin/env node

/**
 * Sets up GitHub labels for PR auto-labeling workflow
 * Run with: node scripts/setup-labels.ts
 * Requires GITHUB_TOKEN environment variable
 */

import { Octokit } from "@octokit/rest";

const owner = "notthebestdev";
const repo = "geo-invaders";

// Define labels with pastel colors
const labels = [
    {
        name: "area: app",
        color: "FFD6E8", // Pastel pink
        description: "Changes to the app directory (Next.js pages/routes)",
    },
    {
        name: "area: components",
        color: "C1E1FF", // Pastel blue
        description: "Changes to React components",
    },
    {
        name: "area: ui",
        color: "D4C5F9", // Pastel purple
        description: "Changes to UI components",
    },
    {
        name: "area: lib",
        color: "FFEAA7", // Pastel yellow
        description: "Changes to library utilities",
    },
    {
        name: "area: workflows",
        color: "B2E6D4", // Pastel mint
        description: "Changes to GitHub Actions workflows",
    },
    {
        name: "area: scripts",
        color: "FFE4B5", // Pastel peach
        description: "Changes to build/utility scripts",
    },
    {
        name: "area: config",
        color: "E8DFF5", // Pastel lavender
        description: "Changes to configuration files",
    },
    {
        name: "area: docs",
        color: "B2DFDB", // Pastel teal
        description: "Changes to documentation",
    },
    {
        name: "area: dependencies",
        color: "FFE0B2", // Pastel orange
        description: "Changes to package dependencies",
    },
    {
        name: "area: assets",
        color: "F8BBD0", // Pastel rose
        description: "Changes to public assets",
    },
];

async function setupLabels() {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        console.error("Error: GITHUB_TOKEN environment variable is required");
        console.error(
            "Please set it with: export GITHUB_TOKEN=your_github_token",
        );
        process.exit(1);
    }

    const octokit = new Octokit({ auth: token });

    console.log(`Setting up labels for ${owner}/${repo}...\n`);

    for (const label of labels) {
        try {
            // Try to update the label if it exists
            await octokit.rest.issues.updateLabel({
                owner,
                repo,
                name: label.name,
                color: label.color,
                description: label.description,
            });
            console.log(`✓ Updated: ${label.name} (#${label.color})`);
        } catch (error: unknown) {
            if (error && typeof error === "object" && "status" in error) {
                // If label doesn't exist, create it
                if (error.status === 404) {
                    try {
                        await octokit.rest.issues.createLabel({
                            owner,
                            repo,
                            name: label.name,
                            color: label.color,
                            description: label.description,
                        });
                        console.log(`✓ Created: ${label.name} (#${label.color})`);
                    } catch (createError) {
                        console.error(
                            `✗ Failed to create ${label.name}:`,
                            createError,
                        );
                    }
                } else {
                    console.error(`✗ Failed to update ${label.name}:`, error);
                }
            } else {
                console.error(`✗ Unexpected error for ${label.name}:`, error);
            }
        }
    }

    console.log("\n✓ Label setup complete!");
    console.log(
        "\nLabels created with pastel colors for better visual organization.",
    );
}

setupLabels().catch(console.error);
