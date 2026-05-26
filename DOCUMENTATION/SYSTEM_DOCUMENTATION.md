# Noplin School Management System — Full Technical Documentation

> **Version:** 1.0 — Last Updated: May 2026  
> **Scope:** ID Card Module, ID Card Studio, NFC & Biometric Service, Global Settings, and every module where card scanning or fingerprint verification is used.

---

## Table of Contents

1. [ID Card Module — Directory & Binding](#1-id-card-module)
2. [ID Card Studio — Design Engine](#2-id-card-studio)
3. [NFC & Biometric Service (SmartScanner)](#3-nfc--biometric-service)
4. [Global NFC & Biometric Settings](#4-global-nfc--biometric-settings)
5. [Attendance Scanner Kiosk](#5-attendance-scanner-kiosk)
6. [Student Attendance Module](#6-student-attendance-module)
7. [Staff Attendance Module](#7-staff-attendance-module)
8. [Hostel Attendance Module](#8-hostel-attendance-module)
9. [Library Module](#9-library-module)
10. [Technical Architecture Summary](#10-technical-architecture-summary)

---

## 1. ID Card Module

The ID Card Module (`pages/admin/academics/id-cards.html`, powered by `js/id-cards.js`) is the central hub for managing student physical identity cards. It has two main tabs: **Directory** (student list with card binding) and **Studio** (visual card designer). The module handles everything from generating dummy student data to binding real NFC card UIDs to individual student records.

### The Student Directory

When the page loads, it calls it has all student listed there showing the binded card. The NFC UID is the digital fingerprint that links a physical RFID card to a student record.

The directory renders a table where each row shows the student's photo/emoji, ID number, name, class, NFC card status badge (green "NFC linked" or grey "No Card Link"), phone, and blood group. Each row has three action buttons: **Bind Card** (to link an NFC UID), **Edit** (to modify student details), and **Preview** (to see the two-sided card layout).

### Binding an NFC Card to a Student

The "Bind Card" button calls `window.idCardApp.openNfcModal(studentId)`, which opens a modal dialog. Inside this modal, an admin can do one of two things:

1. **Type/paste the NFC UID manually** — The UID field accepts any alphanumeric string representing the RFID chip's hardware ID.
2. **Physically scan the card** — The modal activates a keyboard-wedge listener. When a physical NFC/RFID reader is plugged in (which acts as a keyboard), tapping the card causes the reader to type the UID rapidly and press Enter. The modal intercepts this fast keydown sequence (characters arriving within 50ms of each other) and fills the UID field automatically.

Once confirmed, the UID is saved to that student's object in the `sms_students` localStorage array. Going forward, whenever this student taps their card on any reader in the system, their ID is resolved by matching the scanned UID against this stored value.

### Batch Printing

From the directory, admins can select one or many students using the checkboxes, then click **Print Selected Cards**. This calls `printSelectedCards(students)`, which opens a new browser window containing all selected cards rendered as HTML in CR80 standard dimensions (the size of a real credit/ID card). The browser's native print dialog is triggered automatically after 800ms, allowing the cards to be printed directly to a card printer or cut from A4 sheets.

---

## 2. ID Card Studio

### What It Is

The Studio tab is a real-time visual card design environment. Every change the admin makes — changing the template, toggling fields, switching orientation, uploading a background — is instantly reflected in a live preview of both the front and back of the card.

### Configuration Object

All design decisions are stored in a single JavaScript object called `studioConfig`, which is persisted to `localStorage` under the key `sms_id_card_config`. The object contains:

- **`orientation`** — `'portrait'` or `'landscape'`. Portrait produces a card 230×348px; landscape flips to 348×230px.
- **`templateId`** — A number from 1 to 10 selecting which of the ten built-in design templates to use.
- **`showPhoto`**, **`showDob`**, **`showBlood`**, **`showPhone`** — Boolean toggles that control which data fields appear on the card face.
- **`colorMode`** — Either `'global'` (inherits the school's active theme color) or `'custom'` (uses `cardCustomColor`).
- **`cardCustomColor`** — A hex color string used when `colorMode` is `'custom'`.
- **`showBarcode`** — Boolean. When true, a CSS-rendered QR-code pattern representing the student's ID appears on the card back.
- **`customBackground`** — A base64 data URL of an uploaded image used as the card's background instead of the default watermark pattern.
- **`signatures`** — An array of signature objects, each with a `name`, `title`, and optional `image` (a base64 uploaded signature scan). Multiple signatories (e.g. Principal and Vice-Principal) can be added.
- **`customFields`** — An array of user-defined fields. Each has a `label`, `value`, and `enabled` toggle. Examples might be "Bus Route: Route 4" or "House: Eagle House". Only enabled fields appear on the printed card.
- **`rules`** — A plain-text string displayed on the card back under "Terms and Conditions".

### The Ten Templates

The `renderSingleCard(student, school, side, config)` function is the rendering engine. It is a pure HTML-string generator — it takes a student record and design config, and returns a self-contained HTML string representing one side of the card. The function uses a `switch(templateId)` block with ten cases, each producing a completely different visual layout:

- **Template 1** — Left-aligned header, square photo, classic data table, colored footer with signatures.
- **Template 2** — Geometric skew decorations on header and footer corners; modern angled aesthetic.
- **Template 3** — Pentagon/chevron clip-path hero section; circular photo centered at the bottom edge of the header.
- **Template 4** — Dual-layer triangle divider between header and body; bold structural contrast.
- **Template 5** — Corner accent bars (top-left and bottom-right); minimal white body with high contrast borders.
- **Template 6** — Split-panel layout: colored left panel with school info, white right panel with photo and data.
- **Template 7** — Dark mode card (`#0f172a` background); gradient header with an SVG wave divider; white text throughout.
- **Template 8** — Newspaper/document style; clean top border accent; portrait/landscape adaptive photo zone.
- **Template 9** — Vertical left accent bar in the theme color; minimal white layout; professional government-style.
- **Template 10** — Dark background with gold (`#fbbf24`) accents; premium executive look.

Every template is fully responsive to both portrait and landscape orientation and adapts its layout using `flexDir` (either `'column'` or `'row'` depending on orientation).

### Color System

The `getThemeColor()` function is called during every render. It first checks if `colorMode` is `'custom'` and returns the custom hex if so. Otherwise, it reads the `selectedTheme` key from localStorage and maps theme names (`'blue'`, `'green'`, `'purple'`, `'gold'`, `'navy-blue'`, etc.) to their corresponding hex values. This means changing the school's global theme color in Settings automatically updates all card previews and printed cards.

### School Watermark

Every card front has a subtle watermark: the school name is rendered diagonally across the card at very low opacity using an inline SVG pattern set as a CSS `background-image`. The pattern tiles across the card, and the opacity adjusts between light (6%) and dark (2.5%) depending on whether the card uses a light or dark background theme.

---

## 3. NFC & Biometric Service

### Overview

The NFC & Biometric Service is implemented in `js/nfc-biometric-service.js` and creates a global singleton `window.SmartScanner` — an instance of the `SmartScannerService` class. This single object is the universal authentication gateway for every scan-gated action in the system. No module handles raw card reading on its own; they all delegate to `SmartScanner`.

### The Modal Interface

When `SmartScanner` initializes, it injects a full-screen overlay modal into the document body (only once, preventing duplicates). This modal has:

- A **title bar** that changes based on the current scanning state.
- A **large circular icon area** (`scanner-icon-container`) that animates differently for each state.
- A **status message** line below the icon.
- A **Demo Simulator** section (visible for testing without physical hardware) containing a text input and Pass/Fail buttons.
- A **Cancel/Close** button that calls `SmartScanner.stop()`.

### Scanning States

The scanner modal cycles through distinct visual states:

**NFC State** (`state-nfc`): The icon shows a card symbol (`fa-id-card`) in blue, with a continuous pulsing ring animation. The status message reads "Awaiting Card Scan...". The simulator input is visible, labeled "Enter ID and press Enter". This is the initial state when a module opens the scanner.

**Biometric State** (`state-bio`): Triggered after a successful card scan (when biometric is required). The icon switches to a fingerprint symbol (`fa-fingerprint`) in purple. The card ID is displayed below the title. Status reads "Place finger on scanner". The simulator now shows "Pass Bio" and "Fail Bio" buttons.

**Scanning Animation**: When the fingerprint icon is clicked (simulating a thumb press), the `scanning` CSS class adds a moving gradient line that sweeps top-to-bottom across the icon, simulating a laser biometric scan. This animation lasts 1.2 seconds.

**Success State**: The icon turns green with a checkmark (`fa-check`). Status reads "Match Confirmed". After 1 second, the `onSuccess` callback is fired with the scanned ID, and the modal resets to NFC state ready for the next scan.

**Fail State**: The icon turns red and shakes (CSS `shake` keyframe animation). Status reads "Verification Denied" in red. After 1.5 seconds, the `onFail` callback is called and the modal resets to NFC state.

**Fingerprint-First Mode**: When NFC is disabled in settings but biometric is enabled, the modal enters a special mode where the attendant manually types the person's ID, presses Enter, and then the fingerprint verification proceeds normally. This allows biometric authentication even without NFC hardware.

### The API

Any module in the system starts a scan session by calling:

```javascript
window.SmartScanner.start({
  requireNFC: true, // whether to show NFC card step
  requireBiometric: true, // whether to require fingerprint after card scan
  onSuccess: (scannedId) => {
    /* handle verified ID */
  },
  onFail: () => {
    /* handle rejection */
  },
});
```

To stop and dismiss the modal:

```javascript
window.SmartScanner.stop();
```

### Keyboard-Wedge Interceptor

In production, physical RFID readers behave as "keyboard wedge" devices — they type the card's UID as if it were keyboard input, then press Enter. The `handleKeyDown(event)` method is attached to `document` while the scanner is active. It buffers incoming keystrokes that arrive within 50ms of each other (the speed of a scanner, not a human typist). When Enter is received and the buffer has more than 2 characters, it treats the buffer as the scanned UID and calls `processNFCScan()`.

For manual/simulation entry, the visible text input inside the modal accepts the same input — typing an ID and pressing Enter triggers the same `processNFCScan()` path.

### Forced Direction Scanning

In attendance modules, the admin can click "Set As Clock-In Now" or "Set As Clock-Out Now". These buttons set a `forcedScanDirection` variable (`'in'` or `'out'`) before calling `SmartScanner.start()`. When the scan succeeds, the attendance handler checks this variable: if it is `'in'`, the session time-in is forcibly updated regardless of prior state; if `'out'`, the time-out is updated. After processing, `forcedScanDirection` is reset to `null` so subsequent scans return to the normal auto-detect mode (first scan = clock in, second scan = clock out).

---

## 4. Global NFC & Biometric Settings

### Settings Page

The NFC and biometric settings are managed from `pages/admin/settings/nfc.html`, controlled by the JavaScript in `js/settings.js`. The page presents a set of module cards, each with two toggle switches: one for NFC and one for Biometric/Fingerprint. The modules covered are:

| Module                   | NFC Toggle | Biometric Toggle |
| ------------------------ | ---------- | ---------------- |
| Student Attendance       | ✅         | ✅               |
| Staff Attendance         | ✅         | ✅               |
| Hostel Attendance        | ✅         | ✅               |
| Library                  | ✅         | ✅               |
| Discipline               | ✅         | ✅               |
| Bursary / Fee Collection | ✅         | ❌ (always off)  |

The Bursary module never requires biometric verification by design — fee lookups are informational, not access-gated.

### Storage Structure

Settings are saved to `localStorage` under the key `sms_nfc_config` as a JSON object:

```json
{
  "studentAttendance": { "nfc": true, "bio": true },
  "staffAttendance": { "nfc": true, "bio": false },
  "hostelAttendance": { "nfc": true, "bio": true },
  "library": { "nfc": true, "bio": true },
  "discipline": { "nfc": false, "bio": true },
  "bursary": { "nfc": true, "bio": false }
}
```

When the "Save Settings" button is clicked, `window.saveNFCSettings()` reads all toggle states, constructs this object, and writes it to localStorage. A toast notification confirms: **"Settings saved"**.

### How Modules Read Settings

Every module that uses scanning reads its own configuration slice during initialization. For example, in `attendance.js`:

```javascript
const raw = localStorage.getItem("sms_nfc_config");
nfcConfig = raw
  ? JSON.parse(raw).studentAttendance || { nfc: true, bio: true }
  : { nfc: true, bio: true };
```

The Scan Card button's state is then derived from this:

- If both NFC and biometric are off → button is **disabled** (visible but greyed out, cannot be clicked).
- If NFC is off but biometric is on → button is **enabled**, but scanner opens in fingerprint-first mode.
- If NFC is on → button is **enabled**, scanner waits for card tap first.

This means disabling NFC in settings never hides the scan button — it only changes what happens when you press it. Hiding the feature entirely requires both to be disabled.

### Attendance Schedule Settings

The same settings page also manages attendance timing rules, stored in `localStorage` under `sms_attendance_config`:

```json
{
  "student": {
    "startTime": "07:00",
    "lateThreshold": "08:15",
    "expectedOut": "14:00"
  },
  "staff": {
    "startTime": "06:30",
    "lateThreshold": "07:45",
    "expectedOut": "15:00"
  }
}
```

These thresholds are read by the `computeStatus()` function in each attendance module to classify records:

- Clock-in before `lateThreshold` → **Present**
- Clock-in after `lateThreshold` → **Late**
- Clock-out before `expectedOut` → **Early Out**
- No clock-in → **Absent**
- Manual override set → **Absent** or **Leave** (overrides computed status)

---

## 5. Attendance Scanner Kiosk

### What It Is

The Scanner Kiosk (`pages/admin/attendance/scanner.html`, powered by `js/attendance-scanner.js`) is a standalone touchscreen-optimized kiosk interface. It is the "always-on" station — a single screen that handles multiple access types from one place, switching between modes via a tab bar.

### Modes

The kiosk operates in six modes, switchable via `window.nfcScannerApp.switchMode(mode)`:

- **Student Attendance (formerly "Gate Entrance")** — Logs student campus entry with on-time/late status.
- **Hostel** — Hostel check-in/out logging.
- **Staff Clock-In** — Staff arrival time logging with lateness detection.
- **Library Desk** — Member verification; shows their current borrowed books.
- **Bursary** — Pulls up the student's outstanding fee balance instantly.
- **Disciplinary** — Verifies student identity; shows their open incident count and links to log a new incident.

### Mode Switching and Settings Enforcement

When a mode tab is clicked, `switchMode()` immediately reads `sms_nfc_config` from localStorage and extracts the NFC and biometric flags for that specific mode. It then calls `SmartScanner.stop()` followed by `SmartScanner.start()` with the freshly-read configuration. This means the biometric requirement updates in real-time as the admin switches tabs — no page reload required.

If both NFC and biometric are disabled for the selected mode, the kiosk shows a "Scanner Disabled" notice with a link to the Settings page rather than starting the scanner.

### Sound Feedback

The kiosk uses the Web Audio API (no external sound files needed) to synthesize audio feedback:

- **Success** — A pleasant two-note ascending tone (C5 to A5, sine wave).
- **Error** — A harsh dual detuned sawtooth buzz simulating an access-denied alarm.

Sound can be toggled on/off by the operator using the mute button.

### Simulator Sidebar

For testing without physical hardware, the kiosk has a sidebar simulator that lists all students and staff. Each entry has a "Tap Card" button that calls `mockScan(uid)`, which feeds the UID directly into the active SmartScanner session — triggering the full scan flow including biometric verification if required by the current mode's settings.

### Manual Search Override

A manual search field allows the operator to type a student name or ID. Matching results appear as a dropdown. Clicking a result triggers `triggerManualScan()`, which bypasses the card reader requirement and processes the student directly — useful when a student forgets their card.

### Web NFC (Mobile)

For Android devices using Chrome, the kiosk attempts to activate the `NDEFReader` Web NFC API on startup. If the device supports it, holding a physical NFC card near the phone/tablet triggers a real hardware read, extracting the card's serial number and feeding it into `processScannedCard()`.

### Scan Ledger

Every scan — successful or failed — is logged to an in-memory `recentScans` array (up to the last 15 entries) and rendered as a live feed in the right panel. Each entry shows the person's name, action description, timestamp, and a colored status icon.

---

## 6. Student Attendance Module

### Overview

The Student Attendance module (`pages/admin/attendance/student-attendance.html`, `js/attendance.js`) manages daily class attendance for students. It follows a strict **NFC/Biometric-first** philosophy: no times can be manually typed. All clock-in and clock-out timestamps are written exclusively by scanner events.

### Loading Attendance

The admin selects a date and optionally filters by class and section, then submits the filter form. The JavaScript polls `window.SchoolDatabase` (loaded asynchronously) every 50ms until available, then filters the student array and renders one table row per student.

### Session Data Model

Attendance data is stored in `localStorage` under the key `sms_student_att_sessions`. Each session is keyed as `YYYY-MM-DD_STUDENTID`:

```json
{
  "2026-05-26_STU001": {
    "timeIn": "07:45",
    "timeOut": "14:10",
    "override": "",
    "remark": "Arrived via school bus",
    "status": "Present"
  }
}
```

### Table Structure

Each row shows: a checkbox, student ID, photo, name, a read-only **Clock-In** time span (green when set, grey dash when absent), a read-only **Clock-Out** time span (blue when set, grey dash when absent), an auto-computed status badge, and a free-text remarks field. There are no editable time inputs — the time spans are updated exclusively by the system.

### Row Selection and Action Bar

Clicking anywhere on a row toggles its checkbox. Selecting rows reveals the selection info bar showing how many rows are selected, with "Select All" and "Deselect All" shortcuts. The four action buttons at the top operate differently based on type:

**Set As Clock-In Now** and **Set As Clock-Out Now**: These do NOT directly write times. Instead, they set an internal `forcedScanDirection` flag and then call `startAttendanceNFC()`, opening the SmartScanner modal. The person must physically scan their card (and complete fingerprint verification if enabled in settings). Only after a successful verified scan does the system write the current time to that person's session. If the direction is forced to `'in'`, it updates `timeIn` regardless of whether they previously clocked in. If forced to `'out'`, it updates `timeOut`.

**Mark As Absent** and **Mark As Leave**: These require at least one row to be selected. They do NOT require any scan. They directly write `override: 'Absent'` or `override: 'Leave'` to the selected rows' sessions, clear any existing times, and update the status badge. This is an administrative override — used by the teacher to record pre-authorized absences or approved leave without the student being physically present.

### Status Computation

The `computeStatus(timeIn, timeOut, schedule, override)` function is the decision engine. It is called every time a session is rendered or updated. The hierarchy is: override → times → schedule thresholds. A manual override always wins. If no override, presence of `timeIn` determines attendance; its value relative to `lateThreshold` determines whether the student is Present or Late; `timeOut` relative to `expectedOut` determines Early Out.

### NFC Scan Flow

When the "Scan Card" button (or one of the forced-direction buttons) is clicked:

1. The button changes to a "Scanning..." spinner with a green pulse animation.
2. `SmartScanner.start()` is called with the student attendance NFC/biometric configuration.
3. The SmartScanner modal appears.
4. The student taps their card. The keyboard-wedge interceptor captures the UID.
5. If biometric is required, the fingerprint modal step appears.
6. On success, `handleScan(scannedId)` is called. It finds the student, determines the direction (forced or auto), writes the time, saves to localStorage, updates the row display in-place, and shows the scan result banner for 7 seconds.
7. The scanner resets automatically for the next card tap — no button click needed.

### Scan Result Banner

A colored banner appears above the table after each scan showing: direction emoji (🟢 in, 🔵 out), the student's name, the time, their computed status badge, and a summary of both clock-in and clock-out times. It auto-hides after 7 seconds.

### Reset Day

A "Reset Day" button calls `resetTodayAttendance()`, which prompts for confirmation, then deletes all session keys that start with the currently-selected date prefix. The table re-renders showing empty times for all students.

### Save

The Save button flushes all remarks from the text inputs into the session store, then shows a success toast. A "Save & Print" variant triggers the browser print dialog after saving.

---

## 7. Staff Attendance Module

### Overview

The Staff Attendance module (`pages/admin/attendance/staff-attendance.html`, `js/staff-attendance.js`) mirrors the Student Attendance architecture but targets teaching and non-teaching staff. Sessions are stored under `sms_staff_att_sessions`.

### Key Differences from Student Attendance

The schedule thresholds for staff are different by default: `startTime: '06:30'` and `lateThreshold: '07:45'` and `expectedOut: '15:00'`, reflecting that staff typically arrive before students. The NFC configuration reads from `sms_nfc_config.staffAttendance` rather than `studentAttendance`.

Each staff row shows the staff member's department/subject in addition to their name and ID. The NFC scan button is labeled "Scan Card" and triggers `startStaffNFC()`, which references `staffNfcConfig` and the staff module's `forcedScanDirection`. The bulk action buttons ("Set As Clock-In Now", "Set As Clock-Out Now", "Mark As Absent", "Mark As Leave", "Reset Day") work identically to the student module.

Staff clock-out requires the same biometric verification as clock-in — the physical scan enforces accountability for both entry and exit times.

---

## 8. Hostel Attendance Module

### Overview

The Hostel Attendance module is embedded within the broader Hostel Management page (`js/hostel.js`, `pages/admin/hostel/attendance.html`). It manages the daily check-in and check-out of students residing in school hostels. Sessions are stored under `sms_hostel_att_sessions`.

### Hostel-Specific Context

Unlike class attendance which is class-scoped, hostel attendance is allocation-scoped — each record maps to a student's room allocation (including their room number and hostel name). The filter allows narrowing by specific hostel building before loading residents.

### Status Labels

Rather than "Present/Late/Early Out", hostel attendance uses labels that reflect physical movement:

- **Checked In** — Student has entered the hostel (timeIn recorded).
- **Checked Out** — Student has left the hostel (timeOut recorded).
- **Absent** — No check-in recorded or manually marked absent.
- **Leave** — Manually marked as approved leave (student not expected in hostel).

### NFC Integration

The NFC configuration reads from `sms_nfc_config.hostelAttendance`. The scan button calls `startHostelNFC()`. A `forcedHostelDir` variable controls forced direction scanning, mirroring the student and staff modules. The scan result updates the row in-place. The `updateRowDisplay()` function updates the time spans and status badge without re-rendering the entire row.

### Administrative Actions

The same four-button pattern applies: "Set As Check-In Now" and "Set As Check-Out Now" require scanner verification. "Mark As Absent" and "Mark As Leave" are admin-direct actions requiring only row selection. "Reset Day" clears all hostel sessions for the selected date.

---

## 9. Library Module

### Overview

The Library module (`js/library.js`) uses NFC/biometric scanning for member verification at the issue/return desk. Its configuration reads from `sms_nfc_config.library`.

### How It Works in the Kiosk

When the Kiosk is in Library mode, scanning a student's card calls `processScannedCard()` which queries `window.SchoolDatabase.libraryTransactions` for that student's active loans. The result panel shows each borrowed book title, due date, and whether it is overdue (highlighted red). A "Go to Issue/Return Desk" button navigates to the detailed issue/return page with the student pre-selected.

### Discipline Module

The Discipline module reads from `sms_nfc_config.discipline`. Scanning a student's card in Disciplinary mode shows their incident history (total incidents, open cases) and provides a one-click button to log a new incident with the student's ID pre-filled.

---

## 10. Technical Architecture Summary

### Data Flow

```
Physical Card Tap / Manual Entry
         ↓
SmartScanner.handleKeyDown() [keyboard-wedge interceptor]
         ↓
SmartScanner.processNFCScan(uid)
         ↓
   [requireBiometric?]
    YES ↓           NO ↓
setBioState()    showSuccessAndNext()
         ↓              ↓
simulateFingerprint()   onSuccess(uid)
         ↓
showSuccessAndNext()
         ↓
onSuccess(uid) [module callback]
         ↓
Module updates session → localStorage → UI re-render
```

### LocalStorage Keys Reference

| Key                        | Content                                       |
| -------------------------- | --------------------------------------------- |
| `sms_students`             | Full student array with NFC UIDs              |
| `sms_id_card_config`       | ID Card Studio design settings                |
| `sms_nfc_config`           | NFC & biometric toggles per module            |
| `sms_attendance_config`    | Schedule thresholds (late time, expected out) |
| `sms_student_att_sessions` | Student daily clock-in/out sessions           |
| `sms_staff_att_sessions`   | Staff daily clock-in/out sessions             |
| `sms_hostel_att_sessions`  | Hostel daily check-in/out sessions            |
| `sms_school_profile`       | School name, address, logo                    |
| `selectedTheme`            | Active UI theme name                          |

### Security Design Principles

1. **No manual time entry** — All timestamps are generated exclusively by `new Date().toTimeString().slice(0,5)` inside verified scanner callbacks. There is no `<input type="time">` on any attendance page.
2. **Biometric cannot be bypassed** — If biometric is enabled, `onSuccess` is only fired after `simulateFingerprint(true)` completes. In production with real hardware, this maps to a confirmed fingerprint match from the biometric device.
3. **Administrative overrides are audit-distinct** — Absent and Leave are set via `session.override`, a separate field from `timeIn`/`timeOut`. This preserves the audit trail: an admin marking "Absent" is distinguishable from a student simply not scanning.
4. **Session data is date-keyed** — Keys like `2026-05-26_STU001` ensure that editing today's attendance never corrupts historical records.
5. **Forced direction resets after one scan** — `forcedScanDirection = null` is always called immediately after processing, ensuring no scan is silently misdirected.

### Production Deployment Notes

The current implementation uses `localStorage` as its persistence layer, suitable for single-device prototyping. In a production multi-station deployment:

- `sms_student_att_sessions`, `sms_staff_att_sessions`, and `sms_hostel_att_sessions` must be replaced with API calls to a central database (e.g. POST to `/api/attendance/record`).
- The `SmartScanner` keyboard-wedge interceptor should be supplemented with a local WebSocket or USB-HID driver bridge to handle concurrent multi-reader stations.
- The biometric simulation (clicking the fingerprint icon) must be replaced with a real SDK callback from the attached fingerprint device (e.g. via a local Node.js agent exposing a WebSocket endpoint).
- NFC UIDs stored in `sms_students` must be synchronized to the backend student table so any workstation can resolve a scan without relying on its local localStorage.
