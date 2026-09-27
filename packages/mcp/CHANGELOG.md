# Changelog

All notable changes to `@intersign/mcp` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- The published ESM output now resolves relative JavaScript imports under Node,
  so `intersign-mcp` and package subpath exports no longer require Bun's
  extensionless import fallback.
- Tool schemas in `tools/list` now declare the JSON Schema 2020-12 dialect
  instead of the SDK default `draft-07`, so clients that enforce 2020-12 no
  longer reject every tool call.

## [0.1.0] - 2026-04-18

### Added

- Initial release.
- `SceneBridge` headless adapter for `@intersign/core` with RAF polyfill so
  the Zustand store and Zundo temporal middleware run cleanly in Node.
- 19 MCP tools covering scene querying (`get_scene`, `get_node`,
  `describe_node`, `find_nodes`, `measure`), mutation (`apply_patch`,
  `create_level`, `create_wall`, `place_item`, `cut_opening`, `set_zone`,
  `duplicate_level`, `delete_node`), undo/redo (`undo`, `redo`), export
  (`export_json`, `export_glb`), validation (`validate_scene`,
  `check_collisions`), plus 2 vision tools (`analyze_floorplan_image`,
  `analyze_room_photo`) backed by MCP sampling.
- 4 MCP resources: `intersign://scene/current`,
  `intersign://scene/current/summary`, `intersign://catalog/items`, and
  `intersign://constraints/{levelId}`.
- 3 MCP prompts: `from_brief`, `iterate_on_feedback`, and
  `renovation_from_photos`.
- stdio and Streamable HTTP transports.
- `intersign-mcp` CLI binary with `--stdio`, `--http --port`, and `--scene`
  flags.
- Local `SqliteSceneStore` backed by built-in SQLite drivers (`bun:sqlite` in
  the MCP CLI, `node:sqlite` in the Next.js editor server), with WAL mode,
  transaction-scoped optimistic locking, revision rows, and shared
  `INTERSIGN_DATA_DIR` / `INTERSIGN_DB_PATH` configuration for MCP and the editor.

### Removed

- Supabase storage adapter, SQL migrations, and the `@supabase/supabase-js`
  runtime dependency.
- Committed MCP `test-reports/` development artifacts.
