import type { ConstructionDimensionNode, ParametricDescriptor } from '@intersign/core'

export const constructionDimensionParametrics: ParametricDescriptor<ConstructionDimensionNode> = {
  groups: [],
  customPanel: () => import('./panel'),
}
