<div align="center">
<img src=".github/assets/icon.png" height="256" width="256" alt="Stylized space invader icon built from angular teal shapes against a deep blue gradient background, conveying retro arcade excitement and playful adventure" />
<h1>Geo Invaders</h1>
</div>

<!-- Badges -->
<div align="center">
<picture><img src="https://badges.ws/badge/status-beta-yellow" alt="Badge indicating project is in beta." /></picture>
<picture><img src="https://badges.ws/maintenance/yes/2026" alt="Maintenance badge indicating project is actively maintained through 2026." /></picture>
<picture><img src="https://badges.ws/github/stars/notthebestdev/geo-invaders" alt="GitHub stars count badge for the geo-invaders repository." /></picture>
<picture><img src="https://badges.ws/github/license/notthebestdev/geo-invaders" alt="License badge indicating project is licensed under MIT license." /></picture>
</div>

<br>

An interactive web application for exploring and tracking Flash Invaders street art across the globe.

Built with Next.js and MapTiler, this app helps you discover, locate, and navigate to Space Invader mosaics in your city.

## ✨ Features

- **Interactive Map** - Explore Flash Invaders locations worldwide with a smooth, responsive map interface
- **Real-time Geolocation** - Track your position and find nearby invaders
- **Smart Navigation** - Get directions to any invader location
- **Search & Filter** - Find specific invaders or browse by area
- **Mobile Responsive** - Optimized for both desktop and mobile devices
- **Fast Performance** - Static site generation for lightning-fast loading

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or 22 LTS (recommended)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone https://github.com/notthebestdev/geo-invaders.git
# or, you can also do: gh repo clone notthebestdev/geo-invaders

cd geo-invaders
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Rename the `.env.example` file to `.env` and add your MapTiler API key:

```env
NEXT_PUBLIC_MAPTILER_KEY=maptiler-key-123456 # Replace with your actual MapTiler API key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Tech Stack

- **Framework** - [Next.js 16+](https://nextjs.org/) with App Router
- **Mapping** - [MapTiler](https://www.maptiler.com/) & MapLibre GL
- **Styling** - Tailwind CSS
- **Language** - TypeScript
- **Deployment** - GitHub Pages

## 📂 Project structure

```bash
└── 📁geo-invaders
    └── 📁.changeset
        ├── config.json
        ├── README.md
    └── 📁.github
        └── 📁assets
            ├── icon.png
        └── 📁scripts
            ├── create-release.ts
        └── 📁workflows
            ├── dependabot-changeset.yml
            ├── lint.yml
            ├── nextjs.yml
            ├── release.yml
        ├── dependabot.yml
    └── 📁.vscode
        ├── settings.json
    └── 📁public
        ├── apple-touch-icon.png
        ├── favicon.ico
        ├── icon.png
    └── 📁src
        └── 📁app
            ├── favicon.ico
            ├── globals.css
            ├── layout.tsx
            ├── page.tsx
        └── 📁components
            └── 📁ui
                ├── button.tsx
                ├── command.tsx
                ├── dialog.tsx
                ├── popover.tsx
                ├── switch.tsx
            ├── CommandPalette.tsx
            ├── Settings.tsx
        └── 📁lib
            ├── utils.ts
    ├── .editorconfig
    ├── .env.example
    ├── .gitignore
    ├── .markdownlint.json
    ├── .mergify.yml
    ├── .prettierignore
    ├── CHANGELOG.md
    ├── commitlint.config.cjs
    ├── components.json
    ├── eslint.config.mjs
    ├── LICENSE
    ├── next.config.ts
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.mjs
    ├── README.md
    └── tsconfig.json
```

## 📦 Build & Deploy

### Tests

Run unit tests once:

```bash
npm run test
```

Run tests in watch mode while developing:

```bash
npm run test:watch
```

### Production Build (for GitHub Pages)

Build for production deployment:

```bash
npm run build
```

This creates an optimized static export in the `out` directory with the `/geo-invaders` base path configured for GitHub Pages.

### Local Testing Build

To build and test the production build locally:

```bash
npm run build:local
npm run start
```

The `build:local` script creates a build without the GitHub Pages base path, making it suitable for local testing at `http://localhost:3000`.

**Note:** Don't use `npm run build` followed by `npm run start` for local testing, as the production build includes the `/geo-invaders` base path and won't work correctly on localhost.

### Deployment

The app is automatically deployed to GitHub Pages on every push to the `prod` branch.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
