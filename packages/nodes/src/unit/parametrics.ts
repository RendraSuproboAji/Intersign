import type { ParametricDescriptor, UnitNode } from '@intersign/core'

export const unitParametrics: ParametricDescriptor<UnitNode> = {
  groups: [],
  customPanel: () => import('./unit-panel'),
}
