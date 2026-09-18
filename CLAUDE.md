# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A touchscreen kiosk web app that runs *on* a physical water dispenser (BWT AQA drink U20 CAS) built into an Orange Pi / Armbian single-board computer. The Next.js server directly drives the hardware: it toggles relays (via the `gpio` CLI from wiringOP-next) to open/close water valves, reads a 1-Wire temperature sensor for the fridge unit, and logs every dispense/temperature reading to a local SQLite database. The UI (Italian-language) is meant to be shown full-screen on the device's own display.

## Commands

```bash
npm run dev      # start dev server with Turbopack (uses .env.development — mocked GPIO/temperature)
npm run build    # production build (standalone output)
npm run start    # run the production build
npm run lint     # next lint (eslint-config-next)
```

There is no test suite/framework configured in this repo.

### Docker (production deploy to the device)

```bash
./build-push.sh   # docker build, tag from package.json version, push to local registry 192.168.1.254:5000
```

`Dockerfile` is a multi-stage build: the final `runner` stage additionally compiles and installs `wiringOP-next` (the `gpio` CLI used to control relays) and runs as UID 1000 on port 80. `docker-compose.yml` runs the container `privileged: true` and bind-mounts `/sys/bus/w1/devices` (temperature sensor) and `/etc/armbian-release`, so GPIO/temperature access only works when actually deployed to the SBC.

## Environment configuration

Behavior switches between "real hardware" and "dev machine" purely through env vars (`.env.development` vs `.env.production`):

- `DB_FILE` — path to the SQLite file.
- `TEMPERATURE_FILE` — path to the 1-Wire sensor's sysfs file in prod; `dummy` in dev.
- `READ_TEMP_ENABLED` — gates the background temperature-polling loop.
- `READ_TEMP_DELTA_SEC` — polling interval for that loop.

## Architecture

### Hardware abstraction (`src/service/gpio.ts`)

All hardware access shells out to the `gpio` CLI (`exec`) and to `cat` on the temperature sysfs file. Every call is wrapped in `wrap()`, which swallows failures and logs a "Mocking GPIO subprocess" message instead of throwing. This is what makes `npm run dev` work on a normal laptop with no real GPIO/sensor present — don't "fix" these catches into hard failures.

`turnON`/`turnOFF` take either a raw GPIO pin number or a `DispenseOperation` (see below) and set it `LOW`/`HIGH` respectively (the relay board is active-low).

### Domain model (`src/service/types.ts`, `src/service/utils.ts`)

`DISPENSE_OPERATIONS` in `utils.ts` is the single source of truth for the three water types the machine can dispense (still/room-temp, still/cold, sparkling/cold), each mapping a relay pin (`RELAYS`) to an `operation_type` id and a `factor` (ml/sec flow rate). Dispensed quantity is always derived as `duration * factor`, computed at insert time in `db.ts` — there's no direct flow-meter reading.

### Persistence (`src/service/db.ts`)

Single `sqlite3.Database` instance created at module load, with `CREATE TABLE/VIEW IF NOT EXISTS` run inline on connect (no separate migration mechanism — schema changes go directly into this file). Tables: `dispenses`, `filters`, `tanks`, `refrigerator`, plus two SQL views (`aggregate_dispenses_filters`, `aggregate_dispenses_tanks`) used for the stats screens:

- `aggregate_dispenses_filters` sums dispense duration per operation type *since the last filter replacement* (used to show filter wear/remaining capacity).
- `aggregate_dispenses_tanks` sums sparkling-water (`operation_type = 3`, carbonation tank) duration per day.

Every exported function in `db.ts` is a React Server Action (`"use server"`) and is called directly from client components — there is no REST/GraphQL layer for CRUD. The only HTTP API route is `GET /api/refrigerators` (`src/app/api/refrigerators/route.ts`), used for client-side polling of recent temperature readings.

### Background temperature logging (`src/instrumentation.ts`)

Uses the Next.js `register()` instrumentation hook: on Node runtime startup, if `READ_TEMP_ENABLED=true`, it starts a `setInterval` that reads the sensor and inserts a row into `refrigerator` every `READ_TEMP_DELTA_SEC` seconds. This is the only writer of refrigerator/temperature data.

### Pages (`src/app/`)

- `/` (`page.tsx`) — the main kiosk screen (`Dispenser` component): pick a water type (`OperationSelector`), press Avvio/Stop to open/close the valve. On Stop it calls `turnOFF` + `insertDispense` together, using a client-tracked start timestamp to compute duration.
- `/stats` — monthly dispense summary, tank (sparkling) usage chart, refrigerator temperature chart (Mantine charts / Recharts).
- `/settings` — filter replacement logging, tank refill logging, theme toggle, fullscreen toggle, and the app version (read from `next.config.ts`'s `publicRuntimeConfig`, sourced from `package.json`).

All page-level components are Server Components (`"use server"`) that compose client components (`"use client"`, under `src/components/client/`) for interactivity.

### UI stack

Mantine v8 (`@mantine/core`, `@mantine/charts`, `@mantine/hooks`) is the component library and theme provider (set up in `src/app/layout.tsx`). `src/app/template.tsx` wraps every route transition in a `motion/react` fade. UI text is in Italian and the layout targets a touchscreen kiosk, not a general responsive site — keep that in mind when changing layouts (`FullScreen.tsx`, large touch targets, etc.).
