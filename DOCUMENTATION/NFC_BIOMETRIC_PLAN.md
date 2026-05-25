# Decentralized NFC & Biometric Integration Plan

This plan outlines the architecture for embedding smart scanning capabilities directly into the specific module workflows, while introducing a new Fingerprint biometric confirmation layer.

## Real-World Operation vs. Simulation

**Real-World Intent:** 
In a production environment, the system interacts with hardware via an intermediate driver (like a local Node.js service or browser WebUSB API). 
1. **NFC Card Swipe**: The RFID/NFC reader acts as a "keyboard wedge", instantly typing the ID number followed by an "Enter" keypress. 
2. **Fingerprint**: Once the ID is received, the frontend sends a signal to the attached Biometric Scanner to activate. The scanner reads the physical thumb, matches the hash against the database, and returns a `success` or `failure` response to the frontend.

**Testing Simulation:**
Since we are building the frontend prototype in a standard browser without physical hardware attached:
1. **NFC Simulation:** The system will listen for rapid keyboard typing (simulating a barcode/RFID scanner) to trigger the NFC event. 
2. **Fingerprint Simulation:** We will use a sleek, interactive UI modal that pops up after the NFC scan. Clicking the fingerprint icon will simulate a "Success" read, while clicking a hidden edge or waiting too long could simulate a "Fail" read.

---

## Finalized Business Rules & Decisions

1. **Strict Biometric Enforcement:** If the fingerprint scan fails, access/action is strictly **DENIED**. There is no manual password override allowed during a biometric workflow.
2. **Batch Scanning for Attendance:** Student attendance will support seamless batch scanning. The workflow is hands-free: *Scan Card ➔ Place Thumb ➔ System Auto-marks Present ➔ System instantly resets and waits for the next student in line.* No mouse clicks required.
3. **Legacy Unified Scanner:** The existing `scanner.html` page will **NOT** be rendered obsolete. It will be preserved, modernized, and updated to also support the new Fingerprint confirmation flow as a centralized "Kiosk" option.

---

## Proposed Implementation Details

### 1. Global Biometric Service

Instead of duplicating code, we will build a universal service.

**`js/nfc-biometric-service.js` (NEW)**
- A global JavaScript class that intercepts keyboard-wedge NFC input.
- Contains the UI logic for the floating **Biometric Fingerprint Modal**.
- Exposes a clean API for other pages: `SmartScanner.start({ requireBiometric: true, onSuccess: (user) => {...}, onFail: () => {...} })`.

### 2. Global NFC & Biometric Settings

**`pages/admin/settings/general.html` (or a dedicated settings page)**
- We will add a brand new **"NFC & Biometrics Settings"** tab.
- This tab will contain independent toggle switches for each module:
  - **Student Attendance:** [NFC: ON/OFF] | [Fingerprint: ON/OFF]
  - **Staff Attendance:** [NFC: ON/OFF] | [Fingerprint: ON/OFF]
  - **Library Module:** [NFC: ON/OFF] | [Fingerprint: ON/OFF]
  - **Discipline Module:** [NFC: ON/OFF] | [Fingerprint: ON/OFF]
  - **Bursary Module:** [NFC: ON/OFF] (Fingerprint disabled by default for fee collection)
- These settings will be stored in `localStorage` (or database) and dictate whether the UI shows the "Scan ID" buttons in their respective modules.

---

### 3. Module-Specific Integrations

#### A. Student Attendance (`pages/admin/attendance/student-attendance.html`)
- **Workflow:** NFC Scan ➔ Fingerprint Modal ➔ Auto-select student row ➔ Mark "Present" ➔ **Instantly ready for the next scan (Batch Mode)**.

#### B. Staff Attendance (`pages/admin/attendance/staff-attendance.html` or similar in HR)
- **Workflow:** NFC Scan ➔ Fingerprint Modal ➔ Log staff arrival time automatically.

#### C. Fee Collection (`pages/admin/finance/fee-collection.html`)
- **Workflow:** NFC Scan ➔ Instantly populate student details and outstanding fees. *(No fingerprint required)*.

#### D. Library Issue & Return (`pages/admin/library/issue-return-book.html`)
- **Workflow:** NFC Scan ➔ Fingerprint Modal ➔ Authenticate library member and pull up their current book loans.

#### E. Disciplinary Incident (`pages/admin/discipline/add-incident.html` or `discipline-list.html`)
- **Workflow:** NFC Scan ➔ Fingerprint Modal ➔ Lock the student into the incident report form to ensure accurate logging.

#### F. Unified Kiosk (`pages/admin/attendance/scanner.html`)
- **Workflow:** Update the existing tabs (Gate, Library, Bursar, etc.) to trigger the biometric modal based on the Global Settings before accepting the scan.

---

## Walkthrough of User Experience

1. **Admin Setup:** The admin goes to Settings ➔ NFC Settings and turns ON both NFC and Fingerprint for Student Attendance.
2. **Teacher Action:** A teacher opens the **Student Attendance** page. The "Smart Scanning Active" indicator is visible.
3. **Student Scan:** A student taps their ID card on the reader. The system instantly recognizes the ID and pops up a dark, modern modal saying: *"Student Identified: Ada Okafor. Please place finger on scanner to confirm."*
4. **Biometric Validation:** The student places their thumb (simulated by clicking the fingerprint icon on the modal). 
5. **Success & Loop:** The fingerprint icon scans (pulse animation), turns Green, and the modal disappears. The UI automatically highlights Ada Okafor's row in the attendance list, marks her "Present", and immediately displays "Ready for next scan".
6. **Failure Flow:** If a different student places their thumb, the icon turns Red, buzzes, and displays "Verification Denied." The attendance is NOT marked.
