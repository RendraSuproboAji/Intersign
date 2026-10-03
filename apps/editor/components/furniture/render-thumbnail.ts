'use client'

import {
  AmbientLight,
  Box3,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  Sphere,
  Vector3,
  WebGLRenderer,
} from 'three'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const SIZE = 256

/** A 3/4 view of the model as a transparent PNG, like the catalog thumbnails. */
export async function renderThumbnail(glb: Uint8Array): Promise<Blob> {
  const loader = new GLTFLoader()
  const draco = new DRACOLoader()
  // Same decoders as the engine's item loader (@pascal-app/nodes item renderer).
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/')
  loader.setDRACOLoader(draco)
  loader.setMeshoptDecoder(MeshoptDecoder)
  const buffer = glb.buffer.slice(glb.byteOffset, glb.byteOffset + glb.byteLength) as ArrayBuffer
  const gltf = await loader.parseAsync(buffer, '')
  draco.dispose()

  const scene = new Scene()
  scene.add(gltf.scene)
  scene.add(new AmbientLight(0xffffff, 1.2))
  const sun = new DirectionalLight(0xffffff, 2.2)
  sun.position.set(2, 4, 3)
  scene.add(sun)

  const sphere = new Box3().setFromObject(gltf.scene).getBoundingSphere(new Sphere())
  const camera = new PerspectiveCamera(30, 1, sphere.radius / 100, sphere.radius * 100)
  const distance = sphere.radius / Math.sin((camera.fov * Math.PI) / 360)
  camera.position
    .copy(sphere.center)
    .add(new Vector3(0.8, 0.6, 1).normalize().multiplyScalar(distance))
  camera.lookAt(sphere.center)

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
  try {
    renderer.setSize(SIZE, SIZE, false)
    renderer.setClearColor(0x000000, 0)
    renderer.render(scene, camera)
    return await toPng(renderer.domElement)
  } finally {
    renderer.dispose()
    renderer.forceContextLoss()
  }
}

/** Shown when the model can't be rendered here (e.g. the decoders are unreachable). */
export function placeholderThumbnail(name: string): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#e7e2d8'
  ctx.fillRect(0, 0, SIZE, SIZE)
  ctx.fillStyle = '#1f4d2e'
  ctx.font = 'bold 96px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(name.trim().slice(0, 2).toUpperCase() || '?', SIZE / 2, SIZE / 2)
  return toPng(canvas)
}

function toPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Thumbnail failed'))),
      'image/png',
    ),
  )
}
