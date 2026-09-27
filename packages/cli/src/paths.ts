import os from 'node:os'
import path from 'node:path'

export interface IntersignPaths {
  root: string
  runtime: string
  data: string
  plugins: string
  run: string
  logs: string
  tmp: string
  state: string
  mcpState: string
  currentRuntime: string
  pluginLock: string
  database: string
  editorLog: string
  mcpToken: string
}

export function resolveIntersignPaths(
  environment: NodeJS.ProcessEnv = process.env,
): IntersignPaths {
  const root = path.resolve(environment.INTERSIGN_HOME || path.join(os.homedir(), '.intersign'))
  return {
    root,
    runtime: path.join(root, 'runtime'),
    data: path.join(root, 'data'),
    plugins: path.join(root, 'plugins'),
    run: path.join(root, 'run'),
    logs: path.join(root, 'logs'),
    tmp: path.join(root, 'tmp'),
    state: path.join(root, 'run/editor.json'),
    mcpState: path.join(root, 'run/mcp.json'),
    currentRuntime: path.join(root, 'run/current-runtime.json'),
    pluginLock: path.join(root, 'intersign.plugins.lock'),
    database: path.join(root, 'data/intersign.db'),
    editorLog: path.join(root, 'logs/editor.log'),
    mcpToken: path.join(root, 'run/mcp-token'),
  }
}
