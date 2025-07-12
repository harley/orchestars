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
  * Clicking the button opens a modal (or navigates to `/checkin/events`) with these steps:
    1. **Event & Schedule Selection** – required when checking in by *seat number*.
    2. **Input Field** – accepts *ticket code* **or** *seat number*.
    3. **Search** – queries the backend to fetch matching ticket & attendee details.
    4. **Confirmation Screen** – displays the attendee info with a **“Check-in”** button.
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
  * `src/app/(checkin)/manual/page.client.tsx` – dedicated manual check-in page (lazy-loaded from the scanner).
  * Re-uses shared **feedback** & **history** components from the QR scanner.
  * Uses a **debounced** input for seat/ticket searches to minimise server load.

* **Event & Schedule Context**
  * The selected event & schedule are stored in React context (or URL params) and reused across successive searches.
  * If the admin switches schedule, the context resets to avoid cross-event mistakes.

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

*Manual Check-in* exists in the codebase but requires a regression pass to ensure parity with the new QR Check-in flow (v2 scanner).  Known tasks:

1. **UI polish** – align styling with the new scanner page.
2. **Seat lookup API** – confirm it still resolves correctly after recent schema changes.
3. **Duplicate prevention** – ensure the debounce window is enforced on manual submits.
4. **Analytics flag** – add `manual: true` on `checkinRecords` if missing.

---

## 4. Future Enhancements

* **Bulk Import** – allow uploading a CSV of seat numbers for batch check-in in low-connectivity situations.
* **Offline Mode** – mirror QR-scanner roadmap to enable offline manual entry.
* **Search Suggestions** – auto-complete seat numbers based on partial input.
* **Voice Entry** – explore microphone input for hands-free seat entry. 