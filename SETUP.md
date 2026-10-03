# Intersign Editor — Setup

## Prerequisites

- [Bun](https://bun.sh/) 1.3+ and Node.js 20.9+

## Quick Start

```bash
bun install
bun dev
```

The editor will be running at **http://localhost:3002**.

The editor engine is installed from Pascal Editor's npm packages (`@pascal-app/*`), and
the bundled plugins (trees, pool, bones, streetscape, environment, WebXR, Mint) are pinned
GitHub dependencies. `bun install` fetches both; nothing else needs to be checked out.

Environment is one of those bundled plugins. Open **+ → Plugins → Environment** to manage
its installation for the current project, then open **Environment** in the sidebar.

## Environment Variables (optional)

Copy `.env.example` to `.env` if you need:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Dev server port (default: 3002) |
| `MINT_PASCAL_HOST_ORIGIN` | No | Public editor origin used by Mint sign-in and request checks. Set it for self-hosted deployments. |
| `PASCAL_DB_PATH` / `PASCAL_DATA_DIR` | No | Where saved scenes are stored (default `~/.pascal/data/pascal.db`). |
| `INTERSIGN_ITEMS_DIR` | No | Where uploaded furniture is stored (default: an `items` folder next to the scene database). |
| `INTERSIGN_ITEM_MAX_MB` | No | Largest furniture model that can be uploaded, in MB (default 50). |

The variable names come from the Pascal packages that read them. Local development works
without any environment variables.

## Docker

```bash
docker compose up -d
```

The editor will be running at **http://localhost:3000**. Saved scenes live in
the `pascal-data` volume, so they survive `docker compose down`.

Docker defaults `MINT_PASCAL_HOST_ORIGIN` to `http://localhost:3000`. Override
it when hosting Intersign at another origin:

```bash
MINT_PASCAL_HOST_ORIGIN=https://intersign.example.com docker compose up -d
```

Keep the container port at 3000: the `/scenes` page fetches its own API through
a base URL that only `NEXT_PUBLIC_APP_URL` can override, and Next inlines that
value at build time, so remapping the port to something else makes the page
return 500.

## Repository Structure

```
├── apps/
│   ├── editor/          # Intersign editor (Next.js)
│   └── ifc-converter/   # IFC → Intersign converter (Next.js)
├── packages/            # Shared lint/TS config and UI scaffolding (@repo/*)
├── tooling/typescript/  # Shared TypeScript config
└── patches/             # bun patches for three and iwer
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start the development server |
| `bun run build` | Build both apps |
| `bun check` | Lint and format check (Biome) |
| `bun check:fix` | Auto-fix lint and format issues |
| `bun check-types` | TypeScript type checking |
| `bun run test` | Run the test suites |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on submitting PRs and reporting issues.
