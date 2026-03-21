# Grading, Results & Result Templates — Complete Documentation

> **Purpose:** Laravel backend implementation guide for the entire grading pipeline — from score entry to printed result card.
> **Key JS:** `grading-components.js`, `grade-boundaries.js`, `result-sheets.js`, `result-settings.js`, `session-results.js`

---

## 1. System Architecture — How a Result is Built

A single student result card pulls from **10+ system areas**:

```
STUDENT RESULT CARD requires data from:
  1. students table          → Name, class, section, roll, photo, DOB, gender
  2. subjects table          → List of subjects assigned to this class
  3. classes / sections      → Class name, section, form teacher name
  4. grading_structures      → Score component definitions (CA1=10%, EXAM=70%)
  5. grading_components      → Names and weights of each component
  6. scores table            → Actual marks entered per component per subject
  7. grade_boundaries        → Score → Grade (A1) + Remark (Excellent) lookup
  8. student_result_evaluations → Affective/psychomotor domains, remarks
  9. result_settings         → School header, template, signatures, domains list
 10. school profile          → School name, logo, address, phone
 11. fee_payments table      → Fee arrears for bills section on result card
 12. attendances table       → Times present / absent per term
```

### The Full Computation Chain

```
Step 1. Admin configures Grade Boundaries (once per branch)
        e.g., 75-100 = A1 "Excellent", 70-74 = B2 "Very Good", etc.

Step 2. Admin creates Grading Structure
        e.g., "JSS Structure" → targets JSS1, JSS2, JSS3
        Components: CA1 (10%), CA2 (20%), Terminal Exam (70%) → must total 100%

Step 3. Admin configures Result Settings
        → Select template (classic/modern/elegant)
        → Set affective domain names, psychomotor domain names
        → Upload principal's name and signature

Step 4. Teacher enters scores per student per subject per term
        → Opens Mark Register → selects Class, Section, Subject, Term
        → Enters scores per component per student
        → Scores stored in `scores` table

Step 5. Admin opens Result Sheets page
        → Selects Class, Section, Term, Session
        → System fetches:
            - All students in that section
            - All subjects for that class
            - The grading structure for this class
            - All component scores → sums to get subject total per student
            - Grade for each total via grade_boundaries lookup
            - Class position: ranks students by grand total (all subjects summed)
            - Per-subject: highest score, lowest score, student position

Step 6. Teacher adds domain evaluations per student
        → Rates: Discipline=5, Neatness=4, Verbal Fluency=3 ...
        → Adds teacher remark, headteacher remark, principal remark
        → Stored in: student_result_evaluations table

Step 7. Result card generated
        → buildPrintPayload() assembles all data sources into one payload object
        → Active template (e.g., "classic") renders payload → A4 HTML
        → User previews, then prints via window.print()
```

---

## 2. Grading Structures & Components

**Page:** `grading/grading-components.html` · **JS:** `grading-components.js`

### Concept
A **Grading Structure** is a named group of **score components** with percentage weights. Each structure is mapped to one or more classes. A class can belong to **only one structure** (strictly enforced).

### Default Structures
```json
{
  "id": "STR-Junior",
  "name": "Junior Secondary (JSS) Grading",
  "classes": ["JSS1", "JSS2", "JSS3"],
  "components": [
    { "id": "C3", "name": "CA 1", "weight": 10 },
    { "id": "C4", "name": "CA 2", "weight": 30 },
    { "id": "C5", "name": "Terminal Exam", "weight": 60 }
  ]
}
```

### Rules the Backend MUST Enforce
1. Sum of component weights per structure must equal exactly **100%**
2. Each class can belong to **at most one grading structure** — enforce with a UNIQUE constraint on `class_id` in the `grading_structure_classes` pivot table
3. A component can optionally be **linked to an Assessment** (`assessment_id`) — if linked, the score is auto-pulled from assessment results; otherwise manually entered

### Laravel Tables

```sql
-- grading_structures
CREATE TABLE grading_structures (
    id BIGINT PK, branch_id FK, name VARCHAR(100)
);

-- grading_structure_classes (1 class = 1 structure max)
CREATE TABLE grading_structure_classes (
    structure_id BIGINT FK,
    class_id BIGINT FK,
    PRIMARY KEY (class_id)   -- UNIQUE enforces 1 structure per class
);

-- grading_components
CREATE TABLE grading_components (
    id BIGINT PK,
    structure_id BIGINT FK,
    name VARCHAR(100),       -- "CA 1", "Exam"
    weight INT,              -- percentage weight
    display_order INT,
    assessment_id BIGINT FK NULLABLE  -- optional link to assessments
);
```

---

## 3. Grade Boundaries

**Page:** `grading/grade-boundaries.html` · **JS:** `grade-boundaries.js`

### Default Boundaries (Nigerian WAEC System)

| Grade | Min | Max | Remark |
|-------|-----|-----|--------|
| A1 | 75 | 100 | Excellent |
| B2 | 70 | 74 | Very Good |
| B3 | 65 | 69 | Good |
| C4 | 60 | 64 | Credit |
| C5 | 55 | 59 | Credit |
| C6 | 50 | 54 | Credit |
| D7 | 45 | 49 | Pass |
| E8 | 40 | 44 | Pass |
| F9 | 0  | 39 | Fail |

### Grade Lookup Algorithm (Must replicate in Laravel)
```php
// Sort descending by min_score, then find first match
$grade = GradeBoundary::where('branch_id', $branchId)
    ->where('min_score', '<=', $total)
    ->where('max_score', '>=', $total)
    ->first();
```

### Laravel Table
```sql
CREATE TABLE grade_boundaries (
    id BIGINT PK,
    branch_id BIGINT FK,
    grade VARCHAR(5),     -- 'A1'
    min_score INT,
    max_score INT,
    remark VARCHAR(100),
    UNIQUE (branch_id, grade)
);
```

---

## 4. Score Entry (Mark Register)

**Pages:** `marks/marks.html`, `grading/score-sheets.html`, `grading/multi-score-sheet.html`

### Individual Score Record
```json
{
  "student_id": "STU006",
  "subject_id": "SUB001",
  "section_id": "S006",
  "term_id": "TM002",
  "academic_year_id": "AY002",
  "component_id": "CMP-CA1",
  "score": 8
}
```

> One database row per **student × component × subject × term**. The total is always computed server-side, never stored directly.

### Computing a Student's Subject Total
```sql
SELECT SUM(score) as total
FROM scores
WHERE student_id = ? AND subject_id = ? AND term_id = ?
-- Do NOT filter by component_id — SUM across all components
```

### Computing Position in Class
```sql
SELECT student_id,
       SUM(score) as subject_total,
       RANK() OVER (ORDER BY SUM(score) DESC) as position
FROM scores
WHERE subject_id = ? AND section_id = ? AND term_id = ?
GROUP BY student_id;
```

### Laravel Table
```sql
CREATE TABLE scores (
    id BIGINT PK,
    student_id BIGINT FK,
    subject_id BIGINT FK,
    section_id BIGINT FK,
    term_id BIGINT FK,
    academic_year_id BIGINT FK,
    component_id BIGINT FK,   -- FK to grading_components
    score DECIMAL(6,2),
    entered_by BIGINT FK,     -- teacher user_id
    updated_at TIMESTAMP,
    UNIQUE (student_id, subject_id, term_id, component_id)
);
```

---

## 5. Result Sheet Settings

**Page:** `grading/result-settings.html` · **JS:** `result-settings.js`

### Full Settings Object
```json
{
  "session": "2024/2025",
  "resumption": "9th September, 2025",
  "closing_date": "2025-04-05",
  "headteacher_name": "Mrs. Chioma Okafor",
  "headteacher_title": "Head Teacher",
  "principal_name": "Mr. Adewale Babatunde",
  "principal_title": "Principal / Director",
  "active_template": "classic",
  "domains": ["Discipline","Neatness","Attentiveness","Punctuality","Leadership"],
  "psychomotor_domains": ["Handwriting","Drawing & Painting","Verbal Fluency"],
  "principal_sign": "base64_or_url",
  "headteacher_sign": "base64_or_url",
  "times_opened": 110,
  "bills": {
    "tuition": 50000,
    "equipment": 5000,
    "library": 2000,
    "sports": 3000
  }
}
```

### Template Selection
`active_template` selects which layout is used: `classic`, `modern`, or `elegant`. Each template declares **capabilities** (which sections it supports). The UI hides/shows setting fields based on these capabilities.

| Capability | Meaning |
|-----------|---------|
| `affectiveDomains` | Show behavioral scores section |
| `psychomotorDomains` | Show psychomotor skills section |
| `teacherRemark` | Show teacher's comment field |
| `headTeacherRemark` | Show head teacher comment |
| `principalRemark` | Show principal comment |
| `attendance` | Show attendance summary |
| `schoolBills` | Show fees/bills section |

### Laravel Table: `result_settings`
```sql
CREATE TABLE result_settings (
    id BIGINT PK,
    branch_id BIGINT UNIQUE FK,
    session VARCHAR(20),
    resumption VARCHAR(100),
    closing_date DATE,
    principal_name VARCHAR(150),
    principal_title VARCHAR(100),
    headteacher_name VARCHAR(150),
    headteacher_title VARCHAR(100),
    active_template ENUM('classic','modern','elegant') DEFAULT 'classic',
    domains JSON,
    psychomotor_domains JSON,
    principal_sign LONGTEXT,
    headteacher_sign LONGTEXT,
    times_opened INT,
    bills_tuition DECIMAL(10,2),
    bills_equipment DECIMAL(10,2),
    bills_library DECIMAL(10,2),
    bills_sports DECIMAL(10,2)
);
```

---

## 6. Affective & Psychomotor Domain Evaluations

After generating the broadsheet, each student row has an **"Add Domains"** button. Clicking it opens a modal where the teacher rates the student on behavioral and skill domains.

### Rating Scale
| Score | Label |
|-------|-------|
| 5 | Excellent |
| 4 | Good |
| 3 | Fair |
| 2 | Poor |
| 1 | Very Poor |

### Evaluation Object
```json
{
  "student_id": "STU001",
  "term_id": "TM002",
  "teacher_remark": "Outstanding performance.",
  "headteacher_remark": "Keep it up.",
  "principal_remark": "An exceptionally bright child.",
  "affective_domains": { "Discipline": 5, "Neatness": 4, "Teamwork": 3 },
  "psychomotor_domains": { "Handwriting": 4, "Verbal Fluency": 5 },
  "times_present": 108,
  "times_absent": 2,
  "fee_arrears": 0
}
```

### Laravel Table: `student_result_evaluations`
```sql
CREATE TABLE student_result_evaluations (
    id BIGINT PK,
    student_id BIGINT FK,
    term_id BIGINT FK,
    teacher_remark TEXT,
    headteacher_remark TEXT,
    principal_remark TEXT,
    affective_domains JSON,
    psychomotor_domains JSON,
    times_present INT,
    times_absent INT,
    fee_arrears DECIMAL(10,2),
    UNIQUE (student_id, term_id)
);
```

---

## 7. Result Card Generation — `buildPrintPayload()`

This is the central function in `result-sheets.js`. It assembles all data into a single **payload object** passed to the active template's `renderTerm(payload)` function.

### Payload Structure
```json
{
  "_templateId": "classic",
  "_mode": "term",

  "school": {
    "name": "Noplin Academy",
    "address": "12 School Road, Lagos",
    "phone": "08012345678",
    "logo": "base64_or_url"
  },
  "student": {
    "id": "STU001",
    "name": "Adebayo Ogunlesi",
    "roll": "001",
    "class": "SS3A",
    "gender": "Male"
  },
  "context": { "term": "2nd Term", "session": "2024/2025" },
  "results": {
    "subjects": [
      {
        "subject": "Mathematics",
        "components": {
          "CA1": { "score": 8, "max": 10 },
          "EXAM": { "score": 68, "max": 80 }
        },
        "total": 76,
        "grade": "A1",
        "remark": "Excellent",
        "highest": 92,
        "lowest": 34,
        "position": "2nd"
      }
    ],
    "grandTotal": 1120,
    "average": "74.7",
    "position": "3rd out of 28",
    "sectionPosition": "2nd out of 14"
  },
  "structure": {
    "components": [
      { "name": "CA 1", "weight": 10 },
      { "name": "EXAM", "weight": 70 }
    ]
  },
  "evaluations": {
    "teacherRemark": "A hardworking student.",
    "headTeacherRemark": "Keep it up.",
    "principalRemark": "A bright future awaits.",
    "affective": { "Discipline": 5, "Neatness": 4 },
    "psychomotor": { "Handwriting": 4 }
  },
  "attendance": { "timesOpened": 110, "timesPresent": 108, "timesAbsent": 2 },
  "bills": { "tuition": "50000", "equipment": "5000", "arrears": "0" },
  "dates": { "closingDate": "2025-04-05", "resumption": "9th September, 2025" },
  "signatures": {
    "principalName": "Mr. Adewale Babatunde",
    "principalTitle": "Principal / Director",
    "principalSign": "base64_image",
    "headteacherName": "Mrs. Chioma Okafor",
    "headteacherTitle": "Head Teacher",
    "headteacherSign": "base64_image"
  }
}
```

### Laravel API — Result Sheet Endpoint

This is the most complex backend endpoint. It must:

```
GET /api/v1/result-sheets?section_id=S006&term_id=TM002&academic_year_id=AY002

1. Fetch students enrolled in section_id = S006
2. Fetch subjects assigned to the class of this section
3. Fetch the grading structure mapped to this class → get components
4. For each (student, subject):
   a. SUM(score) from scores WHERE student_id AND subject_id AND term_id → total
   b. Grade lookup in grade_boundaries WHERE total BETWEEN min AND max
5. For each subject across all students:
   a. MAX(total) → highest
   b. MIN(total) → lowest
   c. RANK() per student by subject total → subject_position
6. For each student:
   a. SUM of all subject totals → grand_total
   b. AVG of all subject totals → average
   c. RANK() by grand_total across section → class_position
7. Fetch student_result_evaluations for each student for this term
8. Fetch result_settings for this branch
9. Assemble payload per student
```

### Grade Derivation Flow (must happen server-side)
```
scores.score (per component) 
  → SUM per student per subject per term = subject_total
  → lookup grade_boundaries WHERE subject_total BETWEEN min AND max
  → returns grade (A1) + remark (Excellent)
  → SUM of all subject_totals = grand_total
  → RANK students by grand_total → class_position
```

---

## 8. Session Results (Annual Broadsheet)

**Page:** `grading/session-results.html` · **JS:** `session-results.js`

Annual result combines all 3 terms into one cumulative report.

### Formula
```
Annual Score per Subject = (Term1_total + Term2_total + Term3_total) / 3
Annual Grand Total = SUM of all annual subject scores
Annual Position = RANK by annual grand total
```

### Laravel Query
```sql
SELECT
    s.student_id,
    s.subject_id,
    AVG(term_totals.total) as annual_score
FROM (
    SELECT student_id, subject_id, term_id, SUM(score) as total
    FROM scores
    WHERE academic_year_id = ?
    GROUP BY student_id, subject_id, term_id
) as term_totals
JOIN terms t ON t.id = term_totals.term_id
WHERE t.academic_year_id = ?
GROUP BY term_totals.student_id, term_totals.subject_id;
```

### API Endpoint
```
GET /api/v1/session-results?section_id=S006&academic_year_id=AY002
```

---

## 9. Cross-System Data Linkage Map

```
Students ──── Section ──── Class ──── GradingStructure ──── GradingComponents
    │              │                                               │
    │         (subjects for                              (component weights
    │          this class)                                for score entry)
    │              │                                               │
    └──────────────┴───────────────────────────────────────────── ┘
                   │
              scores table
         (student × component × subject × term)
                   │
                   ▼ SUM per subject
              subject_total
                   │
                   ▼ lookup
           grade_boundaries → Grade (A1) + Remark
                   │
                   ▼ aggregate
           grand_total → RANK → class_position
                   │
    ┌──────────────┼───────────────────────────┐
    ▼              ▼                           ▼
student_evaluations  result_settings       school_profile
(affective, remarks) (template, names,    (name, logo,
                      signatures)          address)
    │              │                           │
    └──────────────┴───────────────────────────┘
                   │
           buildPrintPayload()
                   │
           TEMPLATE_REGISTRY[activeTemplate].renderTerm()
                   │
              A4 Result Card HTML → Preview → Print
```

---

## 10. Laravel API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/grade-boundaries` | List grade boundaries |
| POST/PUT/DELETE | `/api/v1/grade-boundaries/{id}` | CRUD |
| GET | `/api/v1/grading-structures` | All structures with components |
| POST | `/api/v1/grading-structures` | Create structure |
| POST | `/api/v1/grading-structures/{id}/components` | Add component |
| PUT/DELETE | `/api/v1/grading-structures/{id}/components/{cid}` | Edit/delete |
| GET | `/api/v1/scores?section_id=&subject_id=&term_id=` | Scores for mark entry |
| POST | `/api/v1/scores/bulk` | Bulk score submission |
| GET | `/api/v1/result-sheets` | Full broadsheet — the main result engine |
| GET | `/api/v1/result-sheets/student/{id}` | Single student result data |
| POST | `/api/v1/student-evaluations` | Save domain evaluations |
| GET | `/api/v1/student-evaluations/{student_id}` | Fetch evaluations |
| GET | `/api/v1/session-results` | Annual broadsheet |
| GET/PUT | `/api/v1/result-settings` | Get/save result settings |

---

*See [EXAMINATION.md](./EXAMINATION.md) for exam scheduling and question banks that feed into score components.*
