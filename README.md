# WishFund

**Save the links you love. Split your monthly money. Watch every wish get funded.**

A multi-user wishlist + monthly budget website with a pixel × pink-scrapbook look. Anyone can sign up; each person's data is private to them. The admin manages users and posts announcements.

## Features

- **Accounts** — email + password sign up / sign in, email confirmation, password reset (Supabase Auth).
- **Wishlist** — save products with link, price and note. Reorder with ▲ ▼; the wishlist fund fills item #1 completely before #2. Progress bars, "≈ 3 months" estimates, and a Bought list.
- **Monthly budget** — enter the money you got this month, pick a preset (Balanced, 50/30/20, Saver, Wish hunter) or drag the sliders. Live preview of bills, spending, savings and where the wishlist fund goes.
- **History** — every month's split, all-time totals, undo, currency picker.
- **Admin** (admins only) — list users, block / unblock, make or remove admins, delete accounts; post, hide and delete announcements shown to every user.
- **About** — scrapbook page about the creator. Edit it in [`src/about.ts`](src/about.ts).
- Pixel-art cursor, click sound on every click (toggle in the top bar), coin and power-up sounds.
- Privacy: each user's data is protected by Postgres row level security; admins cannot read other users' wishlists or money.

## Set up Supabase (accounts + database)

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query**: paste [`supabase/schema.sql`](supabase/schema.sql) and **Run**.
3. **Authentication → URL Configuration**: set **Site URL** to your live site (e.g. `https://<user>.github.io/wishfund-web/`) and add `http://localhost:5173/` to **Redirect URLs**.
4. **Project Settings → API**: copy the **Project URL** and the **anon / publishable key**.
   - Local: copy `.env.example` to `.env.local` and fill them in.
   - GitHub Pages: put them in `.env.production` (committed; Vite reads it for `npm run build`).
5. Sign up on the site once, then make yourself admin in the SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```

Both values are safe to publish; access is enforced by the database policies. Never put the **service_role** key in the site.

Without these settings the site still works in single-browser mode (no accounts, data in `localStorage`).

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
