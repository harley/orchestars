import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getCachedEventSelection,
  setCachedEventSelection,
  clearExpiredCache,
  markAsManualSelection,
  isCurrentSelectionAutoSelected,
  clearEventSelectionCache,
  isCacheValid
} from '../eventSelectionCache'

// Mock the autoEventSelection module
vi.mock('../autoEventSelection', () => ({
  getTodayInVietnam: vi.fn(() => '2024-01-15')
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Event Selection Cache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('isCacheValid', () => {
    test('returns true when cache is valid for today', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        switch (key) {
          case 'autoSelectionDate': return '2024-01-15'
          case 'selectedEventId': return '1'
          case 'selectedScheduleId': return 'schedule1'
          default: return null
        }
      })

      const result = isCacheValid()
      expect(result).toBe(true)
    })

    test('returns false when cache is for different date', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        switch (key) {
          case 'autoSelectionDate': return '2024-01-14'
          case 'selectedEventId': return '1'
          case 'selectedScheduleId': return 'schedule1'
          default: return null
        }
      })

      const result = isCacheValid()
      expect(result).toBe(false)
    })

    test('returns false when required cache data is missing', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        switch (key) {
          case 'autoSelectionDate': return '2024-01-15'
          case 'selectedEventId': return null
          case 'selectedScheduleId': return 'schedule1'
          default: return null
        }
      })

      const result = isCacheValid()
      expect(result).toBe(false)
    })
  })

  describe('getCachedEventSelection', () => {
    test('returns cached selection when valid', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        switch (key) {
          case 'autoSelectionDate': return '2024-01-15'
          case 'selectedEventId': return '1'
          case 'selectedScheduleId': return 'schedule1'
          case 'isAutoSelected': return 'true'
          case 'eventTitle': return 'Test Event'
          case 'eventLocation': return 'Test Location'
          case 'eventScheduleDate': return '15-01-2024'
          case 'eventScheduleTime': return '10:00'
          default: return null
        }
      })

      const result = getCachedEventSelection()
      
      expect(result).toEqual({
        eventId: '1',
        scheduleId: 'schedule1',
        isAutoSelected: true,
        eventTitle: 'Test Event',
        eventLocation: 'Test Location',
        scheduleDate: '15-01-2024',
        scheduleTime: '10:00'
      })
    })

    test('returns null when cache is invalid', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        switch (key) {
          case 'autoSelectionDate': return '2024-01-14' // Different date
          case 'selectedEventId': return '1'
          case 'selectedScheduleId': return 'schedule1'
          default: return null
        }
      })

      const result = getCachedEventSelection()
      expect(result).toBeNull()
    })

    test('returns null when required data is missing', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        switch (key) {
          case 'autoSelectionDate': return '2024-01-15'
          case 'selectedEventId': return null // Missing
          case 'selectedScheduleId': return 'schedule1'
          default: return null
        }
      })

      const result = getCachedEventSelection()
      expect(result).toBeNull()
    })
  })

  describe('setCachedEventSelection', () => {
    test('stores core selection data', () => {
      setCachedEventSelection('1', 'schedule1', true)

      expect(localStorageMock.setItem).toHaveBeenCalledWith('selectedEventId', '1')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('selectedScheduleId', 'schedule1')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('isAutoSelected', 'true')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('autoSelectionDate', '2024-01-15')
    })

    test('stores additional event data when provided', () => {
      setCachedEventSelection('1', 'schedule1', true, {
        title: 'Test Event',
        location: 'Test Location',
        scheduleDate: '15-01-2024',
        scheduleTime: '10:00'
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith('eventTitle', 'Test Event')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('eventLocation', 'Test Location')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('eventScheduleDate', '15-01-2024')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('eventScheduleTime', '10:00')
    })

    test('does not store undefined event data', () => {
      setCachedEventSelection('1', 'schedule1', false, {
        title: undefined,
        location: 'Test Location'
      })

      expect(localStorageMock.setItem).not.toHaveBeenCalledWith('eventTitle', undefined)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('eventLocation', 'Test Location')
    })
  })

  describe('clearExpiredCache', () => {
    test('clears cache when date is different', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'autoSelectionDate') return '2024-01-14' // Yesterday
        return null
      })

      clearExpiredCache()

      const expectedKeys = [
        'selectedEventId',
        'selectedScheduleId',
        'isAutoSelected',
        'autoSelectionDate',
        'eventTitle',
        'eventLocation',
        'eventScheduleDate',
        'eventScheduleTime'
      ]

      expectedKeys.forEach(key => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(key)
      })
    })

    test('does not clear cache when date is today', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'autoSelectionDate') return '2024-01-15' // Today
        return null
      })

      clearExpiredCache()

      expect(localStorageMock.removeItem).not.toHaveBeenCalled()
    })

    test('does not clear cache when no cached date exists', () => {
      localStorageMock.getItem.mockReturnValue(null)

      clearExpiredCache()

      expect(localStorageMock.removeItem).not.toHaveBeenCalled()
    })
  })

  describe('markAsManualSelection', () => {
    test('sets isAutoSelected to false', () => {
      markAsManualSelection()

      expect(localStorageMock.setItem).toHaveBeenCalledWith('isAutoSelected', 'false')
    })
  })

  describe('isCurrentSelectionAutoSelected', () => {
    test('returns true when isAutoSelected is true', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'isAutoSelected') return 'true'
        return null
      })

      const result = isCurrentSelectionAutoSelected()
      expect(result).toBe(true)
    })

    test('returns false when isAutoSelected is false', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'isAutoSelected') return 'false'
        return null
      })

      const result = isCurrentSelectionAutoSelected()
      expect(result).toBe(false)
    })

    test('returns false when isAutoSelected is not set', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = isCurrentSelectionAutoSelected()
      expect(result).toBe(false)
    })
  })

  describe('clearEventSelectionCache', () => {
    test('removes all cache keys', () => {
      clearEventSelectionCache()

      const expectedKeys = [
        'selectedEventId',
        'selectedScheduleId',
        'isAutoSelected',
        'autoSelectionDate',
        'eventTitle',
        'eventLocation',
        'eventScheduleDate',
        'eventScheduleTime'
      ]

      expectedKeys.forEach(key => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(key)
      })
    })
  })
})