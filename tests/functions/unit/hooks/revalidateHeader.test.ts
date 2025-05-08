import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidateHeader } from '../../../../src/Header/hooks/revalidateHeader'
import { mockHookArgs } from '../../mocks/payload'

// Mock the next/cache module
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

// Import the mocked function
import { revalidateTag } from 'next/cache'

describe('revalidateHeader hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should revalidate the header tag when context.disableRevalidate is not set', () => {
    // Arrange
    const doc = { id: 1, title: 'Test Header' }
    const args = mockHookArgs({
      doc,
      req: {
        payload: {
          logger: {
            info: vi.fn(),
          },
        },
        context: {},
      },
    })

    // Act
    const result = revalidateHeader(args as any)

    // Assert
    expect(revalidateTag).toHaveBeenCalledWith('global_header')
    expect(args.req.payload.logger.info).toHaveBeenCalledWith('Revalidating header')
    expect(result).toBe(doc)
  })

  it('should not revalidate the header tag when context.disableRevalidate is true', () => {
    // Arrange
    const doc = { id: 1, title: 'Test Header' }
    const args = mockHookArgs({
      doc,
      req: {
        payload: {
          logger: {
            info: vi.fn(),
          },
        },
        context: {
          disableRevalidate: true,
        },
      },
    })

    // Act
    const result = revalidateHeader(args as any)

    // Assert
    expect(revalidateTag).not.toHaveBeenCalled()
    expect(args.req.payload.logger.info).not.toHaveBeenCalled()
    expect(result).toBe(doc)
  })
})
