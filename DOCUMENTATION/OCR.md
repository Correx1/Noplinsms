# OCR Score Sheet — Technical Documentation

## Overview

The **Multi Score Sheet** module supports a physical paper-based scoring workflow with digital sync via OCR (Optical Character Recognition) and QR code context embedding. This document describes the full end-to-end flow for the backend developer.

---

## Workflow Summary

```
Teacher selects class/subject → Frontend generates A4 score sheet PDF
    ↓ (teacher prints and distributes)
Teacher fills scores by hand on paper
    ↓ (teacher scans/photos completed sheet)
Teacher uploads image to the portal
    ↓
System reads QR code → identifies context (class, subject, term, session)
    ↓
OCR engine reads handwritten/typed numbers from score columns
    ↓
Scores are auto-mapped into the digital score grid
    ↓
Teacher reviews, corrects if needed → saves
```

---

## The QR Code — Purpose & Contents

Every printed score sheet includes a **QR code** in the top-right corner of each page. It serves one purpose: **context identification**.

When a completed sheet is uploaded for OCR scanning, the system first decodes the QR instead of asking the teacher to re-select the class/subject manually. This eliminates human error (e.g. uploading the wrong sheet to the wrong subject).

### QR Payload (JSON encoded)

```json
{
  "class":   "JSS1",
  "section": "A",
  "subject": "Mathematics",
  "term":    "1st Term",
  "session": "2024/2025"
}
```

> **None of these values are hardcoded.** They are captured from the teacher's dropdown selections at the time of sheet generation and embedded dynamically into the QR at runtime.

---

## Score Sheet Generation — What Gets Printed

The frontend generates the score sheet based on:

| Field | Source |
|-------|--------|
| School name | School settings (from backend `GET /settings`) |
| School address | School settings |
| School motto | School settings |
| Class | Teacher's dropdown selection |
| Section | Teacher's dropdown selection |
| Subject | Teacher's dropdown selection |
| Term | Teacher's dropdown selection |
| Academic session | Teacher's dropdown selection |
| Grading components | Active grading structure for the selected class (e.g. CA 40% + Exam 60%) — from backend `GET /grading-structures` |
| Student list | Students enrolled in the selected class+section — from backend `GET /students?class=&section=` |

> **Nothing in the score sheet is hardcoded.** All data flows from the backend API at runtime.

---

## Upload & OCR Flow (Backend Expectations)

### Step 1 — QR Decode
The frontend uses the `jsQR` library to decode the QR from the uploaded image client-side. If successful, it auto-populates the class/subject/term dropdowns and reloads the score grid to match the sheet.

### Step 2 — OCR
The frontend uses `Tesseract.js` to extract numbers from the image. The engine is configured to only recognise digits (`0–9`) to reduce noise.

> **Note:** Tesseract is a client-side fallback. For production accuracy (especially on handwritten scores), the backend should provide a dedicated OCR endpoint:

```
POST /api/ocr/extract
Content-Type: multipart/form-data
Body: { image: <file>, context: { class, section, subject, term, session } }

Response:
{
  "scores": [
    { "studentId": "STD-001", "components": { "CA": 35, "Exam": 58 } },
    { "studentId": "STD-002", "components": { "CA": 28, "Exam": 44 } },
    ...
  ]
}
```

The frontend will consume this response and pre-fill the score input grid. The teacher reviews highlighted cells before saving.

### Step 3 — Save
After the teacher reviews and confirms, scores are submitted via the existing `POST /scores/bulk` endpoint (or equivalent).

---

## Key API Endpoints Required

| Purpose | Endpoint |
|---------|----------|
| Fetch school settings | `GET /api/settings` |
| Fetch grading structures | `GET /api/grading-structures` |
| Fetch students by class+section | `GET /api/students?class=JSS1&section=A` |
| (Optional) Server-side OCR | `POST /api/ocr/extract` |
| Save bulk scores | `POST /api/scores/bulk` |

---

## Important Notes for Backend

1. **No data is hardcoded on the frontend.** All school info, class lists, student lists, grading structures, and session data must come from the API.
2. The QR code is generated **entirely on the frontend** — the backend does not need to generate or store QR codes.
3. The student list printed on the sheet must match exactly what the backend returns for that class+section, sorted alphabetically, so that OCR-mapped row positions correspond correctly to students.
4. The grading component columns (e.g., CA, Exam) on the printed sheet are driven by the grading structure returned from the API for that class. The backend must ensure the correct structure is associated with each class.
5. The frontend OCR is a **best-effort** client-side approximation. A backend OCR endpoint is strongly recommended for reliability in production.
