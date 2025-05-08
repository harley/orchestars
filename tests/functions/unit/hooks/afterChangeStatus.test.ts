import { describe, it, expect, vi, beforeEach } from 'vitest'
import { afterChangeStatus } from '../../../../src/collections/Orders/hooks/afterChangeStatus'
import { mockHookArgs } from '../../mocks/payload'
import { createOrderFactory } from '../../factories'

describe('afterChangeStatus hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update tickets to booked status when order status is completed', async () => {
    // Arrange
    const originalDoc = createOrderFactory({ id: 1 })

    const mockOrderItems = [
      { id: 101, event: { id: 201 } },
      { id: 102, event: { id: 202 } },
    ]

    const mockTickets = [
      { id: 301, status: 'pending' },
      { id: 302, status: 'pending' },
    ]

    const mockPayload = {
      find: vi.fn().mockResolvedValue({ docs: mockOrderItems }),
      update: vi.fn().mockResolvedValue({ docs: mockTickets }),
    }

    const args = mockHookArgs({
      value: 'completed',
      originalDoc,
      req: {
        payload: mockPayload,
      },
    })

    // Act
    await afterChangeStatus(args as any)

    // Assert
    expect(mockPayload.find).toHaveBeenCalledWith({
      collection: 'orderItems',
      where: { order: { equals: originalDoc.id } },
      limit: 100,
    })

    expect(mockPayload.update).toHaveBeenCalledWith({
      collection: 'tickets',
      where: {
        or: [
          { orderItem: { equals: 101 }, event: { equals: 201 } },
          { orderItem: { equals: 102 }, event: { equals: 202 } },
        ],
      },
      data: {
        status: 'booked',
      },
    })
  })

  it('should not update tickets if order status is not completed', async () => {
    // Arrange
    const originalDoc = createOrderFactory({ id: 1 })

    const mockPayload = {
      find: vi.fn(),
      update: vi.fn(),
    }

    const args = mockHookArgs({
      value: 'pending',
      originalDoc,
      req: {
        payload: mockPayload,
      },
    })

    // Act
    await afterChangeStatus(args as any)

    // Assert
    expect(mockPayload.find).not.toHaveBeenCalled()
    expect(mockPayload.update).not.toHaveBeenCalled()
  })

  it('should handle case when no order items are found', async () => {
    // Arrange
    const originalDoc = createOrderFactory({ id: 1 })

    const mockPayload = {
      find: vi.fn().mockResolvedValue({ docs: [] }),
      update: vi.fn(),
    }

    const args = mockHookArgs({
      value: 'completed',
      originalDoc,
      req: {
        payload: mockPayload,
      },
    })

    // Act
    await afterChangeStatus(args as any)

    // Assert
    expect(mockPayload.find).toHaveBeenCalled()
    expect(mockPayload.update).not.toHaveBeenCalled()
  })
})
