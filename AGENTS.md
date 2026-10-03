# Agent Instructions — `RendraSuproboAji/Intersign`

The Intersign editor: a branded Next.js app built on Pascal Editor's published npm
packages (`@pascal-app/core`, `viewer`, `editor`, `nodes`, `mcp`, `ifc-converter`).
This repo does not contain or publish the engine packages.

## Repo Shape

| Path | Purpose |
|---|---|
| `apps/editor` | The Intersign editor app — composes `@pascal-app/viewer` + `@pascal-app/editor`, adds branding, the Privacy/Terms pages, the scene API routes and plugin wiring (`lib/bootstrap.ts`) |
| `apps/ifc-converter` | IFC → Intersign scene converter app |
| `tooling/typescript` | Shared TypeScript config |
| `patches/` | bun patches for `three` and `iwer` |

## Where to look

- **Engine architecture** (nodes, renderers, systems, tools, plugins) — Pascal's
  `wiki/architecture/` in [pascalorg/editor](https://github.com/pascalorg/editor). Read the
  relevant page before changing how the app uses the engine.
- **Skills (ready workflows)** — `.agents/skills/<name>/SKILL.md`. Same content is reachable as `.claude/skills/`, `.cursor/skills/`, `.codex/skills/` (symlinks to `.agents/skills/`).
- **Repo orientation for humans** — `README.md`, `SETUP.md`, `CONTRIBUTING.md`, `NOTICE.md`.

`CLAUDE.md`, `GEMINI.md`, and `.github/copilot-instructions.md` are symlinks to this file. Codex reads this file directly.

## Working with the Pascal packages

- Don't patch `@pascal-app/*` code in `node_modules`. Engine changes belong upstream in
  `pascalorg/editor`; this repo changes the app around the engine.
- Keep every `@pascal-app/*` dependency on the same version in both apps, and bump them
  together.
- `@pascal-app/editor` ships TypeScript source, so it must stay in each app's
  `transpilePackages` (`next.config.ts`), and the editor app's Tailwind config scans it via
  `@source` in `app/globals.css`.
- Names the engine or plugins read at runtime stay Pascal's: `PASCAL_*` env vars, plugin ids
  and extension keys (`pascal:*`), and `MINT_PASCAL_HOST_ORIGIN`.

## Operating rules

- Read the full file before editing. Plan all changes, then make one complete edit.
- When the user corrects you, stop and re-read their message.
- After two consecutive tool failures, stop and change approach.
- Don't introduce backwards-compatibility shims, dead code, or speculative abstractions.
- Don't write new comments unless they explain a non-obvious *why*.
