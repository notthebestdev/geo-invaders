# Contributing to Geo Invaders

Thank you for your interest in contributing to Geo Invaders! We welcome contributions from everyone, whether you're fixing bugs, adding features, improving documentation, or suggesting improvements.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm, yarn, pnpm, or bun
- Git

### Setup Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:

    ```bash
    git clone https://github.com/YOUR_USERNAME/geo-invaders.git
    cd geo-invaders
    ```

3. Add the upstream repository:

    ```bash
    git remote add upstream https://github.com/notthebestdev/geo-invaders.git
    ```

4. Install dependencies:

    ```bash
    npm install
    ```

5. Create a `.env` file from `.env.example`:

    ```bash
    cp .env.example .env
    ```

    Add your MapTiler API key to the `.env` file

6. Start the development server:

    ```bash
    npm run dev
    ```

Visit `http://localhost:3000` to see your local instance

## Development Workflow

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names (e.g., `feature/dark-mode`, `fix/popup-styling`, `docs/contributing`)

### Making Changes

1. Make your changes in the appropriate files
2. Test your changes locally (`npm run dev`)
3. Lint your code:

    ```bash
    npm run lint
    ```

4. Fix any ESLint issues automatically:

    ```bash
    npm run lint -- --fix
    ```

### Committing Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, semicolons)
- `refactor:` Code refactoring without feature or bug changes
- `perf:` Performance improvements
- `chore:` Build, dependencies, or tooling changes
- `test:` Test additions or changes

Examples:

```bash
git commit -m "feat: add dark mode toggle for map"
git commit -m "fix: resolve popup styling in dark theme"
git commit -m "docs: update README with dark mode info"
```

### Pushing and Creating a Pull Request

1. Keep your branch up to date with upstream:

    ```bash
    git fetch upstream
    git rebase upstream/dev
    ```

2. Push to your fork:

    ```bash
    git push origin feature/your-feature-name
    ```

3. Create a Pull Request on GitHub with:
    - Clear title describing your changes
    - Description of what was changed and why
    - Reference to any related issues (`Closes #123`)
    - Screenshots for UI changes

## Code Style

- **TypeScript**: Enabled for type safety
- **Formatting**: Prettier (auto-format on save with ESLint)
- **Linting**: ESLint configuration in `eslint.config.mjs`
- **CSS**: Tailwind CSS for styling

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main map component
│   ├── layout.tsx        # Root layout with theme provider
│   └── globals.css       # Global styles including dark mode
├── components/
│   ├── CommandPalette.tsx    # Search and command palette
│   ├── Settings.tsx          # Settings panel
│   └── ui/                   # UI components (buttons, dialogs, etc.)
└── lib/
    └── utils.ts          # Utility functions
```

## Key Technologies

- **Next.js 16+** - React framework with App Router
- **MapLibre GL** - Open-source mapping library
- **MapTiler** - Map tile provider
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **next-themes** - Theme management

## Testing

Run the development server and test your changes:

```bash
npm run dev
```

For production build testing:

```bash
npm run build:local
npm run start
```

## Submitting Issues

When reporting bugs or suggesting features:

1. Check if the issue already exists
2. Provide clear, descriptive title
3. Include steps to reproduce (for bugs)
4. Attach screenshots if relevant
5. Mention your environment (OS, browser, Node version)

## Code Review Process

1. A maintainer will review your PR
2. Address feedback with additional commits
3. Keep the discussion focused and respectful
4. Once approved, your PR will be merged

## Building for Production

```bash
npm run build
```

This creates an optimized static export with the `/geo-invaders` base path for GitHub Pages deployment.

## Release Process

We use semantic versioning and changesets. When making changes:

1. Create or update a changeset:

    ```bash
    npm run changeset
    ```

2. Follow the prompts to document your changes

3. Changesets are automatically compiled for releases

## Questions or Need Help?

- Open a GitHub Discussion for questions
- Check existing issues and documentation
- Reach out to maintainers in a new issue

## License

By contributing to Geo Invaders, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for helping make Geo Invaders better! 🚀
