# The Bathroom Number Scale

A signed, tower-exponential taxonomy of hygiene, defilement, salvation, and damnation.

The Bathroom Number Scale extends the childhood convention that “number one” is peeing and “number two” is pooping into a closed metaphysical axis from universal perfect heaven at `-6` to universal eternal hell at `+6`. The app treats the premise with full mathematical seriousness: it includes the canonical scale, a logarithmic action-insertion wizard, action comparison, and a net bathroom-force calculator.

## Local Development

```bash
npm install
npm run dev
```

Vite will print the local development URL in the terminal.

## Build

```bash
npm run build
```

The production site is written to `dist/`.

## Preview Production Build

```bash
npm run preview
```

## Tests

```bash
npm test
```

The test suite verifies canonical ratios, geometric half-steps, fractional insertion, opposite-sign cancellation, and terminal-state dominance.

## GitHub Pages Deployment

This project is configured as a GitHub Pages project site at `/bathroom-number-scale/`. Vite’s `base` option is set accordingly in `vite.config.ts`.

Pushes to `main` trigger `.github/workflows/deploy.yml`, which installs dependencies, builds the Vite app, uploads `dist/` as a Pages artifact, and deploys it using the modern GitHub Pages Actions flow.

In the repository settings, **Settings → Pages → Build and deployment** should use **GitHub Actions** as the source.

## Data and Privacy

The app is frontend-only. It has no backend, database, authentication, analytics, or external API dependency. User-defined actions are stored only in the browser’s `localStorage` and can be deleted from the scale viewer.

## Stack

- React
- TypeScript
- Vite
- Vitest
- CSS (no UI framework)
