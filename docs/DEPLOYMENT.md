# NetWorth Deployment

## Temporary preview hosting

- Platform: Cloudflare Pages
- Project: `netoworth`
- Production branch: `main`
- Repository: `Marque6299/NetWorth`
- Build command: none (static HTML/CSS/JavaScript)
- Build output directory: repository root
- Production URL: https://netoworth.pages.dev

Cloudflare Pages is connected to the GitHub repository. Commits pushed to `main` should trigger production deployments automatically; other branches can receive preview deployments.

## Deployment notes

The current project is a static browser prototype. No package installation or build step is required. The entry point is `index.html`; styles, JavaScript, and world data are served from their repository paths.

This hosting setup is temporary and can be replaced or migrated as the project architecture evolves. Do not store secrets in this repository or in browser-side source files.
