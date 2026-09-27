import { describe, expect, test } from 'bun:test'
import { isPathInside } from './path-containment'

describe('isPathInside', () => {
  test.each([
    [
      'windows separators',
      'C:\\repo\\skills\\intersign-3d',
      'C:\\repo\\skills\\intersign-3d\\a.md',
    ],
    ['posix separators', '/repo/skills/intersign-3d', '/repo/skills/intersign-3d/a.md'],
    ['mixed separators', 'C:\\repo\\skills\\intersign-3d', 'C:/repo/skills/intersign-3d/a.md'],
    ['nested directory', '/repo/skills/intersign-3d', '/repo/skills/intersign-3d/examples/a.md'],
    ['drive root', 'C:\\', 'C:\\a.md'],
    ['trailing separator on the parent', '/repo/skills/', '/repo/skills/a.md'],
  ])('accepts a target inside the parent with %s', (_label, parent, target) => {
    expect(isPathInside(parent, target)).toBe(true)
  })

  test.each([
    ['a sibling sharing the name prefix', '/repo/skills', '/repo/skills-extra/a.md'],
    ['a parent directory', '/repo/skills/intersign-3d', '/repo/skills/a.md'],
    ['an unrelated directory', '/repo/skills', '/repo/other/a.md'],
    ['the parent itself', '/repo/skills', '/repo/skills'],
    ['a traversal out of the parent', '/repo/skills', '/repo/other/../skills-evil/a.md'],
    ['a different drive', 'C:\\repo\\skills', 'D:\\repo\\skills\\a.md'],
  ])('rejects %s', (_label, parent, target) => {
    expect(isPathInside(parent, target)).toBe(false)
  })
})
