# WishFund

**Save the links you love. Split your money. Level up until every wish is yours.**

A wishlist + monthly budget website with a pixel-game × pink-scrapbook look.

## Features

- **Level 01 · Quest Items** — save products with their link, price and a note. Reorder with ▲ ▼; the wishlist fund fills item #1 completely before #2. Progress bars, "≈ 3 months" estimates, and a trophy shelf for things you bought.
- **Level 02 · Monthly Budget** — a handheld-console panel: enter this month's money, pick a preset (Balanced, 50/30/20, Saver, Wish hunter) or drag the sliders. Live preview of regular payments, spending, savings and where the wishlist fund goes.
- **Level 03 · Training Log** — every month's split, all-time totals, undo, currency picker.
- **About me** — scrapbook page with a photo and handwritten notes. Edit it in [`src/about.ts`](src/about.ts).
- Pixel-art cursor, retro click sound on every click (toggle in the top bar), coin and power-up sounds.
- Private: data stays in your browser (`localStorage`). No account, no server.

## Run it

```bash
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm test` | Unit tests (Vitest) |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run lint` | Lint (oxlint) |

## Personalise

- **Photo:** replace `public/me-cutout.png` (a transparent cut-out gets the red sticker outline), or point `photo` in `src/about.ts` at another file in `public/`.
- **Click sound:** replace `public/sounds/click.mp3`.
- **Facts:** edit the notes in `src/about.ts`.
- **Cursor:** edit the pixel grids in `scripts/make-cursors.mjs`, then run `node scripts/make-cursors.mjs`.

## Deploy

Pushing to `main` builds and publishes to GitHub Pages via `.github/workflows/deploy.yml`.
In the repo: **Settings → Pages → Source: GitHub Actions**.

## How the money math works

Money is stored as integer paise/cents, so splits always add up exactly; any rounding remainder goes to savings. See [`src/lib/budget.ts`](src/lib/budget.ts) and its tests.
