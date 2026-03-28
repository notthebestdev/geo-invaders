import { Octokit } from "@octokit/rest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

/**
 * Custom release script for Changeset
 * Creates GitHub releases with changelog content after version bump
 */
async function createGitHubRelease() {
    try {
        // Validate environment variables first
        if (!process.env.GITHUB_TOKEN) {
            throw new Error("GITHUB_TOKEN environment variable is required");
        }

        const [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
        if (!owner || !repo) {
            throw new Error(
                "GITHUB_REPOSITORY environment variable not set or invalid format (expected: owner/repo)",
            );
        }

        // Configure git first
        console.log(`\n🔧 Configuring git...`);
        execSync('git config user.name "github-actions[bot]"', {
            stdio: "inherit",
        });
        execSync(
            'git config user.email "github-actions[bot]@users.noreply.github.com"',
            { stdio: "inherit" },
        );

        // Checkout prod, merge dev, and push
        console.log(`\n🔄 Checking out prod branch...`);
        try {
            execSync("git fetch origin dev prod", { stdio: "inherit" });
            console.log(`✅ Successfully fetched remote branches`);

            execSync("git checkout prod", { stdio: "inherit" });
            console.log(`✅ Successfully checked out prod branch`);

            console.log(`\n📝 Merging dev into prod...`);
            execSync(
                "git merge origin/dev --no-ff -m 'chore: merge dev into prod for release'",
                { stdio: "inherit" },
            );
            console.log(`✅ Successfully merged dev into prod`);

            console.log(`\n🚀 Pushing changes...`);
            execSync("git push origin prod", { stdio: "inherit" });
            console.log(`✅ Successfully pushed changes`);

            // Trigger deployment workflow on prod so environment branch rules are respected
            console.log(`\n🔔 Triggering deployment workflow on prod...`);
            try {
                // Validate GITHUB_TOKEN is available
                if (!process.env.GITHUB_TOKEN) {
                    throw new Error(
                        "GITHUB_TOKEN is required to trigger the deployment workflow",
                    );
                }

                const dispatchOctokit = new Octokit({
                    auth: process.env.GITHUB_TOKEN,
                });

                await dispatchOctokit.rest.actions.createWorkflowDispatch({
                    owner,
                    repo,
                    workflow_id: "nextjs.yml",
                    ref: "prod",
                });
                console.log(`✅ Deployment workflow triggered successfully`);
            } catch (dispatchError) {
                const errorMessage =
                    dispatchError instanceof Error
                        ? dispatchError.message
                        : String(dispatchError);
                console.warn(
                    `⚠️ Failed to trigger deployment workflow: ${errorMessage}`,
                );
                console.log(
                    "You can manually trigger the deployment from the Actions tab",
                );
            }
        } catch (gitError) {
            console.error("❌ Git operation failed:", gitError);
            process.exit(1);
        }

        const packageJson = JSON.parse(
            readFileSync(resolve(process.cwd(), "package.json"), "utf-8"),
        );
        const version = packageJson.version;
        const tagName = `v${version}`;

        console.log(`📦 Creating release for version ${version}...`);

        // Initialize Octokit
        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN,
        });

        // Check if tag already exists
        try {
            await octokit.rest.git.getRef({
                owner,
                repo,
                ref: `tags/${tagName}`,
            });
            console.log(
                `⚠️ Tag ${tagName} already exists, skipping release creation`,
            );
            return;
        } catch (error: unknown) {
            if (
                typeof error === "object" &&
                error !== null &&
                "status" in error &&
                (error as { status: number }).status !== 404
            ) {
                throw error;
            }
            // Tag doesn't exist, continue with release creation
        }

        // Check if release already exists
        try {
            await octokit.rest.repos.getReleaseByTag({
                owner,
                repo,
                tag: tagName,
            });
            console.log(
                `⚠️ Release ${tagName} already exists, skipping creation`,
            );
            return;
        } catch (error: unknown) {
            if (
                typeof error === "object" &&
                error !== null &&
                "status" in error &&
                (error as { status: number }).status !== 404
            ) {
                throw error;
            }
            // Release doesn't exist, continue with creation
        }

        // Extract changelog for this version
        const changelog = extractChangelog(version);

        // Create GitHub release
        const response = await octokit.rest.repos.createRelease({
            owner,
            repo,
            tag_name: tagName,
            name: `${tagName}`,
            body: changelog,
            draft: false,
            prerelease: false,
            target_commitish: "prod",
        });

        console.log(`✅ Release ${tagName} created successfully!`);
        console.log(`🔗 ${response.data.html_url}`);
    } catch (error) {
        console.error("❌ Error creating release:", error);
        process.exit(1);
    }
}

/**
 * Extract changelog content for a specific version
 */
function extractChangelog(version: string): string {
    try {
        const changelogPath = resolve(process.cwd(), "CHANGELOG.md");
        const content = readFileSync(changelogPath, "utf-8");
        const lines = content.split("\n");

        let capturing = false;
        const changelogLines: string[] = [];

        for (const line of lines) {
            // Start capturing when we find the version heading
            if (line.match(/^## /) && line.includes(version)) {
                capturing = true;
                continue;
            }

            // Stop capturing when we hit the next version heading
            if (capturing && line.match(/^## /)) {
                break;
            }

            // Capture lines for this version
            if (capturing) {
                changelogLines.push(line);
            }
        }

        const changelog = changelogLines.join("\n").trim();

        if (!changelog) {
            console.warn(`⚠️ No changelog found for version ${version}`);
            return `Release version ${version}`;
        }

        return changelog;
    } catch (error) {
        console.warn("⚠️ Could not read CHANGELOG.md:", error);
        return `Release version ${version}`;
    }
}

// Run the release creation
createGitHubRelease();
