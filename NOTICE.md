# Notice

Intersign is a fork of [Pascal Editor](https://github.com/pascalorg/editor),
copyright (c) 2026 Pascal Group Inc., released under the MIT License. The original
copyright notice is kept in [LICENSE](LICENSE) and in each package's `LICENSE`, as
the MIT License requires. The Intersign name, logo (`assets/brand/`,
`assets/intersign-mark*`, `apps/editor/public/intersign*`) and the modifications in
this repository are copyright (c) 2026 Intersign.

## What still points at upstream Pascal

The rebrand renamed the code, packages (`@intersign/*`), CLI (`intersign`), environment
variables (`INTERSIGN_*`), and UI copy. A few names are left as-is on purpose, because
changing them would break software this fork does not control.

### Third-party plugins

These are installed from their own repositories and keep their upstream package names:

| Package | Source |
| --- | --- |
| `@pascal-app/plugin-trees` | `github:pascalorg/plugin-trees` |
| `@pascal-app/plugin-bones` | `github:pascalorg/plugin-bones` |
| `@pascal-app/plugin-pool` | `github:sudhir9297/pool-pascal-plugin` |
| `@pascal-app/plugin-streetscape` | `github:sudhir9297/streetscape-pascal-plugin` |
| `@pascal-app/plugin-environment` | `github:AxiomeCG/environment` |
| `@webxr/plugin` | `github:sudhir9297/webxr-pascal-plugin` |
| `@mint/pascal-plugin` | `github:mintdotgg/mint-pascal-plugin` |
| `@pascal-app/lingo` | npm (unit parsing) |

These plugins import `@pascal-app/core`, `@pascal-app/editor`, `@pascal-app/viewer`
and `@pascal-app/nodes`. The private workspace packages in [`compat/`](compat/README.md)
re-export the matching `@intersign/*` package under those names, so the plugins and
the host share one module instance.

### Plugin and interchange identifiers

The plugins and the Pascal Blender add-on read or write these runtime identifiers, so
the host keeps them unchanged:

- Plugin extension keys `pascal:editor/*` and plugin ids `pascal:trees`,
  `pascal:bones`, `pascal:environment`, `pascal:streetscape`, and so on
- `userData.pascalExport`, `window.__pascalCameraControls`, `data-pascal-viewer-3d`,
  `pascal-editor-grid-input`
- WebXR/Mint plugin exports: `usePascalWebXR`, `PascalWebXRButton`,
  `PascalXRWandBindings`, `handleMintPascalRequest`, `@webxr/plugin/pascal-editor`
- The Blender "send to app" protocol: `/pascal/health`, `/pascal/import`,
  `X-Pascal-*` headers, and the `pascalId` glTF extras key used by the
  [Pascal Blender add-on](https://github.com/pascalorg/blender-addon)

### Hosted services

These defaults still point at Pascal's hosted infrastructure. Override them to use
your own:

- Asset CDN (furniture models, textures): `https://editor.pascal.app`,
  `cdn.pascal.app`, `assets.pascal.app`. Set `NEXT_PUBLIC_ASSETS_CDN_URL`.
- Hosted MCP endpoint, agent-account claim flow and developer docs under
  `https://editor.pascal.app`. `server.json` describes that hosted server, so it
  keeps Pascal's MCP Registry name `io.github.pascalorg/editor`, which CI checks
  against the live API catalog.
- Demo footage in `docs/media/next-demo/`, which is Pascal Group Inc. footage under
  CC BY 4.0 (see that folder's `LICENSE.md`)
