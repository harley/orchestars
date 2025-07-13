# Manual Ticket Check-in Feature

## 1. Product Requirements Document (PRD)

### 1.1. Overview

The **Manual Check-in** feature allows event staff to verify and check in attendees without scanning a QR code.  This flow is designed for edge-cases where a QR code is unavailable or unreadable—for example, when a guest only has a seat number or a printed ticket code.  Manual Check-in extends the existing QR Check-in system by providing an input-driven interface that is fast, secure, and resistant to human error.

### 1.2. Goals

* **Fallback:** Provide a reliable alternative when QR scanning fails or the attendee does not have a scannable code.
* **Speed & Accuracy:** Enable staff to locate the correct ticket with minimal keystrokes and prevent duplicate or invalid check-ins.
* **Security:** Restrict manual check-in to authenticated admins and log which admin performed each action.
* **Context Awareness:** Require admins to specify the event *and* schedule (date/time slot) before searching by seat—ensuring the correct ticket is validated.

### 1.3. User Stories

* **As an Event Admin, I want to:**
  * Open a *Manual Entry* form from the `/checkin/scan` page.
  * Select the **Event** and **Schedule/Date** I am working on.
  * Enter either a **Ticket Code** *or* a **Seat Number** to locate an attendee.
  * See the attendee’s name, ticket status, and seat details before final confirmation.
  * Confirm the check-in manually and receive immediate feedback (success, already checked in, invalid).
  * Fall back to QR scanning at any time.

* **As a Ticket Holder, I want to:**
  * Be checked in quickly even if my QR code cannot be scanned.
  * Trust that my ticket cannot be reused after manual check-in.

### 1.4. Functional Requirements

* **Access Control:**
  * Manual Check-in is available only to authenticated admins (same rules as QR scanning).
  * Unauthenticated users are redirected to `/admin/login` and back after login (`?redirect=/checkin/events`).

* **UI & Flow:**
  * A **“Manual Entry”** button sits on the scanner page (`/checkin/scan`).
  * Clicking the button navigates to `/checkin/validates` (or, if no event is selected yet, first to `/checkin/events`) where staff complete these steps:
    1. **Event & Schedule Selection** – required when checking in by *seat number* (the page reads `eventId` and `scheduleId` from the URL and caches them in `localStorage`).
    2. **Tab Selector & Input** – choose **“By Ticket Code”** or **“By Seat”** and type the value.
    3. **Look Up** – triggers a backend validation request; a 2-second client-side throttle prevents accidental double submissions.
    4. **Confirmation Screen / Multi-match List** – shows the visitor details (or a list when multiple tickets share the seat) with a **“Check-in”** button.
  * Clear success (green) or failure (red) feedback overlays similar to the QR flow.
  * The interface re-focuses the input field after each action to streamline multiple entries.

* **Validation & Duplicate Prevention:**
  * The backend must prevent duplicate check-ins (same ticket cannot be checked in twice).
  * A grace window (≈1–2 s) avoids accidental double submits.

* **API Endpoints:**
  * `POST /api/checkin-app/validate/<ticket-code>` – unchanged; used when the input looks like a ticket code.
  * `POST /api/checkin-app/validate-seat` – **new**; payload `{ eventId, scheduleId, seatNumber }` returns the corresponding ticket code if found.
  * `POST /api/checkin-app/checkin/<ticket-code>` – performs the actual check-in.

* **Data & Tracking:**
  * Each manual check-in is stored in `checkinRecords`, with `checkedInBy` linked to the admin.
  * A boolean `manual` flag distinguishes manual vs. QR check-ins for analytics.

---

## 2. Implementation Details

### 2.1. Frontend

* **Route / Component Structure**
  * `src/app/(checkin)/checkin/validates/page.client.tsx` – dedicated manual check-in page (linked from the scanner).
  * Re-uses shared **feedback** & **history** components from the QR scanner.
  * Employs a 2-second client-side **throttle** to prevent duplicate submissions.

* **Event & Schedule Context**
  * The selected event and schedule are passed via URL query parameters (`eventId`, `scheduleId`) and cached in `localStorage` for subsequent searches.
  * Changing the event or schedule clears the cached values to avoid cross-event mistakes.

* **Error Handling**
  * 404 → *Invalid seat/ticket*.
  * 409 → *Already checked in* (show last check-in time/admin).

### 2.2. Backend

* **Seat Lookup Endpoint (`validate-seat`)**
  * Accepts `{ eventId, scheduleId, seatNumber }`.
  * Finds the ticket for the given seat within that schedule.
  * Returns `404` if not found.
  * Otherwise delegates to the existing **validate** logic for consistent responses.

* **Middleware**
  * Existing `src/middleware.ts` covers `/checkin/*`; no changes required.

---

## 3. Current Status

The manual check-in flow is fully functional and aligned with the v2 QR scanner:

* UI parity with the scanner page (responsive dark/light themes) is complete.
* `validate-seat` endpoint and related migration are active in production.
* Duplicate prevention is implemented via a 2-second throttle on both **validate** and **check-in** actions.
* `checkinRecords` now includes a `manual` boolean flag (see migration `20250713_044021_add_manual_column_to_checkin_records.*`) and records `eventDate` and `checkedInBy` for every manual action.

No outstanding tasks for v1; future work is tracked in the *Future Enhancements* section.

---

## 4. Future Enhancements

* **Bulk Import** – allow uploading a CSV of seat numbers for batch check-in in low-connectivity situations.
* **Offline Mode** – mirror QR-scanner roadmap to enable offline manual entry.
* **Search Suggestions** – auto-complete seat numbers based on partial input.
* **Voice Entry** – explore microphone input for hands-free seat entry. 