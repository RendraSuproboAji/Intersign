import type { ParametricDescriptor, ZoneNode } from '@intersign/core'

export const zoneParametrics: ParametricDescriptor<ZoneNode> = {
  groups: [],
  trailingSection: () => import('./quantities-panel'),
}
