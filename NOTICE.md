# Notice

Intersign is built on [Pascal Editor](https://github.com/pascalorg/editor),
copyright (c) 2026 Pascal Group Inc., released under the MIT License. This repository
started as a fork of Pascal Editor; the original copyright notice is kept in
[LICENSE](LICENSE), as the MIT License requires. The Intersign name, logo
(`assets/brand/`, `assets/intersign-mark*`, `apps/editor/public/intersign*`) and the
modifications in this repository are copyright (c) 2026 Intersign.

## What comes from Pascal

### Editor engine (npm)

The editor engine is installed from Pascal's published npm packages and is not
modified here: `@pascal-app/core`, `@pascal-app/viewer`, `@pascal-app/editor`,
`@pascal-app/nodes`, `@pascal-app/mcp`, `@pascal-app/ifc-converter` and
`@pascal-app/lingo`. Their names, the `PASCAL_*` environment variables they read
(for example `PASCAL_DB_PATH`), and the runtime identifiers they use are Pascal's.
Intersign does not publish npm packages of its own.

### Third-party plugins

These are installed from their own repositories:

| Package | Source |
| --- | --- |
| `@pascal-app/plugin-trees` | `github:pascalorg/plugin-trees` |
| `@pascal-app/plugin-bones` | `github:pascalorg/plugin-bones` |
| `@pascal-app/plugin-pool` | `github:sudhir9297/pool-pascal-plugin` |
| `@pascal-app/plugin-streetscape` | `github:sudhir9297/streetscape-pascal-plugin` |
| `@pascal-app/plugin-environment` | `github:AxiomeCG/environment` |
| `@webxr/plugin` | `github:sudhir9297/webxr-pascal-plugin` |
| `@mint/pascal-plugin` | `github:mintdotgg/mint-pascal-plugin` |

### Hosted services

These defaults point at Pascal's hosted infrastructure. Override them to use your own:

- Asset CDN (furniture models, textures): `https://editor.pascal.app`,
  `cdn.pascal.app`, `assets.pascal.app`. Set `NEXT_PUBLIC_ASSETS_CDN_URL`.
- Hosted MCP endpoint, agent-account claim flow and developer docs under
  `https://editor.pascal.app`.

### Agent tooling

The CLI (`@pascal-app/cli`), MCP server and agent skills are Pascal's and are not
part of this repository; see [pascalorg/editor](https://github.com/pascalorg/editor).
