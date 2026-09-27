# @intersign/nodes

Built-in node definitions for the Intersign viewer and editor.

## Installation

```bash
npm install @intersign/core @intersign/viewer @intersign/editor @intersign/nodes
```

The package declares the remaining React, Next.js, Three.js, and UI libraries it needs as peer
dependencies. Install any peers reported by your package manager.

## Usage

Load `builtinPlugin` once before mounting an Intersign viewer or editor:

```typescript
import { loadPlugin } from '@intersign/core'
import { builtinPlugin } from '@intersign/nodes'

await loadPlugin(builtinPlugin)
```

The plugin registers the built-in schemas, renderers, geometry builders, tools, and systems. Hosts
can load additional plugins through the same `loadPlugin` API.

See the
[`@intersign/viewer` quick start](https://github.com/RendraSuproboAji/Intersign/tree/main/packages/viewer#usage)
for bootstrap ordering in a React application.

## License

MIT
