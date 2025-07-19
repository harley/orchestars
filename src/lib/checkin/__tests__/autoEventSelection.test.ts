import { describe, test, expect, vi, beforeEach } from 'vitest'
import { 
  getTodayInVietnam, 
  findTodaysEvents, 
  attemptAutoSelection,
  getAutoSelectionFailureMessage,
  type EventWithSchedules 
} from '../autoEventSelection'

// Mock date-fns-tz
vi.mock('date-fns-tz', () => ({
  toZonedTime: vi.fn((date) => date),
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    if (formatStr === 'yyyy-MM-dd') {
      return '2024-01-15' // Mock today's date
    }
    return date.toISOString()
  }),
}))

describe('Auto Event Selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTodayInVietnam', () => {
    test('returns today\'s date in YYYY-MM-DD format', () => {
      const result = getTodayInVietnam()
      expect(result).toBe('2024-01-15')
    })
  })

  describe('findTodaysEvents', () => {
    const mockEvents: EventWithSchedules[] = [
      {
        id: '1',
        title: 'Event Today',
        status: 'active',
        schedules: [
          {
            id: 'schedule1',
            date: '2024-01-15T10:00:00Z',
            details: [{ id: 'detail1', time: '10:00', name: 'Show', description: 'Main show' }]
          }
        ]
      },
      {
        id: '2',
        title: 'Event Tomorrow',
        status: 'active',
        schedules: [
          {
            id: 'schedule2',
            date: '2024-01-16T10:00:00Z',
            details: [{ id: 'detail2', time: '10:00', name: 'Show', description: 'Main show' }]
          }
        ]
      },
      {
        id: '3',
        title: 'Inactive Event Today',
        status: 'inactive',
        schedules: [
          {
            id: 'schedule3',
            date: '2024-01-15T10:00:00Z',
            details: [{ id: 'detail3', time: '10:00', name: 'Show', description: 'Main show' }]
          }
        ]
      }
    ]

    test('finds events with schedules for today', () => {
      const result = findTodaysEvents(mockEvents)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
      expect(result[0].title).toBe('Event Today')
    })

    test('excludes inactive events', () => {
      const result = findTodaysEvents(mockEvents)
      expect(result.find(e => e.id === '3')).toBeUndefined()
    })

    test('excludes events without today\'s schedule', () => {
      const result = findTodaysEvents(mockEvents)
      expect(result.find(e => e.id === '2')).toBeUndefined()
    })

    test('handles events without schedules', () => {
      const eventsWithoutSchedules: EventWithSchedules[] = [
        {
          id: '4',
          title: 'Event Without Schedules',
          status: 'active'
        }
      ]
      const result = findTodaysEvents(eventsWithoutSchedules)
      expect(result).toHaveLength(0)
    })

    test('handles invalid schedule dates gracefully', () => {
      const eventsWithInvalidDates: EventWithSchedules[] = [
        {
          id: '5',
          title: 'Event With Invalid Date',
          status: 'active',
          schedules: [
            {
              id: 'schedule5',
              date: 'invalid-date',
              details: []
            }
          ]
        }
      ]
      const result = findTodaysEvents(eventsWithInvalidDates)
      expect(result).toHaveLength(0)
    })
  })

  describe('attemptAutoSelection', () => {
    test('succeeds when exactly one event has today\'s schedule', async () => {
      const mockEvents: EventWithSchedules[] = [
        {
          id: '1',
          title: 'Event Today',
          status: 'active',
          schedules: [
            {
              id: 'schedule1',
              date: '2024-01-15T10:00:00Z',
              details: [{ id: 'detail1', time: '10:00', name: 'Show', description: 'Main show' }]
            }
          ]
        }
      ]

      const result = await attemptAutoSelection(mockEvents)
      
      expect(result.success).toBe(true)
      expect(result.eventId).toBe('1')
      expect(result.scheduleId).toBe('schedule1')
      expect(result.event?.title).toBe('Event Today')
    })

    test('fails when no events have today\'s schedule', async () => {
      const mockEvents: EventWithSchedules[] = [
        {
          id: '1',
          title: 'Event Tomorrow',
          status: 'active',
          schedules: [
            {
              id: 'schedule1',
              date: '2024-01-16T10:00:00Z',
              details: []
            }
          ]
        }
      ]

      const result = await attemptAutoSelection(mockEvents)
      
      expect(result.success).toBe(false)
      expect(result.reason).toBe('no_events_today')
    })

    test('fails when multiple events have today\'s schedule', async () => {
      const mockEvents: EventWithSchedules[] = [
        {
          id: '1',
          title: 'Event Today 1',
          status: 'active',
          schedules: [
            {
              id: 'schedule1',
              date: '2024-01-15T10:00:00Z',
              details: []
            }
          ]
        },
        {
          id: '2',
          title: 'Event Today 2',
          status: 'active',
          schedules: [
            {
              id: 'schedule2',
              date: '2024-01-15T14:00:00Z',
              details: []
            }
          ]
        }
      ]

      const result = await attemptAutoSelection(mockEvents)
      
      expect(result.success).toBe(false)
      expect(result.reason).toBe('multiple_events_today')
    })

    test('handles errors gracefully', async () => {
      // Mock an error in findTodaysEvents by passing invalid data
      const result = await attemptAutoSelection(null as any)
      
      expect(result.success).toBe(false)
      expect(result.reason).toBe('fetch_error')
    })
  })

  describe('getAutoSelectionFailureMessage', () => {
    test('returns appropriate message for no events today', () => {
      const message = getAutoSelectionFailureMessage('no_events_today')
      expect(message).toBe('No events scheduled for today')
    })

    test('returns appropriate message for multiple events', () => {
      const message = getAutoSelectionFailureMessage('multiple_events_today')
      expect(message).toBe('Multiple events available today - please select one')
    })

    test('returns appropriate message for no schedule today', () => {
      const message = getAutoSelectionFailureMessage('no_schedule_today')
      expect(message).toBe('Event found but no schedule for today')
    })

    test('returns appropriate message for fetch error', () => {
      const message = getAutoSelectionFailureMessage('fetch_error')
      expect(message).toBe('Unable to load event data')
    })

    test('returns default message for unknown reason', () => {
      const message = getAutoSelectionFailureMessage('unknown_reason')
      expect(message).toBe('Auto-selection not available')
    })
  })
})