# Implementation Plan

- [x] 1. Database schema enhancement for check-in method tracking
  - Create migration to add `checkinMethod` enum field to checkinRecords table
  - Write migration to update existing records (manual=true → 'search', manual=false → 'qr')
  - Update TypeScript types in payload-types.ts to include new checkinMethod field
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 2. Create paper check-in route structure
  - Create `src/app/(checkin)/checkin/paper/page.tsx` server component with admin authentication
  - Create `src/app/(checkin)/checkin/paper/page.client.tsx` client component for paper check-in interface
  - Implement event/schedule parameter handling from URL query params
  - _Requirements: 1.2, 5.1_

- [ ] 3. Implement paper check-in core functionality
  - Build seat number input form with validation
  - Implement seat validation using existing `validate-seat` API endpoint
  - Create ticket confirmation display with attendee details
  - Add check-in action with proper error handling and feedback
  - _Requirements: 1.4, 1.5, 2.1, 2.2, 2.3_

- [ ] 4. Update navigation components across all check-in pages
  - Modify `src/app/(checkin)/checkin/scan/page.client.tsx` to show three-tab navigation
  - Modify `src/app/(checkin)/checkin/validates/page.client.tsx` to show three-tab navigation  
  - Modify `src/app/(checkin)/checkin/events/page.client.tsx` to show three-tab navigation
  - Update tab styling and active state logic for three tabs instead of two
  - _Requirements: 1.1, 3.2_

- [ ] 5. Enhance event selection routing for paper mode
  - Update `src/app/(checkin)/checkin/events/page.client.tsx` to handle paper mode routing
  - Add mode parameter detection and routing logic to paper check-in page
  - Implement localStorage context preservation for event/schedule selection
  - _Requirements: 1.3, 2.5, 6.3_

- [ ] 6. Update check-in recording logic with enhanced tracking
  - Modify check-in API endpoint to accept and record checkinMethod parameter
  - Update `src/app/api/checkin-app/checkin/[ticketCode]/route.ts` to handle new tracking field
  - Ensure paper check-ins are recorded with checkinMethod='paper' and manual=true
  - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [ ] 7. Implement paper check-in user experience enhancements
  - Add auto-focus to seat input field after successful check-in
  - Implement 2-second throttle on validation requests to prevent duplicates
  - Create consistent feedback system matching QR and search check-in patterns
  - Add proper loading states and error handling
  - _Requirements: 2.4, 3.4, 3.5, 5.3, 5.5_

- [ ] 8. Add paper check-in interface styling and accessibility
  - Implement responsive design matching existing check-in pages
  - Add proper ARIA labels and keyboard navigation support
  - Create distinct visual identity for paper check-in mode
  - Ensure high contrast and mobile-friendly interface
  - _Requirements: 3.1, 3.3_

- [ ] 9. Update internationalization for paper check-in
  - Add translation keys for paper check-in interface text
  - Update existing translation files with new paper-specific labels
  - Ensure consistent terminology across all check-in modes
  - _Requirements: 3.1, 3.3_

- [ ] 10. Write comprehensive tests for paper check-in functionality
  - Create unit tests for paper check-in component state management
  - Write integration tests for navigation between all three check-in modes
  - Add API tests for enhanced check-in recording with checkinMethod field
  - Create end-to-end tests for complete paper check-in flow
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 6.2, 6.4, 6.5_