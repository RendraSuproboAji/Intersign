import { expect, test } from 'bun:test'
import { fitAsset, guessUnit, rehostItemUrls, toCatalogItem } from './custom-items'

const table = {
  min: [-60, 0, -30] as [number, number, number],
  max: [60, 75, 30] as [number, number, number],
}

test('guesses the model units from its size', () => {
  expect(guessUnit([1.2, 0.75, 0.6])).toBe('m')
  expect(guessUnit([120, 75, 60])).toBe('cm')
  expect(guessUnit([1200, 750, 600])).toBe('cm')
  expect(guessUnit([2400, 750, 600])).toBe('mm')
})

test('fits a centimetre model on the floor, centred', () => {
  expect(fitAsset(table, 'cm', 'floor')).toEqual({
    dimensions: [1.2, 0.75, 0.6],
    offset: [0, 0, 0],
    scale: [0.01, 0.01, 0.01],
  })
  const offCentre = {
    min: [10, 5, 20] as [number, number, number],
    max: [30, 25, 60] as [number, number, number],
  }
  expect(fitAsset(offCentre, 'm', 'floor').offset).toEqual([-20, -5, -40])
})

test('wall pieces rest their back against the wall', () => {
  const shelf = {
    min: [-0.4, 0.1, -0.15] as [number, number, number],
    max: [0.4, 0.3, 0.15] as [number, number, number],
  }
  expect(fitAsset(shelf, 'm', 'wall').offset).toEqual([0, -0.1, 0.15])
})

test('turns a stored record into an Items-tab tile', () => {
  const item = toCatalogItem(
    {
      id: '0123456789abcdef',
      createdAt: '2026-10-03T00:00:00.000Z',
      name: 'Oak table',
      category: 'furniture',
      placement: 'wall',
      dimensions: [1.2, 0.75, 0.6],
      offset: [0, 0, 0],
      scale: [0.01, 0.01, 0.01],
    },
    'https://intersign.example',
  )
  expect(item).toMatchObject({
    id: 'custom-0123456789abcdef',
    source: 'mine',
    attachTo: 'wall-side',
    src: 'https://intersign.example/api/items/0123456789abcdef/model.glb',
    thumbnail: 'https://intersign.example/api/items/0123456789abcdef/thumbnail.png',
  })
})

test('re-points placed uploads at the current server, leaving other items alone', () => {
  const graph = {
    nodes: {
      a: {
        type: 'item',
        asset: {
          src: 'http://localhost:3002/api/items/0123456789abcdef/model.glb',
          thumbnail: 'http://localhost:3002/api/items/0123456789abcdef/thumbnail.png',
        },
      },
      b: {
        type: 'item',
        asset: { src: 'https://cdn.example/models/chair.glb', thumbnail: 'x.png' },
      },
      c: { type: 'wall' },
    },
    rootNodeIds: ['a'],
  }
  const rehosted = rehostItemUrls(graph, 'https://intersign.example')
  expect(rehosted.nodes.a).toEqual({
    type: 'item',
    asset: {
      src: 'https://intersign.example/api/items/0123456789abcdef/model.glb',
      thumbnail: 'https://intersign.example/api/items/0123456789abcdef/thumbnail.png',
    },
  })
  expect(rehosted.nodes.b).toBe(graph.nodes.b)
  expect(rehosted.rootNodeIds).toBe(graph.rootNodeIds)
  // Nothing to change: the same graph comes back.
  expect(rehostItemUrls(rehosted, 'https://intersign.example')).toBe(rehosted)
})
