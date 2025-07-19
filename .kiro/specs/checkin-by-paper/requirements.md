# Requirements Document

## Introduction

The **Checkin by Paper** feature adds a third check-in option to the existing event ticket system, complementing the current "Checkin by QR" and "Checkin by Search" options. This feature is designed for scenarios where event attendees have paper tickets and need to be checked in quickly by entering only their seat number, making it faster than the full search process but still requiring event/schedule context.

## Requirements

### Requirement 1

**User Story:** As an event admin, I want to have a third check-in option called "Checkin by Paper" so that I can quickly check in attendees who have paper tickets by simply entering their seat number.

#### Acceptance Criteria

1. WHEN an admin accesses any check-in page THEN the system SHALL display a "Check-in by" heading above three navigation tabs: "QR", "Paper", and "Search"
2. WHEN an admin clicks the "Paper" tab THEN the system SHALL navigate to a dedicated paper check-in interface
3. WHEN the paper check-in interface loads THEN the system SHALL require event and schedule selection before allowing seat number entry
4. WHEN an admin enters a seat number in paper check-in mode THEN the system SHALL validate and display the ticket details for confirmation
5. WHEN ticket details are confirmed THEN the system SHALL perform the check-in and mark it as a manual check-in with the paper flag

### Requirement 2

**User Story:** As an event admin, I want the paper check-in process to be streamlined and fast so that I can efficiently process attendees with paper tickets during busy periods.

#### Acceptance Criteria

1. WHEN using paper check-in THEN the system SHALL only require seat number input after event/schedule selection
2. WHEN a seat number is entered THEN the system SHALL validate it within 2 seconds
3. WHEN validation succeeds THEN the system SHALL display attendee name, ticket class, and seat details for quick confirmation
4. WHEN check-in is completed THEN the system SHALL automatically refocus the seat input field for the next entry
5. WHEN multiple consecutive check-ins are performed THEN the system SHALL maintain the selected event/schedule context

### Requirement 3

**User Story:** As an event admin, I want the paper check-in interface to be visually distinct from search check-in so that I can easily identify which mode I'm using and avoid confusion.

#### Acceptance Criteria

1. WHEN accessing paper check-in THEN the system SHALL display a distinct page title indicating "Paper Check-In"
2. WHEN in paper check-in mode THEN the system SHALL highlight the "Paper" navigation tab as active
3. WHEN displaying the input interface THEN the system SHALL show only seat number input with clear labeling
4. WHEN showing validation results THEN the system SHALL use consistent styling with other check-in modes
5. WHEN displaying success/error feedback THEN the system SHALL use the same feedback system as QR and search modes

### Requirement 4

**User Story:** As an event admin, I want paper check-ins to be properly tracked and logged so that I can distinguish them from QR and search check-ins in reports and analytics.

#### Acceptance Criteria

1. WHEN a paper check-in is performed THEN the system SHALL record it in the checkinRecords table
2. WHEN recording the check-in THEN the system SHALL set the manual flag to true
3. WHEN recording the check-in THEN the system SHALL set a paper-specific identifier or flag
4. WHEN recording the check-in THEN the system SHALL capture the admin who performed the action
5. WHEN recording the check-in THEN the system SHALL capture the event date and schedule information

### Requirement 5

**User Story:** As an event admin, I want paper check-in to have the same security and validation rules as other check-in methods so that ticket integrity is maintained.

#### Acceptance Criteria

1. WHEN accessing paper check-in THEN the system SHALL require admin authentication
2. WHEN a seat number is submitted THEN the system SHALL prevent duplicate check-ins for the same ticket
3. WHEN validation fails THEN the system SHALL display appropriate error messages
4. WHEN a ticket is already checked in THEN the system SHALL show the previous check-in details
5. WHEN network errors occur THEN the system SHALL provide clear feedback and allow retry

### Requirement 6

**User Story:** As an event admin, I want to be able to switch seamlessly between all three check-in modes so that I can adapt to different attendee situations without losing context.

#### Acceptance Criteria

1. WHEN using any check-in mode THEN the system SHALL display navigation tabs for all three modes
2. WHEN switching between modes THEN the system SHALL preserve the selected event and schedule context where applicable
3. WHEN switching from paper to search mode THEN the system SHALL maintain the event/schedule selection
4. WHEN switching from paper to QR mode THEN the system SHALL allow immediate QR scanning
5. WHEN switching modes THEN the system SHALL clear any pending validation or input states