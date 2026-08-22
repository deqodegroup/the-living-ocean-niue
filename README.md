# The Living Ocean — Niue

An immersive, data-led ScrollWorld created for the Pacific Dataviz Challenge 2026. ECHO guides visitors through Niue's ocean, village, climate-risk, cultural-memory and climate-finance story using verified local project data and linked source attribution.

The repository keeps the original Sites/Vinext production target and adds a static Cloudflare Pages target. Both use the same React experience, styles, data and public assets.

## Requirements

- Node.js 22.13 or newer
- npm

## Install

```bash
git clone <your-github-repository-url>
cd the-living-ocean-niue
npm ci
```

No secrets, API keys or ChatGPT authentication are required.

## Local development

Run the Cloudflare Pages version:

```bash
npm run dev:pages
```

Run the original Sites/Vinext version:

```bash
npm run dev
```

## Production builds

Cloudflare Pages:

```bash
npm run build:pages
```

The deployable static output is written to `dist-pages/`.

Original Sites/Vinext target:

```bash
npm run build
```

Useful verification commands:

```bash
npm run check:pages
npm run typecheck
npm run lint
```

## Deploy with GitHub and Cloudflare Pages

1. Create an empty GitHub repository and push this project to its `main` branch.
2. In Cloudflare, open **Workers & Pages**, create a Pages application and connect the GitHub repository.
3. Use these build settings:
   - Framework preset: `None`
   - Production branch: `main`
   - Build command: `npm run build:pages`
   - Build output directory: `dist-pages`
   - Root directory: `/`
4. Set `NODE_VERSION` to `22.13.0` if the build environment does not read `.nvmrc` automatically.
5. Save and deploy. Cloudflare will rebuild the site after each push to `main`.

For a manual deployment from an authenticated local terminal:

```bash
npm run deploy:pages
```

## Project structure

- `app/page.tsx` — complete ScrollWorld experience and interactions
- `app/globals.css` — cinematic ocean environment, motion and responsive layout
- `app/map-data.ts` — interactive Niue village map paths and census-night population
- `app/content-data.ts` — verified risk, exposure, finance and source context
- `data/` — retained project datasets and provenance
- `public/` — social card, favicon and Cloudflare Pages headers/redirects
- `src/main.tsx` — Cloudflare Pages browser entry
- `worker/` — original Sites/Vinext worker entry

## Data integrity

Do not alter displayed figures without updating the matching source record and provenance. The interface intentionally withholds village-level loss values where the current project data does not directly verify them.
