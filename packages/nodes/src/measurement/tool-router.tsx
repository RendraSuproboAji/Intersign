'use client'

import { useEditor } from '@intersign/editor'
import SmartMeasurementTool from './smart-tool'
import MeasurementTool from './tool'

export default function MeasurementToolRouter() {
  const kind = useEditor((state) => state.toolDefaults.measurement?.kind)
  return kind === 'smart' ? <SmartMeasurementTool /> : <MeasurementTool />
}
