# Result Engine V2 — Complete Rebuild Plan

This plan covers the full reconstruction of the result/grading engine to meet all 18 client requirements. It touches settings, student management, fee management, attendance integration, the result generation pipeline, template rendering, and publish controls.

---

## Current State Analysis

After auditing all 16+ files in the result pipeline, here is what currently exists vs. what the client demands:

| Feature | Current State | Client Requirement |
|---|---|---|
| **Admission Number** | ❌ Does not exist. Only `student.id` and `roll` | Separate Admission/Reg No, auto-generated with school prefix, importable via CSV |
| **Position (Arm)** | ✅ Exists as `rec.position` ("1st out of 10") | Keep — this is "Position in Arm" |
| **Position (Overall/Class)** | ⚠️ Mocked as `rec.sectionPosition` with fake data | Must calculate across ALL arms in the same class level |
| **Subject Position** | ✅ Exists — calculated per subject in `result-sheets.js` | Keep and ensure it appears on the template |
| **Highest/Lowest per Subject** | ✅ Exists — calculated per subject | Keep |
| **Total & Average Score** | ✅ `grandTotal` and `average` exist | Keep |
| **Subjects Offered (count)** | ❌ Not tracked | Must show count of subjects the individual student offered |
| **Grade Tally (6As, 4Cs…)** | ❌ Not computed | Must compute and display on result sheet + master sheet |
| **Pass/Fail Status (Term)** | ❌ No per-term pass/fail | Admin-configurable: min average + required subjects |
| **Promoted/Not Promoted (3rd Term)** | ⚠️ Basic promotion logic in `promote-students.js` | Must integrate cumulative 3-term average, configurable threshold |
| **Attendance on Result** | ⚠️ Manual input only (`rs-times-opened`, per-student override) | Must auto-pull from NFC attendance data; auto-compute school days from term dates |
| **QR Code** | ❌ Not implemented | Must generate a QR code on each result sheet |
| **School Fees on Result** | ⚠️ Hardcoded 4 fields (Tuition, Equipment, Library, Sports) | Must be fully dynamic: admin creates/edits fee items, attaches to classes, toggles visibility |
| **Key to Grades** | ⚠️ Exists in `gradeBoundariesData` but NOT rendered on all templates | Must be pulled and displayed on result sheet |
| **Teacher/Head/Principal Comment** | ✅ Exists (capability-gated per template) | Keep |
| **Signatories, Logo, School Info** | ✅ Pulled from `sms_school_profile` + `globalResultSettings` | Keep — ensure all templates use this |
| **Student Photo on Result** | ⚠️ Uses avatar fallback | Keep and ensure real photo from student record |
| **Next Term Begins / Closing Date** | ⚠️ Partially exists (resumption, closingDate) | Must be properly labeled and always shown |
| **Publish/Unpublish Results** | ❌ Does not exist | Admin can toggle result visibility per class/term for student/parent portal |
| **Notice** | ✅ Separate notices module exists | User confirmed: keep separate, not on result. Just ensure notice CRUD works |

---

## Important Notes For Review

### Fee Structure Migration
The new dynamic fee system will replace the current hardcoded 4-field bill system. Once built, old `globalResultSettings.bills` data will be migrated to the new `sms_fee_items` structure automatically.

### Admission Number Format
Proposed format is `[PREFIX]/[YEAR]/[AUTO_INCREMENT]` (e.g., `NPS/2025/001`). The prefix, year, and starting number will be configurable in settings. Schools with existing admission numbers can import them via CSV and they will override the auto-generated ones for those students.

### Scope Warning
This is a major rebuild spanning ~30 files. The work will be phased to avoid breaking the existing system. Each phase produces a working state.

---

## Phase 1: Admission Number System

This introduces the `admissionNo` field into the student data model, with auto-generation logic and CSV import support.

---

### [MODIFY] `js/settings.js`

Add a new **"Admission Number Format"** configuration section to the global settings or the NFC settings page. New fields:
- `admissionPrefix` (text, e.g., `NPS`)
- `admissionYearFormat` (select: `YYYY` or `YY`)
- `admissionStartNumber` (number, e.g., `001`)
- `admissionAutoGenerate` (toggle: on/off)

Saved to localStorage key: `sms_admission_config`

```js
// Schema
{
  prefix: "NPS",
  yearFormat: "YYYY", // or "YY"
  startNumber: 1,
  autoGenerate: true
}
```

### [MODIFY] `js/add-student.js`

- Add an `admissionNo` field to the student creation form.
- If `autoGenerate` is on, pre-fill the field with the next available number based on the prefix format.
- If `autoGenerate` is off, leave it blank for manual input.
- The field should be editable regardless (for legacy number overrides).

### [MODIFY] `js/students-list.js`

- Add an **"Adm. No"** column to the students table, between the Name and Student ID columns.
- Update the CSV export to include the `admissionNo` column.

### [MODIFY] `js/import-users.js`

- Update the student CSV template to include an `Admission Number` column.
- When importing, map the `Admission Number` column to `student.admissionNo`.
- If the CSV has admission numbers, use those. If blank, auto-generate.

---

## Phase 2: Dynamic Fee Manager

Replace the hardcoded 4-field bills system with a fully dynamic, class-aware fee item manager.

---

### [NEW] `js/fee-items-manager.js`

A complete CRUD module for managing school fee items. Provides:
- **Add Fee Item:** Title (text), Amount (number), Attached Classes (multi-checkbox), Show on Result (toggle)
- **Edit Fee Item:** All fields editable
- **Delete Fee Item:** With confirmation
- **List View:** Table showing all fee items with class assignments and result visibility toggle

```js
// localStorage key: 'sms_fee_items'
// Schema
[
  {
    id: "FEE-001",
    title: "Tuition Fee",
    amount: 50000,
    classes: ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"],
    showOnResult: true
  },
  {
    id: "FEE-002",
    title: "Laboratory Fee",
    amount: 15000,
    classes: ["SS1", "SS2", "SS3"],
    showOnResult: true
  },
  {
    id: "FEE-003",
    title: "Hostel Fee",
    amount: 80000,
    classes: ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"],
    showOnResult: false
  }
]
```

### [NEW] `pages/admin/finance/fee-items-manager.html`

A new admin page for the fee items CRUD UI. Accessible from the Finance sidebar section.

### [MODIFY] `js/result-settings.js`

- Remove the hardcoded `rs-bill-tuition`, `rs-bill-equipment`, `rs-bill-library`, `rs-bill-sports` fields.
- Replace with a read-only summary showing fee items that have `showOnResult: true` (pulled from `sms_fee_items`).
- Link to the Fee Items Manager page for editing.

### [MODIFY] `pages/admin/academics/grading/result-settings.html`

- Replace the hardcoded School Bills section with a dynamic section that reads from `sms_fee_items`.

---

## Phase 3: Term Dates & Attendance Auto-Calculator

Replace manual "Times Opened" input with an automatic computation engine.

---

### [MODIFY] `js/settings.js` or `js/result-settings.js`

Add **Term Calendar Configuration** to the global settings (under the attendance/NFC settings page, or a new dedicated section in result settings). Fields:
- `termStartDate` (date picker)
- `termEndDate` (date picker)
- `holidays` (multi-date picker or list of dates to exclude)

Auto-compute: `schoolDaysOpened = weekdays between start and end, minus holidays, minus weekends`

```js
// localStorage key: 'sms_term_calendar'
{
  termStartDate: "2025-01-13",
  termEndDate: "2025-04-11",
  holidays: ["2025-02-14", "2025-03-21"],
  computedSchoolDays: 58
}
```

### [MODIFY] `js/templates/template-registry.js`

Update `buildPrintPayload()` to:
- Pull `timesOpened` from the computed `sms_term_calendar.computedSchoolDays`
- Pull individual student's `timesPresent`, `timesAbsent`, `timesLate`, `timesEarly` from the NFC attendance session data (`sms_student_att_sessions`)
- Compute: `timesPresent = count of days where student has a clock-in record`
- Compute: `timesAbsent = timesOpened - timesPresent`

New payload fields:
```js
attendance: {
  timesOpened: 58,
  timesPresent: 55,
  timesAbsent: 3,
  timesLate: 2,
  timesEarly: 50
}
```

---

## Phase 4: Promotion & Pass/Fail Rule Engine

Build a configurable rule engine for term pass/fail and 3rd-term promotion logic.

---

### [NEW] `js/promotion-rules.js`

A dedicated rule configuration module. Provides:

**Term Pass/Fail Rule (1st & 2nd Term):**
- Minimum average % to pass (default: 40%)
- Optional: List of mandatory subjects that must be passed individually (e.g., Maths + English)
- Per-class override (e.g., JSS classes may have different thresholds than SS)

**3rd Term Promotion Rule:**
- Uses cumulative 3-term average (T1 + T2 + T3) / 3
- Minimum cumulative average % (default: 40%)
- Optional: Must pass specific subjects across all 3 terms
- Per-class override

```js
// localStorage key: 'sms_promotion_rules'
{
  termPassFail: {
    defaultMinAverage: 40,
    mandatorySubjects: ["Mathematics", "English Language"],
    perClassOverrides: {
      "SS3": { defaultMinAverage: 45, mandatorySubjects: ["Mathematics", "English Language", "Physics"] }
    }
  },
  thirdTermPromotion: {
    useCumulativeAverage: true,
    defaultMinAverage: 40,
    mandatorySubjects: ["Mathematics", "English Language"],
    perClassOverrides: {}
  }
}
```

### [MODIFY] `pages/admin/academics/grading/result-settings.html`

Add a new **"Pass/Fail & Promotion Rules"** section to the Result Settings page with:
- Min average input
- Multi-select for mandatory subjects
- Per-class override accordions
- Toggle for "Use cumulative 3-term average for 3rd term promotion"

### [MODIFY] `js/promote-students.js`

- Replace the simple `localStorage.getItem('sms_promotion_rule')` single-number logic with the full rule engine from `sms_promotion_rules`.
- Calculate pass/fail per student based on actual subject scores + mandatory subjects.

---

## Phase 5: Result Engine Core — Dual Position, Grade Tallies, Subjects Offered

This is the heart of the rebuild. All computation changes happen here.

---

### [MODIFY] `js/result-sheets.js`

**Major changes to `loadBroadsheet()`:**

1. **Dual Position Ranking:**
   - `armPosition`: Rank within the specific arm (e.g., "3rd out of 40 in JSS1-A")
   - `overallPosition`: Rank across ALL arms of the same class level (e.g., "12th out of 150 in JSS1")
   - To calculate overall position: aggregate all students from ALL sections of the selected class (e.g., JSS1-A + JSS1-B + JSS1-C), sort by grand total, assign positions.
   - The toggle for showing arm vs. overall position (or both) will be in result settings.

2. **Grade Tally Computation:**
   ```js
   // For each student, count grades
   rec.gradeTally = { A: 0, B: 0, C: 0, D: 0, F: 0 };
   rec.subjects.forEach(sub => {
     const g = sub.grade.charAt(0); // "A1" → "A"
     if (rec.gradeTally[g] !== undefined) rec.gradeTally[g]++;
   });
   // Output: "6As, 4Bs, 2Cs, 1F"
   ```

3. **Subjects Offered Count:**
   ```js
   rec.subjectsOffered = rec.subjects.length;
   ```

4. **Term Pass/Fail Status:**
   - Pull rules from `sms_promotion_rules`
   - For each student: check average >= min AND all mandatory subjects passed
   - Set `rec.termStatus = 'PASS'` or `rec.termStatus = 'FAIL'`

5. **3rd Term Promotion Status:**
   - If term === "Third Term": pull T1, T2, T3 scores, compute cumulative average
   - Apply promotion rules
   - Set `rec.promotionStatus = 'PROMOTED'` or `rec.promotionStatus = 'NOT PROMOTED'`

### [MODIFY] `js/master-sheet.js`

- Add a **Grade Tally column** to the master sheet table (e.g., "6A, 3B, 2C, 1F")
- Add **Admission Number** column
- Add **Subjects Offered** count column

### [MODIFY] `js/cumulative-master-sheet.js`

- Same grade tally additions
- Add admission number column
- Add promotion status column for 3rd term view

---

## Phase 6: QR Code on Result Sheet

Add a QR code to each generated result PDF.

---

### QR Code Library Integration

We will use `qrcode-generator` (a lightweight, zero-dependency JS library).

```html
<!-- Add to result-sheets.html or load globally -->
<script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
```

### [MODIFY] `js/templates/template-registry.js`

Add QR code generation to `buildPrintPayload()`:

```js
// Generate QR data
const qrText = `Name: ${student.name}\nAdm No: ${student.admissionNo}\nClass: ${student.class}\nAverage: ${summary.average}%\nPosition: ${summary.position}`;

// Generate QR as base64 image
const qr = qrcode(0, 'M');
qr.addData(qrText);
qr.make();
payload.qrCodeImage = qr.createDataURL(4, 0); // 4px module size
```

### [MODIFY] All 5 template files

Files affected: `js/templates/classic.js`, `js/templates/modern.js`, `js/templates/corporate.js`, `js/templates/elegant.js`, `js/templates/chart.js`

Add QR code image to the result sheet layout, typically in the bottom-right corner or header area:

```html
<img src="${payload.qrCodeImage}" class="w-[70px] h-[70px]" alt="QR Verification" />
```

---

## Phase 7: Publish / Unpublish Results

Add admin control to toggle result visibility for students and parents.

---

### [NEW] `js/result-publish.js`

Manages the publish state per class/term/session combination.

```js
// localStorage key: 'sms_result_publish'
{
  "JSS1|First Term|2024/2025": { published: true, publishedAt: "2025-01-15T10:00:00Z" },
  "JSS1|Second Term|2024/2025": { published: false },
  "SS3|Third Term|2024/2025": { published: true, publishedAt: "2025-07-20T14:30:00Z" }
}
```

Functions:
- `publishResults(className, term, session)` — sets published = true
- `unpublishResults(className, term, session)` — sets published = false
- `isPublished(className, term, session)` — returns boolean
- `toggleClassPosition(show)` — settings toggle to show/hide position on published results

### [MODIFY] `pages/admin/academics/grading/result-sheets.html`

Add a **"Publish Results"** button and **"Unpublish"** button to the broadsheet header area. Show the current publish state with a status badge.

### [MODIFY] `js/student-pages.js` / `js/parent-pages.js`

- Before rendering any result for a student/parent view, check `isPublished(class, term, session)`.
- If not published: show "Results not yet available" message.
- If published: render normally.

---

## Phase 8: Template Payload Expansion & Rendering

All new data fields must flow through the template system.

---

### [MODIFY] `js/templates/template-registry.js`

Expand `buildPrintPayload()` with ALL new fields:

```js
return {
  // ... existing fields ...

  student: {
    name, id, roll,
    admissionNo: rec.student.admissionNo || '',  // NEW
    class, gender, dob, photo
  },

  summary: {
    grandTotal, average, percentage,
    armPosition: rec.armPosition || rec.position || '',          // NEW (renamed)
    overallPosition: rec.overallPosition || '',                   // NEW
    subjectsOffered: rec.subjectsOffered || 0,                    // NEW
    gradeTally: rec.gradeTally || {},                              // NEW
    gradeTallyText: rec.gradeTallyText || '',                      // NEW: "6As, 4Bs, 2Cs, 1F"
    termStatus: rec.termStatus || '',                              // NEW: "PASS" | "FAIL"
    promotionStatus: rec.promotionStatus || '',                    // NEW: "PROMOTED" | "NOT PROMOTED"
    isPromoted: rec.isPromoted
  },

  attendance: {
    timesOpened, timesPresent, timesAbsent,
    timesLate: rec.attendance?.timesLate || '',                    // NEW
    timesEarly: rec.attendance?.timesEarly || ''                   // NEW
  },

  dates: {
    closingDate,
    resumptionDate,
    nextTermBegins                                                 // Ensure always populated
  },

  // Dynamic fees (NEW — replaces hardcoded bills)
  fees: feeItemsForClass || [],  // Array of { title, amount }

  // QR Code (NEW)
  qrCodeImage: generatedQRBase64 || '',

  // Grading Keys (already exists — ensure rendered)
  gradingKeys: [...]
};
```

### [MODIFY] All 5 Template Files

Each template's `renderTerm()` function must be updated to render:
1. **Admission Number** in the student profile header
2. **Arm Position** and **Overall Position** (side by side)
3. **Subjects Offered** count
4. **Grade Tally** (e.g., "6As, 4Bs, 2Cs, 1F")
5. **Term Status** (PASS/FAIL) for 1st/2nd term
6. **Promotion Status** (PROMOTED/NOT PROMOTED) for 3rd term only
7. **Attendance** row: Times Opened, Present, Absent, Late, Early
8. **Dynamic Fee Table** (from `payload.fees`)
9. **QR Code Image** in a corner
10. **Key to Grades** table
11. **Closing Date** and **Next Term Begins** in the footer
12. **School Stamp** placeholder area

---

## Phase 9: Settings Toggles (Result Field Visibility)

Allow admins to toggle which sections appear on the result sheet.

---

### [MODIFY] `js/result-settings.js`

Add a **"Result Card Sections Visibility"** panel with toggle switches:

```js
// localStorage key: 'sms_result_visibility'
{
  showAdmissionNo: true,
  showArmPosition: true,
  showOverallPosition: true,
  showSubjectsOffered: true,
  showGradeTally: true,
  showTermStatus: true,
  showPromotionStatus: true,
  showAttendance: true,
  showFees: true,
  showQRCode: true,
  showGradingKeys: true,
  showDomains: true,
  showPsychomotor: true,
  showTeacherComment: true,
  showHeadComment: true,
  showPrincipalComment: true,
  showSchoolStamp: true,
  showClosingDate: true,
  showNextTermBegins: true
}
```

Templates will check these flags before rendering each section.

---

## Execution Order

| Order | Phase | Complexity | Estimated Scope |
|-------|-------|------------|-----------------|
| 1 | **Admission Number System** | Medium | 4 files |
| 2 | **Dynamic Fee Manager** | Medium | 3 new + 2 modified |
| 3 | **Term Dates & Attendance Calculator** | Medium | 2-3 files |
| 4 | **Promotion Rule Engine** | High | 2 new + 2 modified |
| 5 | **Result Engine Core** | **Critical** | 3 files, heavy logic |
| 6 | **QR Code Integration** | Low | 1 library + 6 files |
| 7 | **Publish/Unpublish** | Medium | 1 new + 3 modified |
| 8 | **Template Payload + Rendering** | High | 6 files |
| 9 | **Settings Toggles** | Low | 2 files |

---

## Verification Plan

### Automated Tests
1. **Admission Number Generation:** Create 5 students → verify each gets unique sequential admission numbers with correct prefix/year format
2. **Fee Items:** Create fee items → attach to classes → verify only class-relevant items appear in result payload
3. **School Days Computation:** Set term start/end with 2 holidays → verify computed days = weekdays minus holidays minus weekends
4. **Dual Ranking:** Load broadsheet for a class with 2 sections → verify arm positions are per-section and overall positions span all sections
5. **Grade Tally:** Generate result for a student with known scores → verify tally counts match
6. **Pass/Fail Logic:** Set min average to 50%, mandatory subjects to [Maths, English] → verify student failing Maths is marked FAIL even if average > 50%
7. **QR Code:** Preview a result → verify QR image renders and contains correct student info
8. **Publish Toggle:** Set JSS1 First Term as unpublished → verify student portal shows "Results not yet available"

### Manual Verification (Browser)
- Load each result template (Classic, Modern, Corporate, Elegant, Chart) and visually confirm all 18 new data points render correctly
- Print a PDF and verify layout integrity (no overflow, proper A4 sizing)
- Test on mobile viewport for responsive scaling

### Data Integrity
- Verify localStorage keys don't collide with existing data
- Verify backward compatibility: old `globalResultSettings.bills` data gracefully migrates to new `sms_fee_items` format

---

## New localStorage Keys Summary

| Key | Purpose | Phase |
|-----|---------|-------|
| `sms_admission_config` | Admission number format settings | 1 |
| `sms_fee_items` | Dynamic fee items with class assignments | 2 |
| `sms_term_calendar` | Term start/end dates + holidays | 3 |
| `sms_promotion_rules` | Pass/fail + promotion rule configurations | 4 |
| `sms_result_publish` | Publish/unpublish state per class/term | 7 |
| `sms_result_visibility` | Toggle switches for result sheet sections | 9 |
