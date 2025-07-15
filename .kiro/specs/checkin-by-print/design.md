# Design Document

## Overview

The **Checkin by Paper** feature extends the existing check-in system by adding a third check-in method optimized for attendees with paper tickets. This design builds upon the existing QR and Search check-in infrastructure while introducing a streamlined interface focused on seat number entry and enhanced tracking capabilities to distinguish between different check-in methods.

## Architecture

### High-Level Flow
1. **Navigation Enhancement**: Update all check-in pages to display three tabs under a "Check-in by" heading
2. **New Route**: Create `/checkin/paper` route for paper-specific check-in interface
3. **Event/Schedule Selection**: Reuse existing event selection flow but redirect to paper interface
4. **Seat Validation**: Leverage existing `validate-seat` API endpoint
5. **Enhanced Tracking**: Extend checkinRecords to track paper vs QR vs search methods

### Route Structure
```
/checkin/scan     → QR check-in (existing)
/checkin/events   → Event selection for manual methods (existing)
/checkin/validates → Search check-in (existing)
/checkin/paper    → New paper check-in interface
```

## Components and Interfaces

### Navigation Component Updates

**Modified Components:**
- `src/app/(checkin)/checkin/scan/page.client.tsx`
- `src/app/(checkin)/checkin/validates/page.client.tsx`
- `src/app/(checkin)/checkin/events/page.client.tsx`

**Navigation Structure:**
```jsx
<div className="text-center mb-4">
  <h2 className="text-lg font-semibold mb-3">Check-in by</h2>
  <div className="grid grid-cols-3 gap-2">
    <Link href="/checkin/scan" className={tabStyles}>QR</Link>
    <Link href="/checkin/paper" className={tabStyles}>Paper</Link>
    <Link href="/checkin/events" className={tabStyles}>Search</Link>
  </div>
</div>
```

### New Paper Check-in Component

**File:** `src/app/(checkin)/checkin/paper/page.tsx`
```typescript
// Server component for auth check
export default async function PaperCheckinPage() {
  const admin = await getAdmin()
  if (!admin) {
    return redirect('/admin/login?redirect=/checkin/paper')
  }
  return <PaperCheckinClient />
}
```

**File:** `src/app/(checkin)/checkin/paper/page.client.tsx`
```typescript
interface PaperCheckinState {
  eventId: string | null
  scheduleId: string | null
  eventTitle: string
  scheduleDate: string
  seatNumber: string
  validatedTicket: ValidatedTicket | null
  isValidating: boolean
  isCheckingIn: boolean
  feedback: FeedbackState | null
}
```

### Event Selection Flow Enhancement

**Modified:** `src/app/(checkin)/checkin/events/page.client.tsx`

Add paper-specific routing logic:
```typescript
const handleEventSelect = (event: Event, schedule: Schedule) => {
  // Store selection in localStorage
  localStorage.setItem('selectedEventId', event.id)
  localStorage.setItem('selectedScheduleId', schedule.id)
  
  // Route based on intended destination
  const params = new URLSearchParams({
    eventId: event.id,
    scheduleId: schedule.id
  })
  
  // Check if coming from paper check-in
  if (searchParams.get('mode') === 'paper') {
    router.push(`/checkin/paper?${params.toString()}`)
  } else {
    router.push(`/checkin/validates?${params.toString()}`)
  }
}
```

## Data Models

### Enhanced Check-in Tracking

**Current checkinRecords schema:**
```sql
checkinRecords {
  id: string
  ticket: string (relation)
  checkedInBy: string (relation to admin)
  checkedInAt: datetime
  manual: boolean
  eventDate: date
  seat: string
  usherNumber: string
  ticketGivenTime: datetime
  ticketGivenBy: string
  deletedAt: datetime
}
```

**Proposed Enhancement:**
Add `checkinMethod` enum field to replace the boolean `manual` field:

```sql
ALTER TABLE checkinRecords 
ADD COLUMN checkinMethod ENUM('qr', 'paper', 'search') DEFAULT 'qr';

-- Migration to update existing records
UPDATE checkinRecords 
SET checkinMethod = CASE 
  WHEN manual = true THEN 'search'
  WHEN manual = false THEN 'qr'
END;
```

**Note:** The `manual` field will be kept for backward compatibility but deprecated in favor of `checkinMethod`.

### Future Enhancement Tracking
**Out of scope for this spec but noted for future implementation:**
- Track search method in checkinRecords (email/phone/seat/ticket)
- Add `searchMethod` enum field: `('email', 'phone', 'seat', 'ticket')`

## Error Handling

### Validation Errors
- **Invalid Seat**: "Seat not found for this event"
- **Already Checked In**: Show previous check-in details with admin and timestamp
- **Network Error**: "Connection failed. Please try again."
- **Event/Schedule Required**: Redirect to event selection with error message

### User Experience
- 2-second throttle on validation requests
- Auto-focus seat input after successful check-in
- Clear feedback overlays matching existing QR/Search patterns
- Maintain event/schedule context across operations

## Testing Strategy

### Unit Tests
- Paper check-in component state management
- Navigation tab active state logic
- Event/schedule context preservation
- Input validation and sanitization

### Integration Tests
- End-to-end paper check-in flow
- Navigation between all three check-in modes
- Event selection → paper check-in routing
- API integration with existing validate-seat endpoint

### API Tests
- Validate existing `validate-seat` endpoint compatibility
- Check-in recording with new `checkinMethod` field
- Error handling for invalid seats and duplicate check-ins

### User Acceptance Tests
- Admin can switch between QR, Paper, and Search modes seamlessly
- Paper check-in requires event/schedule selection
- Seat number validation works correctly
- Check-in tracking distinguishes paper from other methods
- Interface is responsive and accessible

## Security Considerations

### Authentication
- Reuse existing admin authentication middleware
- Same access control as QR and Search check-in
- Redirect unauthenticated users to login with proper return URL

### Input Validation
- Sanitize seat number input
- Validate event/schedule IDs from URL parameters
- Prevent SQL injection in seat lookup queries

### Rate Limiting
- Apply same rate limiting as existing check-in endpoints
- 2-second client-side throttle for validation requests

## Performance Considerations

### Caching
- Reuse existing localStorage for event/schedule selection
- Cache validated ticket details during confirmation flow
- Maintain check-in history cache consistency

### API Optimization
- Leverage existing `validate-seat` endpoint (no new API needed)
- Reuse existing check-in endpoint with enhanced tracking
- Minimize database queries through existing optimizations

## Accessibility

### Keyboard Navigation
- Tab order: Navigation tabs → Event selection → Seat input → Action buttons
- Enter key submits seat validation
- Escape key clears current input/state

### Screen Reader Support
- Proper ARIA labels for navigation tabs
- Announce validation results and feedback
- Clear form labels and error messages

### Visual Design
- High contrast for active tab states
- Clear visual hierarchy matching existing pages
- Responsive design for mobile check-in scenarios

## Migration Strategy

### Phase 1: Navigation Updates
- Update existing pages to show three-tab navigation
- Ensure backward compatibility with existing URLs

### Phase 2: Paper Check-in Implementation
- Create new paper check-in route and component
- Implement event selection routing for paper mode

### Phase 3: Enhanced Tracking
- Add `checkinMethod` field to database
- Update check-in recording logic
- Migrate existing records

### Phase 4: Testing and Rollout
- Comprehensive testing across all check-in methods
- Gradual rollout with feature flag if needed
- Monitor check-in method analytics

## Future Enhancements

### Search Method Tracking (Future Spec)
- Add `searchMethod` field to track how tickets were found in search mode
- Values: `email`, `phone`, `seat`, `ticket`
- Requires separate spec and implementation

### Bulk Paper Check-in
- Allow CSV upload of seat numbers for batch processing
- Useful for pre-event setup or large group check-ins

### Offline Paper Check-in
- Cache event/seat data for offline validation
- Sync check-ins when connection restored