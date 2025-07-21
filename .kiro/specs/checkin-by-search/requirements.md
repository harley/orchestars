# Requirements Document

## Introduction

The **Check-in by Search** feature enhances the search-based check-in workflow by implementing auto-event selection and improving search flexibility. This feature builds upon the existing Paper check-in functionality, extending the auto-event selection capability to the Search interface while adding enhanced ILIKE pattern matching for email and phone number searches to make ticket lookup faster and more flexible.

## Requirements

### Requirement 1: Auto-Event Selection for Search Interface

**User Story:** As an event admin, I want the Search tab to navigate directly to the search interface with auto-selected events so that I can quickly search for attendees without manual event selection.

#### Acceptance Criteria

This requirement inherits all acceptance criteria from **Auto Event Selection Requirements 1-7**, with the following specific adaptations:

1. WHEN an admin clicks the Search tab THEN the system SHALL navigate to `/checkin/validates` instead of `/checkin/events`
2. WHEN accessing `/checkin/validates` THEN the system SHALL apply the same auto-selection logic as implemented for Paper check-in
3. WHEN auto-selection succeeds THEN the system SHALL display the search interface with all four search tabs (ticket, seat, email, phone)
4. WHEN auto-selection fails THEN the system SHALL redirect to `/checkin/events?mode=search` for manual event selection

### Requirement 2: Enhanced Email Search with ILIKE Pattern Matching

**User Story:** As an event admin, I want enhanced email search functionality so that I can find attendees even with partial or approximate email addresses.

#### Acceptance Criteria

1. WHEN searching by email THEN the system SHALL use ILIKE pattern matching instead of exact matching
2. WHEN an email search is performed THEN the system SHALL find matches that contain the search term anywhere in the email address
3. WHEN searching with partial email domains THEN the system SHALL return all matching results (e.g., "gmail" finds all @gmail.com addresses)
4. WHEN searching with partial usernames THEN the system SHALL return all matching results (e.g., "john" finds john@example.com, johnny@test.com)
5. WHEN email search finds tickets from 3 or fewer unique users THEN the system SHALL display all matching tickets using the existing TicketCard component
6. WHEN email search finds tickets from more than 3 unique users THEN the system SHALL display "Too Many Users Found" message with the count of unique users and search term
7. WHEN "Too Many Users Found" is displayed THEN the system SHALL provide guidance to be more specific with the search term
8. WHEN search results contain tickets from multiple users THEN the system SHALL display a prominent warning banner above the ticket list to alert event admins

### Requirement 3: Enhanced Phone Number Search with ILIKE Pattern Matching

**User Story:** As an event admin, I want enhanced phone number search functionality so that I can find attendees even with partial or formatted phone numbers.

#### Acceptance Criteria

1. WHEN searching by phone number THEN the system SHALL use ILIKE pattern matching instead of exact matching
2. WHEN a phone search is performed THEN the system SHALL find matches that contain the search digits anywhere in the phone number
3. WHEN searching with partial phone numbers THEN the system SHALL return all matching results (e.g., "123" finds +84123456789, 0123456789)
4. WHEN searching with formatted phone numbers THEN the system SHALL ignore formatting characters and match digits only
5. WHEN phone search finds tickets from 3 or fewer unique users THEN the system SHALL display all matching tickets using the existing TicketCard component
6. WHEN phone search finds tickets from more than 3 unique users THEN the system SHALL display "Too Many Users Found" message with the count of unique users and search term
7. WHEN "Too Many Users Found" is displayed THEN the system SHALL provide guidance to be more specific with the search term

### Requirement 4: Navigation and Context Preservation

**User Story:** As an event admin, I want the navigation between check-in modes to work seamlessly with the new search routing so that I can switch between QR, Paper, and Search modes without losing context.

#### Acceptance Criteria

1. WHEN the CheckinNav component renders THEN the Search tab SHALL navigate to `/checkin/validates` and be highlighted when on that route
2. WHEN switching between check-in modes THEN the system SHALL preserve the selected event context using the same localStorage mechanism as Paper check-in
3. WHEN event context is missing in search mode THEN the system SHALL attempt auto-selection or redirect to manual event selection
4. WHEN returning from manual event selection with search mode context THEN the system SHALL navigate back to `/checkin/validates`

### Requirement 5: Backward Compatibility and User Experience

**User Story:** As an event admin, I want the enhanced search to maintain all existing functionality while adding flexibility so that current workflows are not disrupted.

#### Acceptance Criteria

1. WHEN searching by ticket code or seat number THEN the system SHALL maintain exact matching behavior as currently implemented
2. WHEN using exact search terms for email or phone THEN the system SHALL still return exact matches with higher priority
3. WHEN multiple search results are found THEN the system SHALL display them using the existing interface and components
4. WHEN checking in attendees from search results THEN the system SHALL use the existing check-in workflow with proper tracking
5. WHEN search history is accessed THEN the system SHALL continue to work with the existing CheckinHistory component

### Requirement 6: Error Handling and Edge Cases

**User Story:** As an event admin, I want the system to handle edge cases gracefully in the enhanced search interface so that the system remains reliable during unusual scenarios.

#### Acceptance Criteria

1. WHEN search terms contain special characters THEN the system SHALL handle them safely without causing SQL injection or errors
2. WHEN determining if there are "too many users" THEN the system SHALL count unique user_id values from the tickets.user_id field joined with users table
3. WHEN network errors occur during enhanced searches THEN the system SHALL provide clear error messages and retry options
4. WHEN auto-selection fails in search mode THEN the system SHALL handle it gracefully using the same error handling as Paper check-in
5. WHEN switching between search types THEN the system SHALL clear previous results and provide appropriate loading states
6. WHEN search terms are too short (less than 2 characters) THEN the system SHALL provide appropriate validation feedback