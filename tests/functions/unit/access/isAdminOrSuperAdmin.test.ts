import { describe, it, expect } from 'vitest'
import {
  isAdminOrSuperAdmin,
  isSuperAdmin,
  isEventAdmin,
  isAdminOrSuperAdminOrEventAdmin,
} from '../../../../src/access/isAdminOrSuperAdmin'

describe('Admin access control functions', () => {
  describe('isAdminOrSuperAdmin', () => {
    it('should return true when user is admin', () => {
      const result = isAdminOrSuperAdmin({
        req: { user: { role: 'admin' } },
      })
      expect(result).toBe(true)
    })

    it('should return true when user is super-admin', () => {
      const result = isAdminOrSuperAdmin({
        req: { user: { role: 'super-admin' } },
      })
      expect(result).toBe(true)
    })

    it('should return false when user is event-admin', () => {
      const result = isAdminOrSuperAdmin({
        req: { user: { role: 'event-admin' } },
      })
      expect(result).toBe(false)
    })

    it('should return false when user is null', () => {
      const result = isAdminOrSuperAdmin({
        req: { user: null },
      })
      expect(result).toBe(false)
    })

    it('should return false when user has no role', () => {
      const result = isAdminOrSuperAdmin({
        req: { user: {} },
      })
      expect(result).toBe(false)
    })
  })

  describe('isSuperAdmin', () => {
    it('should return true when user is super-admin', () => {
      const result = isSuperAdmin({
        req: { user: { role: 'super-admin' } },
      })
      expect(result).toBe(true)
    })

    it('should return false when user is admin', () => {
      const result = isSuperAdmin({
        req: { user: { role: 'admin' } },
      })
      expect(result).toBe(false)
    })
  })

  describe('isEventAdmin', () => {
    it('should return true when user is event-admin', () => {
      const result = isEventAdmin({
        req: { user: { role: 'event-admin' } },
      })
      expect(result).toBe(true)
    })

    it('should return false when user is admin', () => {
      const result = isEventAdmin({
        req: { user: { role: 'admin' } },
      })
      expect(result).toBe(false)
    })
  })

  describe('isAdminOrSuperAdminOrEventAdmin', () => {
    it('should return true when user is admin', () => {
      const result = isAdminOrSuperAdminOrEventAdmin({
        req: { user: { role: 'admin' } },
      })
      expect(result).toBe(true)
    })

    it('should return true when user is super-admin', () => {
      const result = isAdminOrSuperAdminOrEventAdmin({
        req: { user: { role: 'super-admin' } },
      })
      expect(result).toBe(true)
    })

    it('should return true when user is event-admin', () => {
      const result = isAdminOrSuperAdminOrEventAdmin({
        req: { user: { role: 'event-admin' } },
      })
      expect(result).toBe(true)
    })

    it('should return false when user is null', () => {
      const result = isAdminOrSuperAdminOrEventAdmin({
        req: { user: null },
      })
      expect(result).toBe(false)
    })
  })
})
