# Implementation Plan

- [x] 1. Create auto-selection utility functions
  - Create `src/lib/checkin/autoEventSelection.ts` with date handling and event filtering logic
  - Implement `getTodayInVietnam()` function using date-fns-tz for consistent timezone handling
  - Implement `findTodaysEvents()` function to filter events with schedules matching today's date
  - Implement `attemptAutoSelection()` function that returns single event or fallback reasons
  - _Requirements: 1.1, 3.1, 3.2, 4.1, 4.4_

- [x] 2. Enhance localStorage management for end-of-day caching
  - Create `src/lib/checkin/eventSelectionCache.ts` with enhanced caching logic
  - Implement `getCachedEventSelection()` function that checks for valid cached selection until end of day
  - Implement `setCachedEventSelection()` function that stores selection with end-of-day expiration
  - Add `clearExpiredCache()` function to clean up selections from previous days
  - _Requirements: 2.4, 2.5, 6.4_

- [x] 3. Update paper check-in page with auto-selection logic
  - Modify `src/app/(checkin)/checkin/paper/page.client.tsx` to attempt auto-selection on load
  - Add auto-selection state management using React hooks
  - Implement logic to check cached selection first, then attempt auto-selection if needed
  - Add fallback logic to redirect to manual selection when auto-selection fails
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 4.1, 4.2_

- [x] 4. Add auto-selection UI indicators and feedback
  - Add visual indicator in paper check-in interface when event is auto-selected
  - Update event info display to show "Auto-selected for today" or similar messaging
  - Ensure "Change event" link is prominently displayed when event is auto-selected
  - Add loading states during auto-selection attempt
  - _Requirements: 5.1, 5.2, 2.1, 5.5_

- [x] 5. Enhance event selection page for better today's event visibility
  - Modify `src/app/(checkin)/checkin/events/page.client.tsx` to highlight today's events
  - Add visual indicators for events with today's schedules
  - Update routing logic to handle auto-selection failure reasons from URL parameters
  - Display contextual messages when redirected from failed auto-selection
  - _Requirements: 4.2, 4.3, 5.3, 5.4_

- [x] 6. Update event selection routing and context preservation
  - Ensure manual event selection properly overrides auto-selection in localStorage
  - Update event selection confirmation to mark selection as manual (not auto-selected)
  - Preserve paper mode context when navigating between auto-selection and manual selection
  - Test navigation flow from paper check-in → manual selection → back to paper check-in
  - _Requirements: 2.2, 2.3, 6.3, 6.1_

- [x] 7. Add error handling and edge case management
  - Implement graceful fallback when event data fetch fails
  - Add error boundaries for auto-selection failures
  - Handle cases where auto-selected event becomes unavailable
  - Add retry logic for network failures during auto-selection
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 8. Ensure cross-mode context preservation
  - Test that auto-selected event context is preserved when switching to QR or Search modes
  - Update navigation components to maintain event selection across all check-in modes
  - Verify that manual event changes are reflected across all check-in interfaces
  - Test localStorage synchronization between different check-in mode pages
  - _Requirements: 6.2, 6.1_

- [x] 9. Add comprehensive error messaging and user guidance
  - Create user-friendly error messages for different auto-selection failure scenarios
  - Add contextual help text explaining auto-selection behavior
  - Implement clear messaging when multiple events are available
  - Add guidance for manual override when auto-selection is not desired
  - _Requirements: 5.3, 5.4, 4.2_

- [x] 10. Write comprehensive tests for auto-selection functionality
  - Create unit tests for auto-selection utility functions with various date scenarios
  - Write tests for caching logic including end-of-day expiration behavior
  - Add integration tests for paper check-in page with auto-selection enabled
  - Create tests for navigation flow between auto-selection and manual selection
  - Test edge cases like multiple events, no events, and network failures
  - _Requirements: 1.1, 1.2, 1.3, 2.4, 2.5, 4.1, 4.4, 7.1, 7.2_