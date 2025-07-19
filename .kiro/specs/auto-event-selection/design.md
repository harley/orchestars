# Design Document

## Overview

The **Auto Event Selection** feature enhances the paper check-in workflow by implementing intelligent event detection based on the current date. The system will automatically identify and select events with schedules matching today's date, streamlining the check-in process while maintaining full backward compatibility with manual event selection.

This design leverages the existing event structure and check-in infrastructure, adding a new auto-selection layer that operates transparently with the current paper check-in implementation.

## Architecture

### High-Level Flow
1. **Auto-Selection Check**: When accessing paper check-in, check for today's events
2. **Event Matching**: Find events with schedules matching current date (Vietnam timezone)
3. **Prioritization**: If multiple events found, apply prioritization logic
4. **Auto-Navigation**: Automatically populate event/schedule context and show paper interface
5. **Manual Override**: Provide clear path to manual event selection when needed

### Integration Points
- **Paper Check-in Page**: Enhanced to perform auto-selection before requiring manual selection
- **Event Selection Page**: Maintains existing functionality with enhanced routing context
- **Event Data API**: Leverages existing event fetching with date-based filtering
- **LocalStorage**: Enhanced to track auto-selection vs manual selection state

## Components and Interfaces

### Enhanced Paper Check-in Component

**Modified File:** `src/app/(checkin)/checkin/paper/page.client.tsx`

**New Auto-Selection Logic:**
```typescript
interface AutoSelectionState {
  isAutoSelected: boolean
  autoSelectionAttempted: boolean
  availableEventsCount: number
  selectedDate: string
  fallbackReason?: string
}

interface EventWithSchedules {
  id: string
  title: string
  schedules: Array<{
    id: string
    date: string
    details: Array<{
      time: string
      name: string
    }>
  }>
  startDatetime?: string
  status?: string
}
```

**Auto-Selection Hook:**
```typescript
const useAutoEventSelection = () => {
  const [autoState, setAutoState] = useState<AutoSelectionState>({
    isAutoSelected: false,
    autoSelectionAttempted: false,
    availableEventsCount: 0,
    selectedDate: '',
  })

  const attemptAutoSelection = async (): Promise<{
    eventId: string | null
    scheduleId: string | null
    eventData: EventWithSchedules | null
  }> => {
    // Implementation details below
  }

  return { autoState, attemptAutoSelection }
}
```

### Auto-Selection Algorithm

**Simplified Date Matching Logic:**
```typescript
const getTodayInVietnam = (): string => {
  const now = new Date()
  const vietnamTime = toZonedTime(now, 'Asia/Ho_Chi_Minh')
  return format(vietnamTime, 'yyyy-MM-dd')
}

const findTodaysEvents = (events: EventWithSchedules[]): EventWithSchedules[] => {
  const today = getTodayInVietnam()
  
  return events.filter(event => {
    // Only consider active/published events
    if (event.status && !['active', 'published'].includes(event.status)) {
      return false
    }
    
    // Check if any schedule matches today
    // Note: schedules is an array field in the event document
    return event.schedules?.some(schedule => {
      if (!schedule.date) return false
      
      const scheduleDate = format(new Date(schedule.date), 'yyyy-MM-dd')
      return scheduleDate === today
    })
  })
}

const attemptAutoSelection = async (events: EventWithSchedules[]): Promise<{
  success: boolean
  eventId?: string
  scheduleId?: string
  event?: EventWithSchedules
  schedule?: Schedule
  reason?: string
}> => {
  const todaysEvents = findTodaysEvents(events)
  
  if (todaysEvents.length === 0) {
    return { success: false, reason: 'no_events_today' }
  }
  
  if (todaysEvents.length > 1) {
    return { success: false, reason: 'multiple_events_today' }
  }
  
  // Exactly one event found - auto-select it
  const event = todaysEvents[0]
  const today = getTodayInVietnam()
  
  // Find today's schedule within the event
  const todaysSchedule = event.schedules?.find(schedule => {
    if (!schedule.date) return false
    const scheduleDate = format(new Date(schedule.date), 'yyyy-MM-dd')
    return scheduleDate === today
  })
  
  if (!todaysSchedule) {
    return { success: false, reason: 'no_schedule_today' }
  }
  
  return {
    success: true,
    eventId: event.id,
    scheduleId: todaysSchedule.id,
    event,
    schedule: todaysSchedule
  }
}
```

### Enhanced Event Data Fetching

**New API Endpoint:** `src/app/api/checkin-app/todays-events/route.ts`
```typescript
export async function GET() {
  try {
    const today = getTodayInVietnam()
    
    const events = await payload.find({
      collection: 'events',
      where: {
        and: [
          {
            'schedules.date': {
              greater_than_equal: `${today}T00:00:00.000Z`,
              less_than: `${today}T23:59:59.999Z`
            }
          },
          {
            status: {
              in: ['active', 'published']
            }
          }
        ]
      },
      limit: 50,
      sort: '-createdAt'
    })
    
    return Response.json({
      events: events.docs,
      count: events.totalDocs,
      date: today
    })
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch today\'s events' },
      { status: 500 }
    )
  }
}
```

**Alternative: Client-side Filtering**
If API changes are not preferred, implement client-side filtering using existing event data:

```typescript
const fetchTodaysEvents = async (): Promise<EventWithSchedules[]> => {
  // Reuse existing events endpoint
  const response = await fetch('/api/checkin-app/events')
  const { events } = await response.json()
  
  // Filter client-side
  return findTodaysEvents(events)
}
```

## Data Models

### Enhanced LocalStorage Schema

**Current Schema:**
```typescript
localStorage.setItem('selectedEventId', eventId)
localStorage.setItem('selectedScheduleId', scheduleId)
localStorage.setItem('eventTitle', title)
localStorage.setItem('eventLocation', location)
localStorage.setItem('eventScheduleDate', date)
localStorage.setItem('eventScheduleTime', time)
```

**Enhanced Schema:**
```typescript
// Add auto-selection tracking
localStorage.setItem('isAutoSelected', 'true|false')
localStorage.setItem('autoSelectionDate', 'yyyy-mm-dd')
localStorage.setItem('manualOverride', 'true|false')
localStorage.setItem('availableEventsCount', 'number')

// Enhanced selection metadata
const selectionMetadata = {
  selectedAt: new Date().toISOString(),
  selectionMethod: 'auto' | 'manual',
  availableAlternatives: number,
  autoSelectionReason?: string
}
localStorage.setItem('selectionMetadata', JSON.stringify(selectionMetadata))
```

### Auto-Selection State Management

**State Interface:**
```typescript
interface AutoSelectionContext {
  // Current state
  isAutoSelected: boolean
  autoSelectionDate: string | null
  manualOverride: boolean
  
  // Available options
  todaysEvents: EventWithSchedules[]
  selectedEvent: EventWithSchedules | null
  selectedSchedule: Schedule | null
  
  // UI state
  showAlternatives: boolean
  isLoading: boolean
  error: string | null
}
```

## Error Handling

### Auto-Selection Failure Scenarios

**No Events Today:**
```typescript
if (todaysEvents.length === 0) {
  setAutoState({
    isAutoSelected: false,
    autoSelectionAttempted: true,
    availableEventsCount: 0,
    selectedDate: today,
    fallbackReason: 'no_events_today'
  })
  // Redirect to manual selection
  router.push('/checkin/events?mode=paper&reason=no_events_today')
}
```

**Multiple Events Available:**
```typescript
if (todaysEvents.length > 1) {
  setAutoState({
    isAutoSelected: false,
    autoSelectionAttempted: true,
    availableEventsCount: todaysEvents.length,
    selectedDate: today,
    fallbackReason: 'multiple_events_today'
  })
  // Redirect to manual selection - let user choose
  router.push('/checkin/events?mode=paper&reason=multiple_events_today')
}
```

**API/Network Errors:**
```typescript
try {
  const todaysEvents = await fetchTodaysEvents()
  // ... auto-selection logic
} catch (error) {
  console.error('Auto-selection failed:', error)
  setAutoState({
    isAutoSelected: false,
    autoSelectionAttempted: true,
    availableEventsCount: 0,
    selectedDate: today,
    fallbackReason: 'fetch_error'
  })
  // Fall back to manual selection
  router.push('/checkin/events?mode=paper&reason=fetch_error')
}
```

### User Experience for Edge Cases

**Date/Time Issues:**
- Display current date/time prominently
- Allow manual date override if system time is suspected to be wrong
- Provide clear feedback about timezone assumptions

**Event Data Issues:**
- Show loading states during auto-selection
- Provide clear error messages for data issues
- Always offer manual selection as fallback

## Testing Strategy

### Unit Tests

**Auto-Selection Logic:**
```typescript
describe('Auto Event Selection', () => {
  test('selects event with today\'s schedule', () => {
    const events = [mockEventWithTodaysSchedule, mockEventWithTomorrowsSchedule]
    const result = findTodaysEvents(events)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(mockEventWithTodaysSchedule.id)
  })
  
  test('prioritizes earlier event times', () => {
    const events = [mockEvent10AM, mockEvent8AM]
    const result = prioritizeEvents(events)
    expect(result.id).toBe(mockEvent8AM.id)
  })
  
  test('handles timezone conversion correctly', () => {
    const vietnamToday = getTodayInVietnam()
    expect(vietnamToday).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
```

**LocalStorage Management:**
```typescript
describe('Selection State Management', () => {
  test('preserves manual selection over auto-selection', () => {
    // Set manual selection
    setManualSelection(eventId, scheduleId)
    
    // Attempt auto-selection
    const result = shouldAttemptAutoSelection()
    expect(result).toBe(false)
  })
  
  test('resets auto-selection on new day', () => {
    // Set auto-selection for yesterday
    setAutoSelection(eventId, scheduleId, 'yesterday')
    
    // Check if should auto-select today
    const result = shouldAttemptAutoSelection()
    expect(result).toBe(true)
  })
})
```

### Integration Tests

**Paper Check-in Flow:**
```typescript
describe('Paper Check-in with Auto-Selection', () => {
  test('auto-selects today\'s event and shows paper interface', async () => {
    // Mock today's event
    mockTodaysEvent()
    
    // Navigate to paper check-in
    render(<PaperCheckinPage />)
    
    // Should auto-select and show paper interface
    await waitFor(() => {
      expect(screen.getByText('Paper Check-In')).toBeInTheDocument()
      expect(screen.getByText('Auto-selected')).toBeInTheDocument()
    })
  })
  
  test('redirects to manual selection when no events today', async () => {
    // Mock no events today
    mockNoEventsToday()
    
    // Navigate to paper check-in
    const { router } = render(<PaperCheckinPage />)
    
    // Should redirect to event selection
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/checkin/events?mode=paper&reason=no_events_today')
    })
  })
})
```

### User Acceptance Tests

**Happy Path:**
1. Admin navigates to paper check-in
2. System auto-selects today's event
3. Paper interface loads immediately
4. Admin can check in attendees normally
5. "Change event" link is visible and functional

**Edge Cases:**
1. Multiple events today → First event selected, alternatives indicated
2. No events today → Redirected to manual selection with clear message
3. Network error → Graceful fallback to manual selection
4. Manual override → Respects manual selection over auto-selection

## Security Considerations

### Input Validation
- Validate date formats and ranges
- Sanitize event IDs and schedule IDs
- Prevent injection attacks in date queries

### Access Control
- Maintain existing admin authentication requirements
- Ensure auto-selection doesn't bypass security checks
- Validate event access permissions

### Data Privacy
- Don't expose sensitive event data in client-side auto-selection
- Maintain audit trail of selection methods
- Respect existing data access patterns

## Performance Considerations

### Caching Strategy
```typescript
// Cache selected event until end of day
const getEndOfDayTimestamp = (): number => {
  const now = new Date()
  const vietnamTime = toZonedTime(now, 'Asia/Ho_Chi_Minh')
  const endOfDay = new Date(vietnamTime)
  endOfDay.setHours(23, 59, 59, 999)
  return endOfDay.getTime()
}

const cachedEventSelection = {
  eventId: null as string | null,
  scheduleId: null as string | null,
  date: '',
  isAutoSelected: false,
  expiresAt: 0
}

const getCachedEventSelection = (): {
  eventId: string | null
  scheduleId: string | null
  isAutoSelected: boolean
} | null => {
  const today = getTodayInVietnam()
  const now = Date.now()
  
  // Check if cache is valid (same day and not expired)
  if (
    cachedEventSelection.date === today &&
    now < cachedEventSelection.expiresAt &&
    cachedEventSelection.eventId &&
    cachedEventSelection.scheduleId
  ) {
    return {
      eventId: cachedEventSelection.eventId,
      scheduleId: cachedEventSelection.scheduleId,
      isAutoSelected: cachedEventSelection.isAutoSelected
    }
  }
  
  return null
}

const setCachedEventSelection = (
  eventId: string,
  scheduleId: string,
  isAutoSelected: boolean
) => {
  const today = getTodayInVietnam()
  cachedEventSelection.eventId = eventId
  cachedEventSelection.scheduleId = scheduleId
  cachedEventSelection.date = today
  cachedEventSelection.isAutoSelected = isAutoSelected
  cachedEventSelection.expiresAt = getEndOfDayTimestamp()
  
  // Also store in localStorage for persistence across page reloads
  localStorage.setItem('selectedEventId', eventId)
  localStorage.setItem('selectedScheduleId', scheduleId)
  localStorage.setItem('isAutoSelected', isAutoSelected.toString())
  localStorage.setItem('autoSelectionDate', today)
}
```

### Optimization Strategies
- **Lazy Loading**: Only fetch event details when needed
- **Client-side Caching**: Cache results for session duration
- **Debounced Requests**: Prevent rapid auto-selection attempts
- **Background Updates**: Refresh event data periodically

### Database Optimization
- **Indexed Queries**: Ensure schedule date fields are indexed
- **Query Optimization**: Use efficient date range queries
- **Result Limiting**: Limit results to reasonable number of events

## Accessibility

### Screen Reader Support
- Announce auto-selection results
- Provide clear labels for auto-selected vs manually selected events
- Ensure keyboard navigation works with new UI elements

### Visual Indicators
- Clear visual distinction for auto-selected events
- High contrast indicators for selection status
- Responsive design for mobile check-in scenarios

### User Guidance
- Clear instructions for manual override
- Helpful error messages for edge cases
- Consistent terminology across interfaces

## Migration Strategy

### Phase 1: Core Auto-Selection Logic
- Implement auto-selection algorithm
- Add enhanced localStorage management
- Create unit tests for core functionality

### Phase 2: Paper Check-in Integration
- Integrate auto-selection into paper check-in page
- Add UI indicators and manual override options
- Implement error handling and fallback logic

### Phase 3: API Optimization (Optional)
- Create dedicated today's events endpoint
- Implement server-side caching
- Add performance monitoring

### Phase 4: Testing and Rollout
- Comprehensive integration testing
- User acceptance testing with event staff
- Gradual rollout with feature flag support

## Future Enhancements

### Smart Prioritization
- Learn from admin selection patterns
- Consider event popularity and attendance
- Factor in check-in history and preferences

### Multi-Day Event Support
- Handle events spanning multiple days
- Support for recurring events
- Advanced schedule pattern matching

### Predictive Pre-loading
- Pre-load likely events based on patterns
- Background sync of event data
- Offline support for auto-selection

### Analytics and Insights
- Track auto-selection success rates
- Monitor manual override patterns
- Provide insights for event scheduling optimization