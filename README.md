# skylet-discord

Modern Discord bot featuring music playback (DisTube + YouTube), Twitch lookups (users/streams/games), typed runtime env validation, and a lightweight SQLite (Turso/libSQL) database via Drizzle ORM.

## Features

- Music commands using DisTube and YouTube plugin (join, leave, play, pause/resume, skip, volume)
- Twitch command with embeds for live streams and user profiles
- Typed env validation with `@t3-oss/env-core` + `valibot`
- Drizzle ORM + Turso (libSQL) storage for guilds and Twitch alerts
- Structured logging with `pino`
- ESM + TypeScript, hot dev with `tsx`

## Requirements

- Node.js >= 22 (ESM + `import.meta` features)
- pnpm (via Corepack: `corepack enable`)
- FFmpeg (only needed for local dev; Docker images already include it)

## Quick start

1. Install dependencies

```bash
pnpm install
```

2. Configure environment variables

Create a `.env.local` for development and a `.env` for production. Required variables:

```bash
# Discord
DISCORD_CLIENT_ID=
DISCORD_TOKEN=
DISCORD_GUILD_ID= # used for dev-only command registration

# Twitch
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=

# Node env
NODE_ENV=development # or production

# Turso / libSQL
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
```

3. Run the bot in development

```bash
pnpm run dev
```

4. Register slash commands (development/guild)

```bash
pnpm run updatecmds:dev
```

To remove them in dev:

```bash
pnpm run deletecmds:dev
```

## Production

Build and start:

```bash
pnpm run build
pnpm start
```

Register global slash commands (may take up to 1 hour to propagate):

```bash
pnpm run updatecmds:prod
```

Delete global slash commands:

```bash
pnpm run deletecmds:prod
```

## Database (Drizzle + Turso/libSQL)

The project uses Drizzle ORM with the `turso` dialect. Ensure `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set.

- Generate migrations (dev):

```bash
pnpm run db:generate-dev
```

- Apply migrations (dev):

```bash
pnpm run db:migrate-dev
```

- Pull schema from DB (dev):

```bash
pnpm run db:pull-dev
```

For CI/production use the non-`-dev` variants, which read from `.env`:

```bash
pnpm run db:generate
pnpm run db:migrate
pnpm run db:pull
```

## Docker

Development (hot reload):

```bash
docker compose up -d --build
docker compose logs -f app
```

Production:

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f app
```

Both compose files load environment variables from `.env`.

## Scripts

- `dev`: Start the bot with hot reload (`tsx`) using `.env.local`
- `build`: Bundle with esbuild to `dist/`
- `start`: Run the bundled app from `dist/`
- `typecheck`: TypeScript check only
- `lint`: Run ESLint
- `updatecmds:dev` / `deletecmds:dev`: Guild commands for development
- `updatecmds:prod` / `deletecmds:prod`: Global commands for production
- `db:*`: Drizzle Kit operations (see Database section)

## Commands

- `/ping`: latency check
- Music: `/join`, `/leave`, `/play`, `/pause`, `/resume`, `/skip`, `/volume`
- `/twitch user:<username>`: shows live stream embed (if live) or user profile embed

## Project structure (high-level)

```
src/
  client.ts              # Discord client & DisTube setup
  index.ts               # entry; loads handlers and logs in
  handlers/              # dynamic loaders for events, commands, distube events
  events/                # Discord event handlers
  commands/              # Slash commands (music, ping, twitch)
  distube-events/        # Queue/song lifecycle embeds
  functions/             # helpers (embeds, twitch fetchers, utils)
  db/                    # Drizzle client and schema
  schemas/               # valibot schemas for Twitch responses
  env.ts                 # runtime env validation
  logger.ts              # pino logger
```

## Troubleshooting

- Slash commands not showing
  - In dev, ensure `DISCORD_GUILD_ID` is set and run `pnpm run updatecmds:dev`
  - In prod, run `pnpm run updatecmds:prod` and allow time for global propagation
- Intents/permissions
  - The bot requires `Guilds`, `GuildMessages`, `MessageContent`, `GuildVoiceStates`
- FFmpeg not found (local)
  - Install FFmpeg or use Docker images (already include FFmpeg)
- Node version
  - Ensure Node >= 22 (`"engines": { "node": ">=22" }`)

---

If you run into setup issues, open an issue or share your `.env` (redacted) and logs for help.
