# Intersign CLI

Run the open-source [Intersign 3D building editor](https://editor.pascal.app) locally
from your terminal—without cloning or building the Intersign repository.

[![npm version](https://img.shields.io/npm/v/@intersign/cli?label=npm)](https://www.npmjs.com/package/@intersign/cli)
[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![Intersign documentation](https://img.shields.io/badge/docs-editor.pascal.app-111111)](https://editor.pascal.app/docs/developers/local-editor)

```bash
npx @intersign/cli editor
```

On an interactive first run through `npx`, Intersign installs the same CLI version globally
after the editor becomes healthy. The shorter `intersign` command is therefore available
for `status`, `logs`, `stop`, and future sessions without another setup step. If the
global installation is unavailable because of local npm permissions, the editor remains
running and the CLI shows the equivalent `npx` commands plus the manual install command.

The first run walks through local storage, the one-time web runtime download, automatic
editor and MCP port selection, process startup, and both health checks with live terminal
feedback. It then opens `http://intersign.localhost:<port>`. Your projects are stored
separately from the runtime, so updating the CLI does not replace your work.

## Why use the CLI?

- Run a complete local Intersign editor with one command.
- Keep projects on your machine in a local SQLite database.
- Start and stop the editor independently from your terminal session.
- Inspect health, logs, versions, storage, and project state from scripts or agents.
- Connect Codex, Claude Code, Cursor, or another MCP client to the same local projects.
- Update through a health-checked activation that rolls back if the new runtime fails.

## Requirements

- Node.js 22.13 or newer
- npm, including when the CLI itself is launched with pnpm or Bun
- A browser, unless you pass `--no-open`
- Network access the first time you start the editor, or a local copy of the web runtime
  archive (see [The web editor runtime](#the-web-editor-runtime)); `intersign mcp connect`
  needs neither

The initial supported release is macOS. A clean claim-command installation also passed in
a Linux arm64 container. This is not an x86_64 or Windows result.

Use one active agent client per local CLI service. The standalone local HTTP runtime shares active scene state between clients; use separate `INTERSIGN_HOME` directories and service processes when independent concurrent work is required.

## Install and run

Use your preferred package runner:

```bash
# npm
npx @intersign/cli editor

# pnpm
pnpm dlx @intersign/cli editor

# Bun
bunx @intersign/cli editor
```

To install the `intersign` command before starting the editor:

```bash
npm install --global @intersign/cli
intersign editor
```

After the interactive `npx` first run or a global installation, `intersign status`,
`intersign logs --follow`, and the other commands work directly in the current terminal
and future sessions.

Use `--no-open` on a headless machine. Use `--foreground` when a process supervisor
should own the editor or when you want logs attached to the current terminal.
Intersign asks the operating system for an available loopback port by default, so it does
not compete with other local development servers. Pass `--port <n>` to request a
specific port; if it is occupied, Intersign reports that and safely selects another one.

```bash
npx @intersign/cli editor --no-open
npx @intersign/cli editor --foreground --no-open
```

## The web editor runtime

The npm package carries the CLI and the MCP service only: about 0.5 MB compressed and
2.5 MB installed. The web editor itself—the Next.js server, its static assets, and the
bundled item library—is published as one archive per CLI version, about 64 MB compressed
and 106 MB on disk.

Every command that starts the editor (`editor`, `start`, `open`, `resume`, `projects`,
`project open`, `update`) resolves that runtime in this order:

1. `INTERSIGN_BUNDLED_RUNTIME_DIR`, an already-extracted runtime directory.
2. `--runtime <directory-or-archive>`, which every one of those commands accepts.
3. The runtime already installed in `~/.intersign/runtime/<version>` for this CLI version.
4. The release asset recorded in the package, streamed into `~/.intersign/tmp` with download
   progress in the terminal.

Each CLI version pins its own runtime version, so upgrading the CLI switches the editor to
the matching runtime the next time it starts. If the editor is already running on an older
runtime, `intersign editor` says so; `intersign restart` (or `intersign update`) makes the switch.
`intersign doctor` reports the installed and the pinned runtime version when they differ.

A downloaded archive is checked against the SHA-256 digest published inside the npm
package before anything is extracted. On a mismatch the CLI deletes the temporary file and
installs nothing, so a corrupted or substituted archive never becomes your runtime.
Concurrent first runs share one download through the runtime install lock.

An offline or air-gapped machine can take the archive from the release page:

```bash
# On a connected machine
curl --fail --location --remote-name \
  "https://github.com/RendraSuproboAji/Intersign/releases/download/@intersign/cli@<version>/intersign-web-runtime-<version>.tar.gz"

# On the target machine
intersign editor --runtime ./intersign-web-runtime-<version>.tar.gz
```

An archive passed with `--runtime` is digest-verified exactly like a download. A directory
is installed as it is, which is the escape hatch for a runtime you built yourself from this
repository.

`HTTPS_PROXY` (or `ALL_PROXY`), including a proxy that requires basic authentication, and
`NO_PROXY` are honoured; only `https://` URLs are accepted. When a download fails, the CLI
prints the archive URL, the expected digest, and the `--runtime` command to run after
copying the file across.

Agent tools need none of this. `intersign mcp connect` starts the MCP service that ships in
the npm package, so an agent can read and write local projects on a machine that has never
downloaded the web runtime.

## Commands

| Command | Purpose |
| --- | --- |
| `intersign editor [--runtime <path>]` | Install the web runtime if needed, ensure the editor is running, and open it. |
| `intersign start [--runtime <path>]` | Ensure the editor is running without opening a browser. |
| `intersign stop [--force]` | Stop the managed editor and MCP processes; `--force` is a guarded recovery path. |
| `intersign restart` | Restart the editor and MCP service with their current configuration. |
| `intersign status [--json]` | Show editor and MCP health, version, PIDs, ports, URL, and runtime metadata. |
| `intersign open [project]` | Start Intersign if needed, then open the editor or a project by ID, ID prefix, or unique name. |
| `intersign resume [project]` | Open the latest project, or a selected project. |
| `intersign projects [--json]` | List local projects. |
| `intersign logs [--follow]` | Read or follow the managed editor log. |
| `intersign update [--version <version>] [--runtime <path>]` | Health-check and activate the runtime this CLI publishes, or an npm-published target. |
| `intersign doctor [--json]` | Diagnose Node.js, storage, runtime, process, and plugin state. |
| `intersign info [--json]` | Print platform, paths, runtime, and plugin context. |
| `intersign project list [--json]` | Explicit form of `intersign projects`. |
| `intersign project open <id-or-name>` | Explicit form of `intersign open <project>`. |
| `intersign agent claim [--no-open] [--json]` | Link an autonomous hosted agent to the person accountable for it. |
| `intersign agent status [--json]` | Verify the hosted agent credential and inspect its claim and organization scope. |
| `intersign mcp connect` | Stable local connector for MCP clients; starts the bundled MCP service without the web runtime. |
| `intersign mcp status [--json]` | Show managed MCP health. |
| `intersign mcp config [--json]` | Print generic MCP client configuration. |
| `intersign mcp setup <codex\|claude>` | Configure an installed client without overwriting existing entries. |
| `intersign plugin list [--json]` | Inspect the reserved managed-plugin lock. |

When you do not install globally, prefix commands with a runner—for example,
`npx @intersign/cli doctor`.

## Local data and security

Intersign binds the editor and MCP service only to `127.0.0.1` and uses the reserved
`.localhost` hostname. MCP requires a random token stored in Intersign's private runtime
directory; client configuration never contains that token.

```text
~/.intersign/
  runtime/<version>/           installed web editor runtimes
  data/intersign.db               projects and scenes
  logs/editor.log              detached editor and MCP output
  run/editor.json              managed editor process identity
  run/mcp.json                 managed MCP service identity
  run/mcp-token                private local MCP token
  tmp/                         runtime downloads in progress
  plugins/                     reserved verified-plugin storage
  intersign.plugins.lock          reserved managed-plugin lock
```

Runtime installation, project data, process state, and logs have separate lifecycles.
The CLI does not include a command that deletes project data. Updates retain the
previous runtime for rollback, and `intersign doctor` warns when more than three versions
have accumulated.

## Local AI agents

The MCP service ships in the npm package. It starts automatically with `intersign editor`, and
`intersign mcp connect` starts it on its own—no web runtime download, no editor process. Add
the stable connector to your client once:

```bash
intersign mcp setup codex
intersign mcp setup claude
```

Or use `intersign mcp config` for JSON-based clients. Ask the agent to read
`intersign://agent-guide`, list or load a scene, edit it, and return the `editorUrl`. Those
`editorUrl` values point at the local editor; run `intersign editor` to open one, which is
also when the web runtime is downloaded.

## Hosted autonomous agents

An autonomous agent registered with hosted Intersign receives its own API key and identity. The
agent can create a short-lived claim code so the person working with it can establish the
accountability link:

```bash
INTERSIGN_API_KEY='sk_live_...' intersign agent claim
INTERSIGN_API_KEY='sk_live_...' intersign agent status
```

The CLI sends that key once to Intersign's claim endpoint, does not store or print it, and opens
the claim page. Use `--no-open` on a headless host. `--json` returns structured output without
opening a browser. A new claim request supersedes the agent's previous code; each code expires
after 15 minutes.

`intersign agent status` confirms that the credential remains active and reports the agent ID,
autonomous or delegated mode, claim state, and whether the key is scoped to an organization.
It does not expose the accountable person's identity or inspect local editor projects.

Claiming lifts claim-gated capabilities for the autonomous agent. It does not transfer project
ownership, grant the agent access to the person's private projects, or grant the person access
to the agent's private projects. The local editor and its projects remain local unless a
separate hosted project action explicitly moves data.

## Plugins

The current CLI manages the local editor runtime; it does not yet download plugin code
from GitHub or npm. Follow the [plugin authoring guide](https://editor.pascal.app/docs/developers/plugins)
and the standalone [Nature plugin](https://github.com/pascalorg/plugin-trees) when
building an extension today.

Intersign also exposes a hosted Model Context Protocol endpoint for projects in an Intersign
account. See [Connect an AI agent](https://editor.pascal.app/docs/developers/mcp) for
the local and hosted workflows and the standalone `@intersign/mcp` package.

## Documentation and support

- [Complete CLI guide](https://editor.pascal.app/docs/developers/local-editor)
- [Plugin authoring guide](https://editor.pascal.app/docs/developers/plugins)
- [MCP and AI-agent guide](https://editor.pascal.app/docs/developers/mcp)
- [Open-source repository](https://github.com/RendraSuproboAji/Intersign)
- [Issues and feature requests](https://github.com/RendraSuproboAji/Intersign/issues)
- [Discord community](https://discord.gg/XRKsDcpqgS)

## License

MIT
