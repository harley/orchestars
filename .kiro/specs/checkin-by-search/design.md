# Design Document

## Overview

The **Check-in by Search** feature enhances the existing search-based check-in workflow by implementing auto-event selection and improving search flexibility through ILIKE pattern matching. This design leverages the existing auto-event selection infrastructure from Paper check-in while extending the search API endpoints to support flexible pattern matching for email and phone number searches.

The key architectural changes involve updating the CheckinNav component routing, integrating auto-selection logic into the validates page, and enhancing the backend search APIs to support ILIKE queries for improved user experience.

## Architecture

### High-Level Flow
1. **Navigation Update**: Search tab routes to `/checkin/validates` instead of `/checkin/events`
2. **Auto-Selection Integration**: Apply existing auto-selection logic to validates page on load
3. **Enhanced Search APIs**: Extend existing search endpoints to support ILIKE pattern matching
4. **Context Preservation**: Maintain event selection across all check-in modes using existing localStorage mechanism

### Route Changes
```
Current:
Search tab → /checkin/events → manual selection → /checkin/validates

New:
Search tab → /checkin/validates (with auto-selection) → fallback to /checkin/events?mode=search
```

## Components and Interfaces

### CheckinNav Component Updates

**Modified File:** `src/components/CheckinNav.tsx`

**Key Changes:**
```typescript
// Update Search tab routing
const isSearchActive = pathname.startsWith('/checkin/validates') || 
  (pathname === '/checkin/events' && modeParam === 'search')

// Update Search tab link
<Link href="/checkin/validates" className={tabClass(isSearchActive)}>
  {t('Search')}
</Link>
```

### Enhanced Validates Page with Auto-Selection

**Modified File:** `src/app/(checkin)/checkin/validates/page.client.tsx`

**New State for Partial Match Handling:**
```typescript
interface TooManyMatchesState {
  show: boolean
  matchCount: number
  searchTerm: string
  searchType: 'email' | 'phone'
}

const [tooManyMatches, setTooManyMatches] = useState<TooManyMatchesState>({
  show: false,
  matchCount: 0,
  searchTerm: '',
  searchType: 'email'
})
```

**Enhanced handleValidate Function:**
```typescript
const handleValidate = async () => {
  // ... existing validation logic ...
  
  try {
    // ... existing API call logic ...
    
    const data = await response.json()
    
    // Handle too many matches response
    if (data.tooManyMatches) {
      setTooManyMatches({
        show: true,
        matchCount: data.matchCount,
        searchTerm: data.searchTerm,
        searchType: data.searchType
      })
      setValidatedTicket(null)
      setMultipleTickets([])
      return
    }
    
    // ... existing result handling logic ...
  } catch (error) {
    // ... existing error handling ...
  }
}
```

**Too Many Matches Banner Component:**
```typescript
const TooManyMatchesBanner = ({ state, onDismiss }: { 
  state: TooManyMatchesState, 
  onDismiss: () => void 
}) => {
  if (!state.show) return null
  
  return (
    <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Too Many Matches Found
            </h3>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              Found {state.matchCount} {state.searchType === 'email' ? 'email addresses' : 'phone numbers'} matching "{state.searchTerm}". 
              Please be more specific to see results (showing max 3 matches).
            </p>
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              Try searching with more characters or the full {state.searchType === 'email' ? 'email address' : 'phone number'}.
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="ml-4 text-amber-400 hover:text-amber-600 dark:text-amber-300 dark:hover:text-amber-100"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}
```

**Multiple Users Warning Banner Component:**
```typescript
const MultipleUsersWarningBanner = ({ uniqueUserCount }: { uniqueUserCount: number }) => {
  return (
    <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
      <div className="flex items-start">
        <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div>
          <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
            ⚠️ Multiple People Found
          </h3>
          <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
            These tickets belong to <strong>{uniqueUserCount} different people</strong>. 
            Please verify each person's identity before checking them in.
          </p>
          <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
            Double-check names, emails, and phone numbers match the person in front of you.
          </p>
        </div>
      </div>
    </div>
  )
}
```

**New Auto-Selection Integration:**
```typescript
// Import existing auto-selection utilities
import {
  attemptAutoSelection,
  type EventWithSchedules
} from '@/lib/checkin/autoEventSelection'
import {
  getCachedEventSelection,
  setCachedEventSelection,
  clearExpiredCache
} from '@/lib/checkin/eventSelectionCache'

interface AutoSelectionState {
  isAutoSelected: boolean
  isLoading: boolean
  attempted: boolean
  error: string | null
}

// Add auto-selection logic on component mount with network optimization
useEffect(() => {
  const performAutoSelection = async () => {
    clearExpiredCache()
    
    // Check URL params first (no network call needed)
    const urlEventId = searchParams.get('eventId')
    const urlScheduleId = searchParams.get('scheduleId')
    
    if (urlEventId && urlScheduleId) {
      // Use URL params if available - no loading state needed
      setEventId(urlEventId)
      setScheduleId(urlScheduleId)
      setAutoSelection({ isAutoSelected: false, isLoading: false, attempted: true, error: null })
      return
    }
    
    // Check cached selection (no network call needed)
    const cachedSelection = getCachedEventSelection()
    if (cachedSelection) {
      // Use cached selection - no loading state needed
      setEventId(cachedSelection.eventId)
      setScheduleId(cachedSelection.scheduleId)
      setAutoSelection({ 
        isAutoSelected: cachedSelection.isAutoSelected, 
        isLoading: false, 
        attempted: true, 
        error: null 
      })
      return
    }
    
    // Only show loading state when network call is actually needed
    setAutoSelection(prev => ({ ...prev, isLoading: true }))
    
    try {
      // Reuse existing events fetch to avoid extra network call
      const response = await fetch('/api/checkin-app/events')
      const data = await response.json()
      const events: EventWithSchedules[] = data.events?.docs || []
      
      const autoSelectionResult = await attemptAutoSelection(events)
      
      if (autoSelectionResult.success) {
        // Set event context and cache selection
        setEventId(autoSelectionResult.eventId)
        setScheduleId(autoSelectionResult.scheduleId)
        setCachedEventSelection(
          autoSelectionResult.eventId,
          autoSelectionResult.scheduleId,
          true,
          { /* event metadata */ }
        )
        setAutoSelection({ isAutoSelected: true, isLoading: false, attempted: true, error: null })
      } else {
        // Redirect to manual selection
        router.push(`/checkin/events?mode=search&reason=${autoSelectionResult.reason}`)
      }
    } catch (error) {
      // Graceful fallback - allow manual search without auto-selection
      setAutoSelection({ isAutoSelected: false, isLoading: false, attempted: true, error: 'fetch_error' })
      // Don't redirect immediately - let user proceed with manual event selection if needed
    }
  }
  
  performAutoSelection()
}, [])
```

### Enhanced Search API Endpoints

**Modified File:** `src/app/api/checkin-app/validate-contact/route.ts`

**Enhanced Email Search Logic with Unique User Limiting:**
```typescript
const MAX_UNIQUE_USERS = 3

// Enhanced ILIKE matching with unique user limiting
// First, count unique users that match the email pattern and have tickets for this event
const uniqueUserCountQuery = sql`
  SELECT COUNT(DISTINCT u.id) as unique_user_count
  FROM users u
  INNER JOIN tickets t ON t.user_id = u.id
  WHERE u.email ILIKE ${'%' + sanitizedEmail + '%'}
    AND t.event_id = ${eventId}
    AND t.event_schedule_id = ${scheduleId}
    AND t.status = 'booked'
`

const userCountResult = await payload.db.drizzle.execute(uniqueUserCountQuery)
const uniqueUserCount = Number(userCountResult.rows[0]?.unique_user_count ?? 0)

if (uniqueUserCount > MAX_UNIQUE_USERS) {
  return Response.json({
    tickets: [],
    tooManyMatches: true,
    matchCount: uniqueUserCount,
    searchTerm: searchEmail,
    searchType: 'email'
  })
}

// Proceed with actual search if within unique user limit
// This will return ALL tickets for the matching users (not limited to 3 tickets)
const tickets = await findTickets({
  email: sanitizedEmail,
  eventId,
  scheduleId,
  useILIKE: true
})
```

**Enhanced Phone Search Logic with Unique User Limiting:**
```typescript
const normalizePhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '') // Remove all non-digit characters
}

const searchDigits = normalizePhoneNumber(searchPhone)

// Count unique users that match the phone pattern and have tickets for this event
const uniqueUserCountQuery = sql`
  SELECT COUNT(DISTINCT u.id) as unique_user_count
  FROM users u
  INNER JOIN tickets t ON t.user_id = u.id
  WHERE (u.phone_number ILIKE ${'%' + searchDigits + '%'} OR u.phone_number ILIKE ${'%' + sanitizedPhone + '%'})
    AND t.event_id = ${eventId}
    AND t.event_schedule_id = ${scheduleId}
    AND t.status = 'booked'
`

const userCountResult = await payload.db.drizzle.execute(uniqueUserCountQuery)
const uniqueUserCount = Number(userCountResult.rows[0]?.unique_user_count ?? 0)

if (uniqueUserCount > MAX_UNIQUE_USERS) {
  return Response.json({
    tickets: [],
    tooManyMatches: true,
    matchCount: uniqueUserCount,
    searchTerm: searchPhone,
    searchType: 'phone'
  })
}

// Proceed with actual search if within unique user limit
// This will return ALL tickets for the matching users (not limited to 3 tickets)
const tickets = await findTickets({
  phoneNumber: sanitizedPhone,
  eventId,
  scheduleId,
  useILIKE: true
})
```

### Event Selection Page Enhancement

**Modified File:** `src/app/(checkin)/checkin/events/page.client.tsx`

**Search Mode Context Handling:**
```typescript
const handleEventSelect = (event: Event, schedule: Schedule) => {
  // Store selection in localStorage
  setCachedEventSelection(event.id, schedule.id, false, {
    title: event.title,
    location: event.eventLocation,
    scheduleDate: format(new Date(schedule.date), 'dd-MM-yyyy'),
    scheduleTime: schedule.details?.[0]?.time
  })
  
  // Route based on mode parameter
  const mode = searchParams.get('mode')
  const params = new URLSearchParams({
    eventId: event.id,
    scheduleId: schedule.id
  })
  
  if (mode === 'search') {
    router.push(`/checkin/validates?${params.toString()}`)
  } else if (mode === 'paper') {
    router.push(`/checkin/paper?${params.toString()}`)
  } else {
    // Default to search mode
    router.push(`/checkin/validates?${params.toString()}`)
  }
}
```

## Data Models

### Enhanced Search Query Patterns

**Email Search Patterns:**
```sql
-- Current: Exact match
SELECT * FROM users WHERE email = 'john@example.com'

-- Enhanced: ILIKE pattern matching
SELECT * FROM users WHERE email ILIKE '%john%'
SELECT * FROM users WHERE email ILIKE '%gmail%'
SELECT * FROM users WHERE email ILIKE '%example.com%'
```

**Phone Search Patterns:**
```sql
-- Current: Exact match
SELECT * FROM users WHERE phone_number = '+84123456789'

-- Enhanced: Flexible digit matching
SELECT * FROM users WHERE REGEXP_REPLACE(phone_number, '[^0-9]', '', 'g') ILIKE '%123%'
SELECT * FROM users WHERE phone_number ILIKE '%123%'
```

### Search Result Prioritization

**Priority Order for Enhanced Searches:**
1. **Exact matches** (highest priority)
2. **Starts with** matches
3. **Contains** matches (lowest priority)

```typescript
interface SearchResult {
  ticket: TicketDTO
  matchType: 'exact' | 'startsWith' | 'contains'
  matchField: 'email' | 'phone'
}

const prioritizeResults = (results: SearchResult[]): TicketDTO[] => {
  return results
    .sort((a, b) => {
      const priority = { exact: 3, startsWith: 2, contains: 1 }
      return priority[b.matchType] - priority[a.matchType]
    })
    .map(result => result.ticket)
}
```

## Error Handling

### Auto-Selection Error Handling

**Reuse Existing Error Patterns:**
```typescript
// Same error handling as Paper check-in
const handleAutoSelectionError = (reason: string) => {
  const errorMessages = {
    no_events_today: 'No events scheduled for today',
    multiple_events_today: 'Multiple events available - please select manually',
    fetch_error: 'Unable to load events - please try again',
    no_schedule_today: 'No schedules found for today'
  }
  
  router.push(`/checkin/events?mode=search&reason=${reason}`)
}
```

### Enhanced Search Error Handling

**ILIKE Query Safety:**
```typescript
const sanitizeSearchTerm = (term: string): string => {
  // Escape special SQL characters for ILIKE
  return term
    .replace(/[%_\\]/g, '\\$&') // Escape ILIKE wildcards
    .trim()
}

const validateSearchTerm = (term: string): boolean => {
  // Minimum length to prevent overly broad searches
  return term.length >= 2 && term.length <= 100
}
```

**Result Limiting:**
```typescript
const MAX_SEARCH_RESULTS = 50

const limitSearchResults = (results: TicketDTO[]): TicketDTO[] => {
  if (results.length > MAX_SEARCH_RESULTS) {
    // Show toast notification about limited results
    toast({
      title: 'Many Results Found',
      description: `Showing first ${MAX_SEARCH_RESULTS} results. Try a more specific search.`,
      variant: 'info'
    })
    return results.slice(0, MAX_SEARCH_RESULTS)
  }
  return results
}
```

## Testing Strategy

### Unit Tests

**Auto-Selection Integration:**
```typescript
describe('Validates Page Auto-Selection', () => {
  test('applies auto-selection on mount', async () => {
    mockTodaysEvent()
    render(<ValidatePageClient />)
    
    await waitFor(() => {
      expect(screen.getByText('Auto-selected for today')).toBeInTheDocument()
    })
  })
  
  test('redirects to manual selection when auto-selection fails', async () => {
    mockNoEventsToday()
    const { router } = render(<ValidatePageClient />)
    
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/checkin/events?mode=search&reason=no_events_today')
    })
  })
})
```

**Enhanced Search Logic:**
```typescript
describe('Enhanced Search Functionality', () => {
  test('email search uses ILIKE pattern matching', async () => {
    const mockResults = [
      { email: 'john@example.com' },
      { email: 'johnny@test.com' }
    ]
    
    mockSearchAPI(mockResults)
    
    // Search for partial email
    await searchByEmail('john')
    
    expect(mockSearchAPI).toHaveBeenCalledWith({
      email: { contains: 'john', mode: 'insensitive' }
    })
  })
  
  test('phone search normalizes digits', async () => {
    await searchByPhone('123-456')
    
    expect(mockSearchAPI).toHaveBeenCalledWith({
      phoneNumber: { contains: '123456', mode: 'insensitive' }
    })
  })
})
```

### Integration Tests

**Navigation Flow:**
```typescript
describe('Search Navigation Integration', () => {
  test('Search tab navigates to validates page', () => {
    render(<CheckinNav />)
    
    const searchTab = screen.getByText('Search')
    expect(searchTab.closest('a')).toHaveAttribute('href', '/checkin/validates')
  })
  
  test('preserves event context when switching modes', async () => {
    // Set event context
    localStorage.setItem('selectedEventId', 'event-123')
    localStorage.setItem('selectedScheduleId', 'schedule-456')
    
    render(<ValidatePageClient />)
    
    // Switch to paper mode
    const paperTab = screen.getByText('Paper')
    fireEvent.click(paperTab)
    
    // Should maintain event context
    expect(localStorage.getItem('selectedEventId')).toBe('event-123')
  })
})
```

### API Tests

**Enhanced Search Endpoints:**
```typescript
describe('Enhanced Search API', () => {
  test('email search returns ILIKE results', async () => {
    const response = await fetch('/api/checkin-app/validate-contact', {
      method: 'POST',
      body: JSON.stringify({
        email: 'john',
        eventId: 'event-123',
        scheduleId: 'schedule-456'
      })
    })
    
    const data = await response.json()
    expect(data.tickets).toHaveLength(2) // john@example.com, johnny@test.com
  })
  
  test('phone search handles formatted numbers', async () => {
    const response = await fetch('/api/checkin-app/validate-contact', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: '+84-123-456',
        eventId: 'event-123',
        scheduleId: 'schedule-456'
      })
    })
    
    const data = await response.json()
    expect(data.tickets.length).toBeGreaterThan(0)
  })
})
```

## Security Considerations

### Input Sanitization

**ILIKE Query Protection:**
```typescript
const sanitizeILIKEInput = (input: string): string => {
  return input
    .replace(/[%_\\]/g, '\\$&') // Escape ILIKE wildcards
    .replace(/[';--]/g, '') // Remove SQL injection attempts
    .trim()
    .substring(0, 100) // Limit length
}
```

**Rate Limiting:**
```typescript
// Apply same rate limiting as existing search endpoints
const SEARCH_RATE_LIMIT = {
  windowMs: 60000, // 1 minute
  max: 30 // 30 requests per minute per IP
}
```

### Access Control

**Maintain Existing Security:**
- Reuse existing admin authentication middleware
- Apply same event access control as other check-in methods
- Validate event/schedule IDs in search requests

## Performance Considerations

### Database Optimization

**Index Requirements:**
```sql
-- Ensure indexes exist for ILIKE searches
CREATE INDEX CONCURRENTLY idx_users_email_ilike ON users USING gin(email gin_trgm_ops);
CREATE INDEX CONCURRENTLY idx_users_phone_ilike ON users USING gin(phone_number gin_trgm_ops);

-- Alternative: B-tree indexes for prefix searches
CREATE INDEX CONCURRENTLY idx_users_email_prefix ON users (lower(email) text_pattern_ops);
CREATE INDEX CONCURRENTLY idx_users_phone_prefix ON users (phone_number text_pattern_ops);
```

**Query Optimization:**
```typescript
// Limit search scope to current event/schedule
const searchQuery = {
  where: {
    and: [
      // Event/schedule filters first (most selective)
      { 'ticket.eventSchedule': { equals: scheduleId } },
      { 'ticket.event': { equals: eventId } },
      // Then apply ILIKE search
      { email: { contains: searchTerm, mode: 'insensitive' } }
    ]
  },
  limit: MAX_SEARCH_RESULTS
}
```

### Caching Strategy

**Reuse Existing Caching:**
- Use same localStorage caching as Paper check-in for event selection
- Cache search results for session duration to avoid repeated queries
- Implement debounced search to reduce API calls

## Accessibility

### Enhanced Search UX

**Search Hints:**
```typescript
const searchHints = {
  email: "Try partial matches like 'gmail' or 'john'",
  phone: "Enter any digits like '123' or '0123456789'",
  ticket: "Enter exact ticket code",
  seat: "Enter exact seat number"
}
```

**Screen Reader Support:**
- Announce search result counts
- Provide clear labels for enhanced search capabilities
- Maintain existing keyboard navigation patterns

## Migration Strategy

### Phase 1: Navigation Updates
- Update CheckinNav component to route Search tab to `/checkin/validates`
- Ensure backward compatibility with existing URLs
- Test navigation flow between all check-in modes

### Phase 2: Auto-Selection Integration
- Integrate existing auto-selection logic into validates page
- Add auto-selection UI indicators
- Test event context preservation across modes

### Phase 3: Enhanced Search APIs
- Implement ILIKE pattern matching for email and phone searches
- Add input sanitization and result limiting
- Create database indexes for performance

### Phase 4: Testing and Rollout
- Comprehensive testing of enhanced search functionality
- Performance testing with large datasets
- Gradual rollout with monitoring

## Future Enhancements

### Advanced Search Features
- **Fuzzy Matching**: Implement Levenshtein distance for typo tolerance
- **Search History**: Cache recent searches for quick access
- **Bulk Search**: Allow CSV upload for batch ticket lookup

### Analytics and Insights
- **Search Pattern Analytics**: Track which search methods are most effective
- **Performance Monitoring**: Monitor ILIKE query performance and optimization opportunities
- **User Behavior**: Analyze search-to-checkin conversion rates