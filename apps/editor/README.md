# Intersign Editor app

The Next.js application behind Intersign: a 3D interior and building editor built
with React Three Fiber and WebGPU.

The editor engine comes from Pascal Editor's published npm packages, pinned in
`package.json`:

| Package | Provides |
| --- | --- |
| `@pascal-app/core` | Node schemas, scene state, systems, spatial queries, event bus |
| `@pascal-app/viewer` | 3D rendering, default camera and controls, post-processing |
| `@pascal-app/editor` | Editor UI: tools, panels, selection, floorplan |
| `@pascal-app/nodes` | Built-in node kinds (walls, doors, windows, roofs, …) |
| `@pascal-app/mcp` | Scene storage (local SQLite) and scene operations for the API routes |

This app adds the Intersign shell around them: branding (logo, favicon, colors in
`app/globals.css`, page metadata in `app/layout.tsx`), the Privacy and Terms pages,
the scene API routes under `app/api/`, and the third-party plugins wired up in
`lib/bootstrap.ts`.

For how the engine works (nodes, renderers, systems, plugins), see Pascal Editor's
documentation and architecture notes at
[pascalorg/editor](https://github.com/pascalorg/editor).

## Develop

```bash
bun install
bun dev        # from the repo root, or `bun run dev` in this directory
bun run test   # this app's tests (lib/)
```

Saved scenes live in a local SQLite database, by default `~/.pascal/data/pascal.db`.
Set `PASCAL_DB_PATH` or `PASCAL_DATA_DIR` to change it.

## Updating the engine

Bump the `@pascal-app/*` versions in `package.json` together (they are released at
the same version), run `bun install`, then `bun run check-types`, `bun run test`
and `bun run build` from the repo root.
