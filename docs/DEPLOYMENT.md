# NetWorth Deployment

## Temporary preview hosting

- Platform: Cloudflare Pages
- Project: `networth`
- Production branch: `main`
- Repository: `Marque6299/NetWorth`
- Build command: none (static HTML/CSS/JavaScript)
- Build output directory: repository root
- Intended preview URL: https://networth.pages.dev (Cloudflare-assigned subdomain may include a suffix if the requested name is unavailable)

Cloudflare Pages is connected to the GitHub repository. Commits pushed to `main` should trigger production deployments automatically; other branches can receive preview deployments.

## Production preview URL

- Public preview: https://netoworth.pages.dev

## Deployment notes

The current project is a static browser prototype. No package installation or build step is required. The entry point is `index.html`; styles, JavaScript, and world data are served from their repository paths.

This hosting setup is temporary and can be replaced or migrated as the project architecture evolves. Do not store secrets in this repository or in browser-side source files.
