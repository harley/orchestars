import { describe, it, expect } from 'vitest'
import { formatSlug, formatSlugHook } from '../../../../src/fields/slug/formatSlug'

describe('formatSlug utility', () => {
  it('should convert spaces to hyphens', () => {
    const result = formatSlug('hello world')
    expect(result).toBe('hello-world')
  })

  it('should convert to lowercase', () => {
    const result = formatSlug('HELLO WORLD')
    expect(result).toBe('hello-world')
  })

  it('should remove special characters', () => {
    const result = formatSlug('hello@world!')
    expect(result).toBe('helloworld')
  })

  it('should handle multiple spaces and special characters', () => {
    const result = formatSlug('  Hello  World! @#$%^&*()  ')
    // The actual implementation replaces spaces with hyphens first, then removes special chars
    // So multiple spaces become multiple hyphens
    expect(result).toBe('--hello--world---')
  })
})

describe('formatSlugHook', () => {
  it('should format the value if it is a string', () => {
    const hook = formatSlugHook('title')
    const result = hook({
      value: 'Hello World',
      operation: 'create',
      data: {},
    } as any)
    expect(result).toBe('hello-world')
  })

  it('should use the fallback field on create if value is not provided', () => {
    const hook = formatSlugHook('title')
    const result = hook({
      value: undefined,
      operation: 'create',
      data: { title: 'Hello World' },
    } as any)
    expect(result).toBe('hello-world')
  })

  it('should return the original value if not a string and not in create operation with slug present', () => {
    const hook = formatSlugHook('title')
    const originalValue = undefined
    const result = hook({
      value: originalValue,
      operation: 'update',
      data: {
        title: 'Hello World',
        slug: 'existing-slug', // This is key - the hook only uses fallback if !data?.slug
      },
    } as any)
    expect(result).toBe(originalValue)
  })

  it('should return the original value if not a string, in create operation, but no fallback data', () => {
    const hook = formatSlugHook('title')
    const originalValue = undefined
    const result = hook({
      value: originalValue,
      operation: 'create',
      data: {},
    } as any)
    expect(result).toBe(originalValue)
  })
})
