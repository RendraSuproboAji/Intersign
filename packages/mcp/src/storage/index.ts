import type { SceneStore } from './types'

export * from './slug'
export * from './sqlite-scene-store'
export * from './types'

/**
 * Factory for Intersign's local-first scene store.
 *
 * The store is backed by the runtime's built-in SQLite driver. By default it
 * writes to `~/.intersign/data/intersign.db`; set `INTERSIGN_DB_PATH` for an exact file
 * path or `INTERSIGN_DATA_DIR` for a directory containing `intersign.db`.
 */
export async function createSceneStore(env?: NodeJS.ProcessEnv): Promise<SceneStore> {
  const mod = await import('./sqlite-scene-store')
  return new mod.SqliteSceneStore({ env })
}
