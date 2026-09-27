export function GET() {
  return Response.json({
    status: 'ok',
    app: 'editor',
    version: process.env.INTERSIGN_RUNTIME_VERSION ?? null,
    instanceId: process.env.INTERSIGN_INSTANCE_ID ?? null,
    timestamp: new Date().toISOString(),
  })
}
