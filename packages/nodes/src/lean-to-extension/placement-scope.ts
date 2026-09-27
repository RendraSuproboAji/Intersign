import { type AnyNode, type AnyNodeId, findLevelAncestorId } from '@intersign/core'

export function isLeanToHostOnLevel(
  host: AnyNode,
  nodes: Record<AnyNodeId, AnyNode>,
  activeLevelId: AnyNodeId,
): boolean {
  return findLevelAncestorId(host.id as AnyNodeId, nodes) === activeLevelId
}
