# Contributing

Thanks for contributing! Please follow these steps:

## Getting Started
1. Install Node 18+: `npm install`
2. Run dev server: `npm run dev`
3. Run type check: `npm run lint`
4. Run formatter: `npm run format`

## Branch & Commit
- Use feature branches.
- Keep commits small and focused.
- Use conventional commits (chore/feat/fix/docs/style/refactor/test).

## Code Style
- Prettier enforced via `npm run format`.
- TypeScript strict mode is enabled.
- Prefer functional React components and hooks.

## Adding Data or Images
- Theater data lives in `src/data/theaters.ts`.
- Scraped images go in `public/theaters/` (ignored in git).
- Use the Puppeteer scraper: `npm run scrape-images`.

## Tests & Checks
- `npm run lint` (tsc --noEmit)
- `npm run build` before PR if possible.

## Pull Requests
- Describe the change and motivation.
- Mention any UI/UX impacts.
- Include screenshots for UI updates when possible.

