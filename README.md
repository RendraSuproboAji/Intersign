<p align="center">
  <img src="apps/editor/public/intersign-logo-full.svg" alt="Intersign — Interior Design" width="460" />
</p>

# Intersign Editor

An open-source, local-first 3D interior and building editor built with React Three Fiber
and WebGPU.

[![MIT License](https://img.shields.io/badge/license-MIT-1F4D2E.svg)](LICENSE)

> Intersign is built on [Pascal Editor](https://github.com/pascalorg/editor) (MIT).
> The editor engine comes from Pascal's published npm packages (`@pascal-app/*`);
> this repository holds the Intersign app around it. See [NOTICE.md](NOTICE.md) for
> attribution and for the Pascal services and plugins Intersign relies on.

## What's in this repository

```
apps/
├── editor/          # The Intersign editor (Next.js): branding, pages, scene API, plugin wiring
└── ifc-converter/   # IFC → Intersign scene converter (Next.js)
tooling/typescript/  # Shared TypeScript config
patches/             # bun patches for three and iwer
```

The engine is installed from npm, pinned to one Pascal release:

| Package | Used for |
| --- | --- |
| [`@pascal-app/core`](https://www.npmjs.com/package/@pascal-app/core) | Scene schema, state, systems |
| [`@pascal-app/viewer`](https://www.npmjs.com/package/@pascal-app/viewer) | 3D rendering |
| [`@pascal-app/editor`](https://www.npmjs.com/package/@pascal-app/editor) | Editor UI, tools and panels |
| [`@pascal-app/nodes`](https://www.npmjs.com/package/@pascal-app/nodes) | Built-in node kinds |
| [`@pascal-app/mcp`](https://www.npmjs.com/package/@pascal-app/mcp) | Local scene storage and operations |
| [`@pascal-app/ifc-converter`](https://www.npmjs.com/package/@pascal-app/ifc-converter) | IFC conversion (IFC converter app) |

Intersign does not publish npm packages of its own.

## Getting Started

You need [Bun](https://bun.sh/) 1.3+ and Node.js 20.9+.

```bash
bun install
bun dev
```

The editor runs at **http://localhost:3002**. See [SETUP.md](SETUP.md) for environment
variables and Docker.

Other commands, run from the repo root:

```bash
bun run check         # lint and format check (Biome)
bun run check-types   # type check
bun run test          # tests
bun run build         # production build of both apps
```

### Updating the Pascal engine

The `@pascal-app/*` packages are released together at the same version. Bump them all in
`apps/editor/package.json` and `apps/ifc-converter/package.json`, run `bun install`, then
run the checks above. Pascal's release notes are at
[pascalorg/editor releases](https://github.com/pascalorg/editor/releases).

## Agent skills and CLI

Intersign doesn't ship its own CLI, MCP server or agent skills. Use Pascal's:

[![Install with skills](https://skills.sh/b/pascalorg/editor)](https://skills.sh/pascalorg/editor)

See [Pascal Editor](https://github.com/pascalorg/editor) for the `@pascal-app/cli`
command, MCP setup and the agent skills.

## Contributing

Bug fixes, features, docs and ideas are all welcome. Start with
[CONTRIBUTING.md](CONTRIBUTING.md).

- Changes to the editor engine itself belong upstream in
  [pascalorg/editor](https://github.com/pascalorg/editor); new node kinds and panels ship as
  [plugins](https://editor.pascal.app/docs/developers/plugins)
- Questions and ideas go to [Discussions](https://github.com/RendraSuproboAji/Intersign/discussions); reproducible bugs go to [Issues](https://github.com/RendraSuproboAji/Intersign/issues)
- Participation is covered by our [Code of Conduct](CODE_OF_CONDUCT.md)
- Security problems go to [SECURITY.md](SECURITY.md), not a public issue

---

## Upstream Contributors

Intersign builds on the work of the [Pascal Editor](https://github.com/pascalorg/editor) contributors:

<a href="https://github.com/Aymericr"><img src="https://avatars.githubusercontent.com/u/4444492?v=4" width="60" height="60" alt="Aymeric Rabot" style="border-radius:50%"></a>
<a href="https://github.com/wass08"><img src="https://avatars.githubusercontent.com/u/6551176?v=4" width="60" height="60" alt="Wassim Samad" style="border-radius:50%"></a>
<a href="https://github.com/sudhir9297"><img src="https://avatars.githubusercontent.com/sudhir9297?v=4" width="60" height="60" alt="Sudhir" style="border-radius:50%"></a>
