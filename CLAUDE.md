# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**fancynickna.me** — fancy nickname generator with SEO-fanout routes for every game and every Unicode character. Free, no signup, no tracking.

## Stack

- **SvelteKit 2 + Svelte 5 (runes)** — `compilerOptions.runes` is forced on, do not use stores or `let` for component state outside `node_modules`. Use `$state`, `$derived`, `$props`, `$bindable`.
- **Bun adapter** (`svelte-adapter-bun`) — production runs as `bun build/index.js`. Vite/Node is only for dev + build.
- **pnpm** — lockfile is committed, use `pnpm` not npm/yarn.
- **Tailwind v4** via `@tailwindcss/vite`. Theme tokens (fonts, colors) live in `@theme` in `src/app.css`; runtime tokens (`--bg`, `--fg`, `--card`, `--accent`, `--line`, `--fg-soft`) live on `:root` and flip via `html[data-theme="ink"]` / `html[data-accent="…"]`. **Do not hardcode hex colors in components — always reference the CSS vars** so dark mode and accent switching keep working.
- **Drizzle ORM** + **postgres-js** against a Postgres the user hosts on their own server (local Postgres for dev too). No managed DB.
- **svelte-sonner** for toasts.
- Display fonts via `@fontsource/*` (Archivo Black, Space Grotesk, JetBrains Mono).

## Commands

```bash
pnpm dev                 # vite dev server
pnpm build               # SvelteKit + Bun adapter build → build/
pnpm start               # bun build/index.js (production)
pnpm check               # svelte-kit sync && svelte-check (treat warnings as warnings, errors as blocking)

pnpm db:push             # drizzle-kit push (sync schema to DB, no migration files)
pnpm db:generate         # generate migration files in ./drizzle
pnpm db:migrate          # apply migrations
pnpm db:studio           # drizzle studio UI

pnpm seed:games          # seed ~50 hand-curated top-traffic games (idempotent upsert)
pnpm scrape:unicode      # full UCD scrape → characters + unicode_blocks
pnpm scrape:steam        # bulk Steam app list (~150k apps); arg = enrichTop count
pnpm scrape:all          # unicode then steam
```

There is no test suite yet. Don't fabricate one — if you add tests, wire the runner first and tell the user.

## Architecture

### The two scaling axes

1. **Game routes** (`/games/[slug]`) — one page per game, served from the `games` table. Names + rules (`minNameLen`, `maxNameLen`, `allowedCharsRegex`) come from either the curated seed (`source = 'curated'`) or a scraper (`source = 'steam'`, `'igdb'`, …). The route filters `fancyText.styles` against `allowedCharsRegex` so only legal styles are shown.

2. **Character routes** (`/c/[code]`) — one page per Unicode codepoint. `code` is **lowercase hex with no leading zeros** (e.g. `/c/2665`). Other inputs (`U+2665`, `0X2665`, leading zeros) are 301-redirected to the canonical form by `+page.server.ts`. Sister routes: `/symbols` (block index) and `/symbols/block/[slug]` (chars in a block).

Both axes feed partitioned sitemaps (`/sitemap.xml` → `sitemap-static.xml`, `sitemap-games.xml`, `sitemap-characters.xml`). The character sitemap intentionally filters to "interesting" Unicode categories (`So`, `Sm`, `Sc`, letters, punctuation) to stay under the 50k-URL cap — CJK ideographs are excluded from the sitemap but the routes still resolve.

### The generator (`src/lib/fancyText.ts`)

Framework-agnostic, pure functions, **must stay portable**. The design handoff was explicit: this file is ported as-is from `fancy-text.js`, do not redesign it. Exports:

- `styles: FancyStyle[]` — 25 entries, each `{ id, name, fn: (string) => string }`
- `decoPacks: Record<string, DecoPack>` — pre/post wrappers (sparkles, stars, hearts, kawaii, chaos, …)
- `applyStyle(name, style, deco?, applyDeco?)` — helper

Style families and their Unicode origins:
- **Math alphanumerics** (`0x1D400`–`0x1D7FF`) — bold, italic, script, fraktur, double-struck, mono, sans
- **Enclosed alphanumerics** (`0x24B6`+, `0x1F130`+, `0x1F150`+) — bubble / squared / inverted bubble
- **Fullwidth** (`+0xFEE0` offset) and **superscript** / **small caps** via lookup tables
- **Zalgo** — combining marks above/mid/below with `Math.random`. Glitch styles re-roll on a 1.4s `tick` counter held in `+page.svelte`; everything else is deterministic.

When adding a style: append to `styles`, give it a stable `id` (used as the copied-card highlight key and as a future DB FK to `nickname_styles.slug`), and pick a `name` that fits the brutalist card aesthetic (mixed case / unicode is fine and on-brand).

### Database (`src/lib/server/db/schema.ts`)

- `games` — unique on `slug`; `(source, sourceId)` is the upsert key for scrapers. `curated = true` games are hand-tuned and should never be overwritten by a scraper. **Set `source` accordingly when adding a scraper**, never reuse `'curated'`.
- `characters` — PK is the integer `codepoint`. `blockSlug` is denormalized from `unicode_blocks.slug` for fast filtering. `category` uses Unicode general category codes (`Lu`, `Ll`, `So`, …).
- `unicode_blocks` — populated by the unicode scraper.
- `saved_nicknames` — for `/n/[shareId]` short URLs (route not implemented yet).
- `scrape_jobs` — every scraper run inserts a row, updates to `'success'`/`'failed'` on exit. Useful for "did the last steam scrape work?" debugging.

The DB client (`src/lib/server/db/index.ts`) returns a **Proxy that throws** if `DATABASE_URL` is unset, so route handlers without DB will crash loudly at request time rather than silently returning empty data. The home page (`/`) and main generator have no DB dependency — they work without `DATABASE_URL`.

### Scrapers (`src/lib/server/scrapers/`)

Each scraper:
1. Inserts a `scrape_jobs` row with `status: 'running'`.
2. Fetches its source (with `fetchWithRetry` — handles 429/5xx with exponential backoff).
3. Upserts via `onConflictDoUpdate` keyed on `(source, sourceId)` for games, `codepoint` for characters.
4. Updates the job row to `'success'` (with stats) or `'failed'` (with error message).

The CLI entry is `scripts/scrape.ts` (`bun scripts/scrape.ts <steam|unicode|all> [enrichTop]`). Scrapers are Bun-only — they import `$env/dynamic/private` indirectly via `db/index.ts`, but the script loads `.env` via `dotenv/config` first.

### Design system

Source of truth for the visual design: the README in the design handoff was **high-fidelity** — brutalist offsets are **hard, no blur** (`box-shadow: 6px 6px 0 var(--fg)`). Card values use `font-family: serif` deliberately so Unicode math characters render with Times/Cambria fallback. Dark mode (`html[data-theme="ink"]`) inverts fg/bg but **accent colors stay the same** — do not dim them.

Three predefined shadow utility classes in `src/app.css`:
- `.shadow-brut` — `6px 6px 0 var(--fg)` (idle input card)
- `.shadow-brut-focus` — layered accent + ink (focused input)
- `.shadow-brut-card` — `4px 4px 0 var(--accent), 4px 4px 0 1.5px var(--fg)` (card hover; applied via CSS `:hover` in `NickCard.svelte`, not via class toggling)

## SEO conventions

- Every dynamic route must set `<title>`, `<meta name="description">`, `<link rel="canonical">`, and OG tags in `<svelte:head>`.
- Game and (eventually) character pages embed JSON-LD: `SoftwareApplication`, `FAQPage`, `BreadcrumbList`. Use the pattern in `/games/[slug]/+page.svelte` — escape the closing `</script>` inside the template literal as `<\/script>`.
- Canonical URLs are lowercase, no trailing slash, hex without leading zeros for character codes.

## Conventions

- Server-only modules go under `src/lib/server/` — SvelteKit hard-blocks importing them from client code.
- Path alias `$lib` → `src/lib` is configured in `svelte.config.js`.
- When adding deps, use `pnpm add` (or `pnpm add -D`). Don't commit `node_modules`.
- Do not introduce a CSS-in-JS layer or a component library. Tailwind utility classes + inline styles using the `var(--…)` tokens is the established pattern; the design relies on it.

## Branch

The active development branch for the SDK environment is `claude/fancy-nickname-generator-UWqrX`. Push to it, do not push to `main`.
