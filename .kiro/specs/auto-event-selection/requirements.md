# Requirements Document

## Introduction

The **Auto Event Selection** feature enhances the paper check-in workflow by automatically selecting the appropriate event and schedule based on the current date, eliminating the need for event admins to manually select events during busy check-in periods. This feature prioritizes convenience and speed while maintaining the ability to manually override the selection when needed.

## Requirements

### Requirement 1

**User Story:** As an event admin, I want the paper check-in system to automatically select today's event so that I can start checking in attendees immediately without navigating through event selection.

#### Acceptance Criteria

1. WHEN an admin accesses the paper check-in page THEN the system SHALL check if there is an event with a schedule matching today's date
2. WHEN a matching event is found THEN the system SHALL automatically select that event and schedule
3. WHEN the event is auto-selected THEN the system SHALL display the paper check-in interface immediately without requiring manual event selection
4. WHEN multiple events have schedules for today THEN the system SHALL redirect to manual event selection
5. WHEN no events match today's date THEN the system SHALL redirect to manual event selection as currently implemented

### Requirement 2

**User Story:** As an event admin, I want to be able to change the auto-selected event so that I can handle situations where multiple events are happening or I need to check in for a different date.

#### Acceptance Criteria

1. WHEN an event is auto-selected THEN the system SHALL display a "Change event" link prominently
2. WHEN the "Change event" link is clicked THEN the system SHALL navigate to the event selection page with paper mode context
3. WHEN returning from manual event selection THEN the system SHALL respect the manually selected event over auto-selection
4. WHEN the page is refreshed after manual selection THEN the system SHALL maintain the manually selected event until the next day
5. WHEN a new day begins THEN the system SHALL reset to auto-selection behavior for the new date

### Requirement 3

**User Story:** As an event admin, I want the auto-selection to work reliably across different time zones and date formats so that the system works correctly regardless of server or client location.

#### Acceptance Criteria

1. WHEN determining today's date THEN the system SHALL use the Vietnam timezone (Asia/Ho_Chi_Minh) for consistency
2. WHEN comparing event schedule dates THEN the system SHALL normalize both current date and schedule dates to the same timezone
3. WHEN schedule dates are stored in different formats THEN the system SHALL handle date parsing consistently
4. WHEN the system clock changes (daylight saving, etc.) THEN the auto-selection SHALL continue to work correctly
5. WHEN schedule dates span multiple days THEN the system SHALL match based on the schedule's primary date field

### Requirement 4

**User Story:** As an event admin, I want the system to handle multiple events gracefully by directing me to manual selection so that I can choose the correct event when there are multiple options.

#### Acceptance Criteria

1. WHEN multiple events have schedules for today THEN the system SHALL redirect to manual event selection
2. WHEN redirecting to manual selection THEN the system SHALL provide context about why auto-selection was not possible
3. WHEN in manual selection mode THEN the system SHALL highlight today's events for easy identification
4. WHEN only one event has a schedule for today THEN the system SHALL auto-select that event and its today's schedule
5. WHEN an event has multiple schedules for today THEN the system SHALL select the first schedule found for that date

### Requirement 5

**User Story:** As an event admin, I want the auto-selection to provide clear feedback about which event was selected so that I can quickly verify I'm working with the correct event.

#### Acceptance Criteria

1. WHEN an event is auto-selected THEN the system SHALL display a clear indicator that auto-selection occurred
2. WHEN displaying the auto-selected event THEN the system SHALL show the event title, date, and time prominently
3. WHEN auto-selection fails THEN the system SHALL display a clear message explaining why manual selection is required
4. WHEN multiple events were available THEN the system SHALL indicate that other events are available for selection
5. WHEN the selected event changes THEN the system SHALL provide visual feedback confirming the change

### Requirement 6

**User Story:** As an event admin, I want the auto-selection to work seamlessly with the existing paper check-in workflow so that all other functionality remains unchanged.

#### Acceptance Criteria

1. WHEN an event is auto-selected THEN all existing paper check-in functionality SHALL work identically
2. WHEN switching between check-in modes (QR, Paper, Search) THEN the auto-selected event context SHALL be preserved
3. WHEN using manual event selection THEN the existing event selection interface SHALL remain unchanged
4. WHEN localStorage contains previous selections THEN the system SHALL respect manual selections over auto-selection
5. WHEN the auto-selection feature is disabled THEN the system SHALL fall back to the current manual selection behavior

### Requirement 7

**User Story:** As an event admin, I want the auto-selection to handle edge cases gracefully so that the system remains reliable during unusual scenarios.

#### Acceptance Criteria

1. WHEN the system cannot determine today's date THEN it SHALL fall back to manual event selection
2. WHEN event data is unavailable or corrupted THEN the system SHALL display an appropriate error and allow manual selection
3. WHEN network connectivity is poor THEN the system SHALL use cached event data if available
4. WHEN an auto-selected event becomes unavailable THEN the system SHALL detect this and prompt for re-selection
5. WHEN system time is significantly incorrect THEN the system SHALL still allow manual override of auto-selection