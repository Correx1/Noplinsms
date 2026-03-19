# Backend Integration Specifications: Grading & Promotion Suite (Update 1.0)
**Date:** March 19th, 2026

This document serves as a comprehensive guide for the backend development team. It outlines all the new UI modules, expected database models, required API endpoints, and calculation engines necessitated by the new Frontend Grading & Promotion features.

---

## 1. Sidebar & Access Control
**Frontend Change:** 
* `components/student-sidebar.html` and `components/parent-sidebar.html` are now dynamically loaded based on the `userRole`.
**Backend Requirement:**
* The authentication module must return a strict `userRole` identifier (`admin`, `teacher`, `student`, `parent`) upon login to dictate Sidebar access.

---

## 2. Core Grading Infrastructure (CRUD Requirements)

### A. Grade Boundaries (`grade-boundaries.html`)
The traditional fixed-point grading system has been replaced with unconstrained, dynamic boundary logic.
**Database Model (`GradeBoundary`):**
* `id` (UUID)
* `grade` (String, e.g., "A1", "B2")
* `min_score` (Integer, e.g., 75)
* `max_score` (Integer, e.g., 100)
* `remark` (String, e.g., "Excellent")
**Endpoints Required:**
* `GET /api/grade-boundaries`
* `POST /api/grade-boundaries`
* `PUT /api/grade-boundaries/:id`
* `DELETE /api/grade-boundaries/:id`

### B. Grading Components (`grading-components.html`)
Schools map specific scoring weights (CA1, CA2, Exam) to specific classes dynamically.
**Database Model (`GradingComponent`):**
* `id` (UUID)
* `name` (String, e.g., "Continuous Assessment 1")
* `weight` (Integer, e.g., 20) — The maximum possible score for this component.
* `target_classes` (Array of Class IDs/Names, e.g., `["JSS1A", "JSS1B"]`)
**Endpoints Required:**
* `GET /api/grading-components` (Filterable by Class ID)
* `POST /api/grading-components`
* `PUT /api/grading-components/:id`
* `DELETE /api/grading-components/:id`

---

## 3. Score Sheets & Multi Score Sheets
**Frontend Change:**
`multi-score-sheet.html` dynamically generates table headers by calling `GET /api/grading-components` for the selected class. It prevents the teacher from inputting a score higher than the component's `weight` and auto-calculates the Total.

**Database Model (`StudentScore`):**
* `id` (UUID)
* `student_id` (UUID)
* `subject_id` (UUID)
* `term` (Enum: "1st Term", "2nd Term", "3rd Term")
* `session` (String, e.g., "2024/2025")
* `scores` (JSONB) — E.g., `{"CA1": 15, "CA2": 18, "Exam": 50}`
* `total` (Integer) — Auto-calculated on the backend for integrity.

**Endpoints Required:**
* `GET /api/scores` (Query: `?class=JSS1&subject=Maths&term=1st Term&session=2024/2025`)
* `POST /api/scores/bulk-update` — Accepts an array of students and their `scores` JSON body to aggressively save the entire grid at once.

---

## 4. Result Settings & Affective Domains (`result-settings.html`)
This global configuration drives the PDF generators.

**Database Model (`GlobalResultSetting`):**
* `active_session` (String)
* `next_resumption_date` (String/Date)
* `principal_name` (String)
* `headteacher_name` (String)
* `principal_signature` (String/Text: Base64 or Image URL)
* `headteacher_signature` (String/Text: Base64 or Image URL)

**Database Model (`AffectiveDomain`):**
Admins dynamically define what behaviors to grade (Neatness, Punctuality).
* `id` (UUID)
* `name` (String, e.g., "Neatness")

**Database Model (`StudentDomainEvaluation`):**
Teachers grade students on these domains (1-5 scale) directly from the Broadsheet (`result-sheets.html`).
* `student_id` (UUID)
* `term` (Enum)
* `session` (String)
* `ratings` (JSONB) — E.g., `{"domain_id_punctuality": 5, "domain_id_neatness": 4}`

**Endpoints Required:**
* `GET /api/settings/result`
* `PUT /api/settings/result`
* `GET /api/domains`
* `POST /api/domains`
* `DELETE /api/domains/:id`
* `GET /api/students/:id/domains`
* `POST /api/students/:id/domains`

---

## 5. Result Sheets (Termly Report Cards)
**Frontend Change:** `result-sheets.html` generates a complex Broadsheet and A4 PDF. 

**Backend Computation Requirement (CRITICAL):**
When the frontend requests the Broadsheet `GET /api/results/broadsheet?class=X&term=Y&session=Z`, the backend **must compute and return** the following derived data *alongside* the raw scores:
1. **Class Highest Score (Per Subject):** The maximum `total` score achieved by any student in the class for that subject.
2. **Class Lowest Score (Per Subject):** The minimum `total` score achieved.
3. **Subject Position:** The student's rank (1st, 2nd, 3rd) *within that specific subject*.
4. **Overall Total Score:** The aggregate of all subject totals for the student.
5. **Overall Class Position:** The student's rank based on their Overall Total Score.

*Note: The frontend currently simulates this using mathematical arrays (`Math.max`, `filter`, `sort`). The backend must perform this on the database level for data integrity.*

---

## 6. Master Sheets 
**Frontend Change:** Split into single-term (`master-sheet.js`) and three-term cumulative (`cumulative-master-sheet.js`).

**Backend Aggregation Requirement (Cumulative Master Sheet):**
Endpoint: `GET /api/results/cumulative-master-sheet?class=X&session=Z`
The backend must aggregate T1, T2, and T3 data. The JSON response must look like:
```json
{
  "student_id": "123",
  "name": "John Doe",
  "subjects": [
    {
      "name": "Mathematics",
      "t1": 60,
      "t2": 70,
      "t3": 80,
      "cum_average": 70 // (60+70+80)/3
    }
  ],
  "grand_cumulative_total": 700, // Sum of all cum_averages
  "overall_average": 70.0, // grand_cumulative_total / number of subjects
  "class_position": "1st"
}
```

---

## 7. Session Results (Annual Report Cards)
**Frontend Change:** `session-results.html`. This is functionally identical to the Cumulative Master Sheet but focuses solely on printing the Annual A4 PDF Report Card.

**Backend Requirement:**
* It runs off the exact same logic as the Cumulative Master Sheet. It simply evaluates the `cum_average` (Annual Score) against the **Grade Boundaries** table to calculate the final `Grade` and `Remark`. 
* It requires the **Class Highest** and **Subject Position** values derived specifically from the `cum_average` (Annual Score), not the individual term scores.
* **No Affective Domains** are requested or printed on the Session Results.

---

### Implementation Checklist for Backend Developer:
- [ ] Create Roles Middleware.
- [ ] Build CRUD for `GradeBoundary` and `GradingComponent` tables.
- [ ] Implement `StudentScore` model to receive dynamic JSON component weights.
- [ ] Implement `GlobalResultSetting` (handling base64 uploads for signatures).
- [ ] Implement `AffectiveDomain` and `StudentDomainEvaluation` models.
- [ ] Build deeply computed endpoints for Termly Broadsheets (`Class Highest`, `Lowest`, `Subject Position`, `Overall Position`).
- [ ] Build the 3-Term Aggregation Engine calculating Cumulative averages across T1, T2, T3 per student.
