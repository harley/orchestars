# Implementation Plan

- [x] 1. Update CheckinNav component routing for Search tab
  - Modify `src/components/CheckinNav.tsx` to route Search tab to `/checkin/validates` instead of `/checkin/events`
  - Update `isSearchActive` logic to highlight Search tab when on `/checkin/validates` pages
  - Ensure backward compatibility with existing navigation patterns
  - Test navigation flow between all three check-in modes (QR, Paper, Search)
  - _Requirements: 1.1, 4.1, 4.3_

- [x] 2. Integrate auto-selection logic into validates page
  - Import existing auto-selection utilities from Paper check-in into `src/app/(checkin)/checkin/validates/page.client.tsx`
  - Add auto-selection state management and useEffect hook for mount-time auto-selection
  - Implement network-optimized auto-selection that prioritizes URL params and cached selections
  - Add graceful fallback behavior when auto-selection fails without blocking manual usage
  - _Requirements: 1.2, 1.3, 4.3, 6.4_

- [x] 3. Add auto-selection UI indicators to search interface
  - Add auto-selection indicator banner similar to Paper check-in when event is auto-selected
  - Display loading state only when network call is actually needed for auto-selection
  - Add "Change event" link that routes to `/checkin/events?mode=search` for manual selection
  - Ensure consistent styling with existing Paper check-in auto-selection indicators
  - _Requirements: 1.3, 2.1, 6.1, 6.2_

- [x] 4. Enhance validate-contact API endpoint for ILIKE email search
  - Modify `src/app/api/checkin-app/validate-contact/route.ts` to support ILIKE pattern matching for email searches
  - Implement result counting logic to check if partial matches exceed 3 users before returning results
  - Add response structure for "too many matches" scenario with match count and search term
  - Maintain exact matching behavior for precise email addresses while adding partial matching capability
  - _Requirements: 2.1, 2.2, 2.5, 5.5_

- [x] 5. Enhance validate-contact API endpoint for ILIKE phone search
  - Add phone number normalization function to strip formatting characters for digit-only matching
  - Implement ILIKE pattern matching for phone number searches with normalized digits
  - Add same result limiting logic as email search (max 3 matches)
  - Handle both formatted and unformatted phone number inputs in search queries
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 5.5_

- [x] 6. Create "Too Many Matches" banner component and logic
  - Add state management for tracking when partial searches return too many results
  - Create reusable banner component to display helpful messaging when matches exceed limit
  - Integrate banner into validates page with appropriate styling and dismiss functionality
  - Provide clear guidance on how to refine search terms for better results
  - _Requirements: 2.5, 3.5, 6.3, 6.5_

- [x] 7. Update event selection page for search mode context
  - Modify `src/app/(checkin)/checkin/events/page.client.tsx` to handle `mode=search` parameter
  - Update event selection routing to navigate back to `/checkin/validates` when in search mode
  - Ensure manual event selection properly overrides auto-selection using existing localStorage mechanism
  - Test round-trip navigation from validates → events → validates with proper context preservation
  - _Requirements: 1.4, 2.2, 2.3, 4.4_

- [x] 8. Add input sanitization and security measures for enhanced search
  - Implement input sanitization for ILIKE queries to prevent SQL injection
  - Add validation for search term length and character limits
  - Apply rate limiting consistent with existing search endpoints
  - Test search functionality with special characters and edge cases
  - _Requirements: 6.1, 6.5, Security considerations_

- [x] 9. Maintain backward compatibility for exact matching
  - Ensure ticket code and seat number searches continue to use exact matching as before
  - Preserve existing search result display and check-in workflow for all search types
  - Test that current search functionality works identically for non-enhanced search types
  - Verify CheckinHistory component continues to work with enhanced search results
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 10. Add comprehensive error handling and edge cases
  - Implement graceful handling when auto-selection fails in search mode
  - Add appropriate error messages for enhanced search failures
  - Handle network timeouts and API errors without breaking the search interface
  - Test behavior when event context is missing or invalid
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 11. Write comprehensive tests for enhanced search functionality
  - Create unit tests for auto-selection integration in validates page
  - Write tests for ILIKE pattern matching logic in API endpoints
  - Add integration tests for navigation flow between check-in modes
  - Test "too many matches" scenario and banner display functionality
  - Create tests for input sanitization and security measures
  - _Requirements: All requirements validation through testing_

- [x] 12. Performance optimization and monitoring setup
  - Add database indexes for email and phone ILIKE searches if needed
  - Implement result caching for session duration to reduce repeated API calls
  - Add monitoring for search performance and usage patterns
  - Test search functionality with realistic data volumes (10,000+ records)
  - _Requirements: Performance considerations, scalability for 10k records_