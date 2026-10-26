# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A touchscreen kiosk web app that runs *on* a physical water dispenser (BWT AQA drink U20 CAS) built into an Orange Pi Zero 3 / Armbian single-board computer. The Next.js server directly drives the hardware: it toggles relays (via the `gpio` CLI from wiringOP-next) to open/close water valves, reads a 1-Wire temperature sensor for the fridge unit, and logs every dispense/temperature reading to a local SQLite database. The UI (Italian-language) is meant to be shown full-screen on the device's own 1024×600 touch display.

## Commands

```bash
npm run dev          # dev server with Turbopack (uses .env.development — mocked GPIO/temperature)
npm run build        # production build with Turbopack (standalone output)
npm run start        # run the production build
npm run lint         # eslint . (flat config in eslint.config.mjs, eslint-config-next core-web-vitals)
npm test             # Vitest + Testing Library (jsdom), once
npm run test:watch   # same, in watch mode
npm run screenshots  # regenerate screenshots/ (kiosk 1024×600 and iPhone 15 portrait/landscape) from a running dev server (needs local Chrome)
```

Tests sit next to the code they cover (`*.test.ts(x)`). GPIO and SQLite are never touched by tests: `@/service/gpio` and `@/service/db` are mocked with `vi.mock`. Pure logic lives in small modules under `src/service/` (`dispense.ts`, `stats.ts`, `keypad.ts`, `buttonLayout.ts`) so it can be tested without React.

`next dev` writes to `.next/dev` and `next build` to `.next/`, so a build no longer breaks a running dev server. Inside the Claude Code sandbox `next build` hangs at "Creating an optimized production build" (Turbopack needs local IPC): run it outside the sandbox.

### Docker (production deploy to the device)

```bash
./build-push.sh   # docker build, tag from package.json version, push to local registry 192.168.1.254:5000
```

`Dockerfile` is a multi-stage build on `node:24-trixie-slim` (Debian 13: the prebuilt linux-arm64 binary of sqlite3 6 needs glibc >= 2.38, bookworm only has 2.36): the final `runner` stage additionally compiles and installs `wiringOP-next` (the `gpio` CLI used to control relays) and runs as UID 1000 on port 80. `docker-compose.yml` runs the container `privileged: true` and bind-mounts `/sys/bus/w1/devices` (temperature sensor) and `/etc/armbian-release`, so GPIO/temperature access only works when actually deployed to the SBC. `.claude/` and `screenshots/` are excluded from the build context.

## Environment configuration

Behavior switches between "real hardware" and "dev machine" purely through env vars (`.env.development` vs `.env.production`):

- `DB_FILE` — path to the SQLite file.
- `TEMPERATURE_FILE` — path to the 1-Wire sensor's sysfs file in prod; `dummy` in dev.
- `READ_TEMP_ENABLED` — gates the background temperature-polling loop **and** the fridge UI: with `false` the fridge chip in the rail and the fridge card in the stats stay visible but disabled, and no readings are queried.
- `READ_TEMP_DELTA_SEC` — polling interval for that loop; the stats fridge card asks for 12 hours worth of readings at this interval.

The root layout and the stats/settings pages call `await connection()` so they render per request: env vars come from the running container, never from the image build, and the build never tries to prerender pages against the db.

## Architecture

### Hardware abstraction (`src/service/gpio.ts`)

All hardware access shells out to the `gpio` CLI (`exec`) and to `cat` on the temperature sysfs file. Every call is wrapped in `wrap()`, which swallows failures and logs a "Mocking GPIO subprocess" message instead of throwing. This is what makes `npm run dev` work on a normal laptop with no real GPIO/sensor present — don't "fix" these catches into hard failures.

`turnON`/`turnOFF` take either a raw GPIO pin number or a `DispenseOperation` (see below) and set it `LOW`/`HIGH` respectively (the relay board is active-low).

### Domain model (`src/service/types.ts`, `src/service/utils.ts`)

`DISPENSE_OPERATIONS` in `utils.ts` is the single source of truth for the three water types the machine can dispense (still/room-temp, still/cold, sparkling/cold), each mapping a relay pin (`RELAYS`) to an `operation_type` id, a `factor` (ml/sec flow rate), a `color` (hex) and a `slug` (`ambiente` / `fredda` / `frizzante`). The slug picks the `--kiosk-water-<slug>` and `--kiosk-water-<slug>-strong` design tokens, so components color a water type through CSS variables rather than the hex. Dispensed quantity is always derived as `duration * factor`, computed at insert time in `db.ts` — there's no direct flow-meter reading.

### Persistence (`src/service/db.ts`)

Single `sqlite3.Database` instance created at module load, with `CREATE TABLE/VIEW IF NOT EXISTS` run inline on connect (no separate migration mechanism — schema changes go directly into this file). Tables: `dispenses`, `filters`, `tanks`, `refrigerator`, plus two SQL views (`aggregate_dispenses_filters`, `aggregate_dispenses_tanks`) used for the stats screen:

- `aggregate_dispenses_filters` sums dispense duration per operation type *since the last filter replacement* (used to show filter wear/remaining capacity).
- `aggregate_dispenses_tanks` sums sparkling-water (`operation_type = 3`, carbonation tank) duration per day, in UTC days.

Every exported function in `db.ts` is a React Server Action (`"use server"`); they are reachable from any client, so `insertFilter`/`insertTank` validate the quantity (`isValidQuantity` from `keypad.ts`). Pages read through them on the server (wrapped in `loadSafely`, which logs a failure and falls back to empty data), client components call them for writes. The only HTTP API route is `GET /api/refrigerators` (`src/app/api/refrigerators/route.ts`), polled by the fridge chip.

### Background temperature logging (`src/instrumentation.ts`)

Uses the Next.js `register()` instrumentation hook: on Node runtime startup, if `READ_TEMP_ENABLED=true`, it starts a `setInterval` that reads the sensor and inserts a row into `refrigerator` every `READ_TEMP_DELTA_SEC` seconds. This is the only writer of refrigerator/temperature data.

### Screens (`src/app/`) and components (`src/components/client/<area>/`)

Every screen sits inside `shell/AppShell` (mounted by the root layout): a left `NavRail` with large Eroga / Statistiche / Impostazioni links, the `FridgeChip` and a `Clock`. `DispenseLock` is the context the dispenser uses to lock the rail while a valve is open.

- `/` — `dispenser/Dispenser`: the `DispenseDial` (a round tap target with a CSS water animation, timer and estimated ml) and the `WaterTypeSelector`. Starting locks the navigation and the water type; a 1s guard ignores double taps; the valve closes by itself after `MAX_DISPENSE_SEC` (120s, `src/service/dispense.ts`); after a stop a summary shows for a few seconds. The water type buttons sit in a column on the right or in a row at the bottom, from the button layout preference.
- `/stats` — a server page that loads everything and hands the computed results (`src/service/stats.ts`) to `stats/` cards: `MonthlyTiles`, `FilterGauge`, `TankCard` (client, steps through the tanks) and `FridgeCard`, all on one screen with no scrolling.
- `/settings` — a server page loading the last filter and tank, rendering `settings/SettingsScreen`: a master-detail with `ScreenPanel` (theme and button layout; first and selected by default — there is no full screen switch, the kiosk browser already runs full screen), two `KeyPadPanel`s (new filter in litres, new CO₂ tank in grams, each asking for confirmation before saving) and `InfoPanel` (app version imported from `package.json` by the settings page; Next 16 removed `publicRuntimeConfig`).

`preferences/useButtonLayout` keeps the button layout (`column` / `row`) in `localStorage`; `BUTTON_LAYOUT_SCRIPT` (in the layout `<head>`) mirrors it on `<html data-button-layout>` before the first paint, and the dispenser CSS lays itself out from that attribute.

### UI stack and styling

Components are custom, styled with CSS Modules next to each component. Mantine v9 (`@mantine/core`) is kept only as infrastructure: `MantineProvider` and its persisted color scheme (dark by default) and `useMantineColorScheme`; `@mantine/hooks` is no longer imported by the app but stays installed as a peer dependency of `@mantine/core`. Since no Mantine component is rendered, `layout.tsx` imports only Mantine's base sheets (`baseline`, `default-css-variables`, `global`) instead of the whole `@mantine/core/styles.css` (~190 KB); a Mantine component added later needs its own `@mantine/core/styles/<Component>.css`. Design tokens (colors per scheme, spacing, radii, type scale, touch target size) are CSS custom properties in `src/app/tokens.css`, switched by Mantine's `data-mantine-color-scheme` attribute. Manrope is vendored in `src/app/fonts/` (one latin variable woff2, SIL OFL) and loaded with `next/font/local`; do not switch back to `next/font/google`, the Docker build must not depend on Google Fonts being reachable.

Rules the redesign follows — keep them when changing screens:

- Responsive, not pixel-fixed: rem for type and spacing, flex/grid, `dvh`/`vw` with `clamp()`/`min()`, container queries inside components; 1024×600 is the reference, 800×480 and 1280×800 must still fit one screen. A `max-height: 34rem` media query tightens the rhythm on short displays.
- Phone on the LAN (a check from an iPhone 15 or similar, never the kiosk): `$kiosk-phone-narrow` (portrait, `max-width: 36rem`) and `$kiosk-phone-short` (landscape, `max-height: 28rem`), PostCSS variables in `postcss.config.cjs`, used as `@media (max-width: $kiosk-phone-narrow)`. Under them the document scrolls instead of `.content` (iOS only shrinks the browser bars when the page itself scrolls), the rail becomes a sticky bottom bar in portrait and a slimmer sticky column in landscape, the clock is hidden, and pages drop `height: 100%`. The dispenser always shows dial over types in portrait and types on the right in landscape: these rules use `:global(html[data-button-layout]) .x` to match the specificity of the button-layout rules, and never change the saved preference; for the same reason the settings hide the button layout group on a phone (`data-kiosk-only` on its fieldset). Phone sizes use `svh` so nothing resizes while the browser bars slide. Check 393×660 and 852×330 (iPhone 15 with the bars shown) besides the kiosk sizes.
- Animations only on `transform` and `opacity` (the Orange Pi GPU is weak), all turned off under `prefers-reduced-motion`.
- Touch targets at least `--kiosk-touch-min` (3rem); UI text in Italian.
