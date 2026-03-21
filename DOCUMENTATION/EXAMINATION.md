# Examination System — Complete Documentation

> **Purpose:** Laravel backend implementation guide for the Examination module — scheduling, question banks, CBT exams, score entry, admit cards, and how exams connect to the grading pipeline.
> **Key JS:** `examinations.js`, `cbt-exams.js`, `exam-questions.js`, `admit-cards.js`
> **Pages:** `admin/academics/examinations/`

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Examination Types](#2-examination-types)
3. [Exam Data Model](#3-exam-data-model)
4. [Create & Manage Exams](#4-create--manage-exams)
5. [Question Bank System](#5-question-bank-system)
6. [Computer-Based Tests (CBT)](#6-computer-based-tests-cbt)
7. [Admit Cards / Hall Tickets](#7-admit-cards--hall-tickets)
8. [How Exams Link to Grading](#8-how-exams-link-to-grading)
9. [Exam Timetable / Schedule](#9-exam-timetable--schedule)
10. [Laravel Database Tables](#10-laravel-database-tables)
11. [Laravel API Endpoints](#11-laravel-api-endpoints)
12. [Cross-Module Relationships](#12-cross-module-relationships)

---

## 1. Module Overview

The Examination module manages:
- **Scheduling** — defining exam periods (start date, end date, classes affected)
- **Question Banks** — building MCQ question pools per subject per exam
- **CBT (Computer-Based Tests)** — timed online exams for students
- **Admit Cards** — auto-generated hall tickets for students
- **Status Tracking** — Upcoming → Ongoing → Completed

The Examination module sits **upstream** of the Grading/Results module. Specifically:
- An exam can be **linked to a Grading Component** (e.g., "Terminal Exam" component)
- When an exam is marked complete and scores auto-processed, those scores are written into the `scores` table as the exam component score
- This automatically feeds into result generation without manual entry

---

## 2. Examination Types

| Type | Description | Affects Grades |
|------|-------------|---------------|
| `Terminal` | End-of-term main exam (e.g., "First Term Exam") | ✅ Yes — scores written to `scores` table |
| `Mid-Term` | Mid-term assessment exam | ✅ Yes — if linked to a grading component |
| `Mock/External` | WAEC/NECO mock prep exams | ❌ No — practice only, no grading impact |
| `Internal Assessment` | CA quizzes, projects | ✅ Yes — if linked to a CA component |
| `CBT` | Computer-based test (auto-graded) | ✅ Yes — scores auto-posted |

---

## 3. Exam Data Model

### Full Exam Object
```json
{
  "id": "EXM001",
  "name": "First Term Examination 2024/2025",
  "type": "Terminal",
  "category": "Main",
  "session": "2024/2025 First Term",
  "startDate": "2024-11-25",
  "endDate": "2024-12-06",
  "classes": ["JSS1A", "JSS1B", "JSS2A", "JSS3A", "SS1A", "SS2A", "SS3A"],
  "description": "End of first term examinations for all classes.",
  "status": "Completed",
  "linkedComponentId": "CMP-EXAM",
  "questions": {
    "Mathematics": [
      {
        "q": "What is 15 + 27?",
        "a": "42", "b": "38", "c": "41", "d": "43",
        "ans": "A"
      },
      {
        "q": "Find the HCF of 12 and 18",
        "a": "3", "b": "6", "c": "9", "d": "12",
        "ans": "B"
      }
    ],
    "English Language": [
      {
        "q": "Which of these is a noun?",
        "a": "Run", "b": "Beautiful", "c": "Teacher", "d": "Quickly",
        "ans": "C"
      }
    ]
  }
}
```

### Exam Status Lifecycle
```
Created → status: "Upcoming"
On startDate → status: "Ongoing"   (can be auto-updated by a scheduled Laravel command)
After endDate → status: "Completed"
```

### Status Values
| Status | Badge Color | Meaning |
|--------|------------|---------|
| `Upcoming` | Blue | Exam not yet started |
| `Ongoing` | Yellow | Currently in progress |
| `Completed` | Green | Exam period over |

---

## 4. Create & Manage Exams

**JS:** `examinations.js`

### Create Exam Form Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | text | ✅ | Exam title |
| `type` | select | ✅ | Terminal, Mid-Term, Mock/External |
| `category` | select | ✅ | Main, Alternative |
| `session` | text | ✅ | e.g., "2024/2025 Second Term" |
| `startDate` | date | ✅ | Exam period start |
| `endDate` | date | ✅ | Exam period end |
| `classes` | multi-checkbox | ✅ | Classes participating |
| `description` | textarea | ❌ | Optional notes |

### View Exam Detail
Each exam has a detail view showing:
- Metadata (name, type, session, dates, status)
- List of participating classes
- Question bank summary per subject (number of questions)
- Navigation to add/edit questions

---

## 5. Question Bank System

**JS:** `exam-questions.js` · **Page:** `examinations/exam-questions.html`

### Purpose
The question bank stores Multiple Choice Questions (MCQ) organized by exam and subject. Questions can be used for:
1. **Manual exam printing** — extract questions for paper-based exams
2. **CBT exams** — served one-by-one to students during online exams

### Question Object Schema
```json
{
  "id": "Q001",
  "examId": "EXM001",
  "subjectId": "SUB001",
  "subjectName": "Mathematics",
  "question": "What is 15 + 27?",
  "options": {
    "A": "42",
    "B": "38",
    "C": "41",
    "D": "43"
  },
  "correctAnswer": "A",
  "marks": 1,
  "difficulty": "Easy",
  "createdBy": "T001"
}
```

### Question Storage (Frontend)
Currently stored in `examinations[examId].questions[subjectName]` as an array of question objects inside `localStorage('sms_exams')`.

### Laravel Table: `exam_questions`

| Column | Type | Description |
|--------|------|-------------|
| `id` | PK | |
| `exam_id` | FK → exams | |
| `subject_id` | FK → subjects | |
| `question_text` | text | MCQ question |
| `option_a` | text | |
| `option_b` | text | |
| `option_c` | text | |
| `option_d` | text | |
| `correct_answer` | enum(A,B,C,D) | |
| `marks` | decimal(4,2) | Points for correct answer |
| `difficulty` | enum(Easy,Medium,Hard) | |
| `created_by` | FK → users | |

---

## 6. Computer-Based Tests (CBT)

**Page:** `examinations/cbt-exams.html` · **JS:** `cbt-exams.js`

### CBT Flow

```
Admin/Teacher creates CBT exam
  → Sets: Subject, Class, Duration (minutes), Total questions to display
  → Questions pulled from question bank (exam_questions table) for this subject

Student logs in → sees "Available Tests"
  → Clicks "Start Test"
  → Timer starts (countdown from duration)
  → Questions displayed one at a time (or all at once, configurable)
  → Student selects answers (A/B/C/D)
  → On submit (or timer expires): auto-graded
  → Score stored in scores table as the exam component score

Admin reviews results
  → See per-student scores
  → See per-question statistics (how many got it right)
```

### CBT Exam Configuration
```json
{
  "id": "CBT001",
  "examId": "EXM001",
  "subjectId": "SUB001",
  "classIds": ["C003", "C004"],
  "durationMinutes": 45,
  "questionsCount": 40,
  "shuffleQuestions": true,
  "shuffleOptions": true,
  "startTime": "2024-11-25T09:00:00",
  "endTime": "2024-11-25T10:00:00",
  "status": "Upcoming",
  "linkedComponentId": "CMP-EXAM"
}
```

### Auto-Score Logic
```
Score = (Correct Answers / Total Questions) × componentWeight
e.g., 35 correct out of 40, EXAM component weight = 70:
     Score = (35/40) × 70 = 61.25
```

### Laravel Tables

#### `cbt_exams`
| Column | Type |
|--------|------|
| `id` | PK |
| `exam_id` | FK → exams |
| `subject_id` | FK |
| `duration_minutes` | int |
| `questions_count` | int |
| `shuffle_questions` | boolean |
| `shuffle_options` | boolean |
| `start_time` | datetime |
| `end_time` | datetime |
| `linked_component_id` | FK → grading_components |
| `status` | enum |

#### `cbt_student_sessions`
| Column | Type | Description |
|--------|------|-------------|
| `id` | PK | |
| `cbt_exam_id` | FK | |
| `student_id` | FK | |
| `started_at` | datetime | |
| `submitted_at` | datetime | |
| `answers` | JSON | `{"Q001": "A", "Q002": "C"}` |
| `score` | decimal(6,2) | Auto-computed |
| `correct_count` | int | |
| `total_questions` | int | |

---

## 7. Admit Cards / Hall Tickets

**Page:** `examinations/admit-cards.html` · **JS:** `admit-cards.js`

### Purpose
Auto-generates printable admit cards (hall tickets) for students appearing in an exam.

### Admit Card Contains
- Student photo, name, admission number
- Class and section
- Exam name, session, dates
- Subject-wise schedule (subject, date, time, hall)
- School seal area
- Student signature line

### Generation Flow
1. Admin selects Exam + Class
2. System fetches all enrolled students in that class
3. For each student, generates a printable admit card
4. Admin prints all (one card per student, landscape A5 or portrait A4)

### Data Required
```
students table    → name, photo, admission_number, class, section
exams table       → exam name, dates, session
exam_schedule     → per subject date and time for that class
school_profile    → school name, logo
```

### Laravel Table: `exam_schedules` (Exam Timetable)
| Column | Type | Description |
|--------|------|-------------|
| `id` | PK | |
| `exam_id` | FK → exams | |
| `subject_id` | FK | |
| `class_id` | FK | |
| `exam_date` | date | |
| `start_time` | time | |
| `end_time` | time | |
| `hall` | string | Exam hall/room |

---

## 8. How Exams Link to Grading

This is the **critical connection** between Examinations and the Grading/Results pipeline.

### The Link: `linkedComponentId`

Every exam can be linked to a **Grading Component** via `linkedComponentId`. This means:

```
Exam "First Term Examination" → linkedComponentId = "CMP-EXAM"
  ↓ when exam is Completed:
Scores from exam are posted to `scores` table:
  student_id = ?
  subject_id = ?
  term_id = automatic (derived from exam session)
  component_id = CMP-EXAM  ← this is the link
  score = student's exam score
```

### Two Score Entry Paths

```
Path 1: Manual Score Entry (via Mark Register)
  → Teacher manually enters each student's exam score
  → Component: "Terminal Exam" weight = 70
  → Row created in scores table

Path 2: CBT Auto-Score Entry
  → Student completes CBT, auto-graded
  → Score auto-posted to scores table with same component_id
  → No manual entry needed

Both paths write to the SAME scores table, same structure.
Result generation reads from the same place regardless of how score was entered.
```

### Conflict Prevention (Backend MUST Implement)
When a CBT exam auto-posts scores, the system must check for duplicate entries:
```php
Score::updateOrCreate(
    [
        'student_id'  => $studentId,
        'subject_id'  => $subjectId,
        'term_id'     => $termId,
        'component_id'=> $componentId,
    ],
    ['score' => $autoComputedScore]
);
```

---

## 9. Exam Timetable / Schedule

**Note:** The exam timetable is distinct from the class timetable:
- **Class Timetable** — recurring weekly periods (Monday: Math 8-9am, English 9-10am...)
- **Exam Schedule** — specific dates per subject during the exam week

### Exam Schedule Data
```json
[
  { "subject": "Mathematics",     "date": "2024-11-25", "time": "09:00–11:00", "hall": "Hall A" },
  { "subject": "English Language","date": "2024-11-26", "time": "09:00–11:00", "hall": "Hall A" },
  { "subject": "Physics",         "date": "2024-11-27", "time": "09:00–10:30", "hall": "Hall B" }
]
```

---

## 10. Laravel Database Tables

### `exams`

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT PK | |
| `name` | string(200) | Full exam title |
| `type` | enum | Terminal, Mid-Term, Mock/External, CBT |
| `category` | string | Main, Alternative |
| `session` | string | "2024/2025 First Term" |
| `start_date` | date | |
| `end_date` | date | |
| `description` | text | |
| `status` | enum | Upcoming, Ongoing, Completed |
| `linked_component_id` | FK → grading_components, nullable | |
| `branch_id` | FK → branches | |
| `created_by` | FK → users | |

### `exam_classes` (pivot — exams to classes)

| Column | Type |
|--------|------|
| `exam_id` | FK |
| `class_id` | FK |
| `section_id` | FK (nullable) |

### `exam_questions`

| Column | Type |
|--------|------|
| `id` | BIGINT PK |
| `exam_id` | FK |
| `subject_id` | FK |
| `question_text` | text |
| `option_a` | text |
| `option_b` | text |
| `option_c` | text |
| `option_d` | text |
| `correct_answer` | enum(A,B,C,D) |
| `marks` | decimal(4,2) |
| `difficulty` | enum(Easy,Medium,Hard) |
| `created_by` | FK → users |

### `exam_schedules`

| Column | Type |
|--------|------|
| `id` | BIGINT PK |
| `exam_id` | FK |
| `subject_id` | FK |
| `class_id` | FK |
| `exam_date` | date |
| `start_time` | time |
| `end_time` | time |
| `hall` | string |

### `cbt_exams`

| Column | Type |
|--------|------|
| `id` | BIGINT PK |
| `exam_id` | FK |
| `subject_id` | FK |
| `duration_minutes` | int |
| `questions_count` | int |
| `shuffle_questions` | boolean |
| `shuffle_options` | boolean |
| `start_time` | datetime |
| `end_time` | datetime |
| `linked_component_id` | FK nullable |
| `status` | enum |

### `cbt_student_sessions`

| Column | Type |
|--------|------|
| `id` | BIGINT PK |
| `cbt_exam_id` | FK |
| `student_id` | FK |
| `started_at` | datetime |
| `submitted_at` | datetime |
| `time_spent_seconds` | int |
| `answers` | JSON |
| `score` | decimal(6,2) |
| `correct_count` | int |
| `status` | enum(Started, Submitted, Timed_Out) |

---

## 11. Laravel API Endpoints

### Exam Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/exams` | List all exams (filterable by status, type) |
| POST | `/api/v1/exams` | Create an exam |
| GET | `/api/v1/exams/{id}` | Exam detail with question counts |
| PUT | `/api/v1/exams/{id}` | Update exam |
| DELETE | `/api/v1/exams/{id}` | Delete exam (cascades questions) |
| PATCH | `/api/v1/exams/{id}/status` | Update status (Upcoming→Ongoing→Completed) |

### Question Bank

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/exams/{id}/questions?subject_id=` | Questions per subject |
| POST | `/api/v1/exams/{id}/questions` | Add question |
| PUT | `/api/v1/exams/{id}/questions/{qid}` | Edit question |
| DELETE | `/api/v1/exams/{id}/questions/{qid}` | Delete question |
| POST | `/api/v1/exams/{id}/questions/bulk` | Bulk import questions |

### CBT

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cbt-exams?class_id=&student_id=` | Available CBT for student |
| POST | `/api/v1/cbt-exams` | Create CBT configuration |
| POST | `/api/v1/cbt-exams/{id}/start` | Student starts CBT → returns randomized questions |
| POST | `/api/v1/cbt-exams/{id}/submit` | Student submits answers → auto-grade, post to scores |

### Exam Schedule & Admit Cards

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/exams/{id}/schedule` | Exam timetable |
| POST | `/api/v1/exams/{id}/schedule` | Set/update schedule |
| GET | `/api/v1/exams/{id}/admit-cards?class_id=` | Admit card data per class |

---

## 12. Cross-Module Relationships

```
Exam ──────────────────< ExamClasses >────────── Class
  │                                                │
  │                                                ▼
  ├──────< ExamSchedule >──────── Subject    Enrollments
  │                                           (students)
  ├──────< ExamQuestions >──────── Subject
  │
  ├──────< CbtExam >
  │           │
  │           └──< CbtStudentSession >──── Student
  │                         │
  │                         │ (auto-post on submit)
  │                         ▼
  │                    scores table  ◄──────── Manual Entry
  │                         │                 (Mark Register)
  │                         │
  │                         ▼
  └────────────── grading_components (linkedComponentId)
                            │
                            ▼
                    grade_boundaries lookup
                            │
                            ▼
                    Result Sheets → Result Card

Teacher ──────────────────────────────────────────────────
    │ creates exam questions
    │ marks invigilation duties (planned)
    ▼
ExamQuestions

Admin ──────────────────────────────────────────────────
    │ schedules exams → assigns classes
    │ generates admit cards
    │ marks exams complete
    │ reviews CBT results
    ▼
Exams + ExamSchedule + AdmitCards
```

### Key Data Flow Summary

```
1. Exam Created
   └─ exam_classes: which classes/sections participate
   └─ exam_schedules: which subject on which date

2. Questions Added
   └─ exam_questions: per subject per exam

3. Exam Goes Ongoing
   └─ CBT: cbt_student_sessions created as students start
   └─ Paper: teachers invigilate, no system action yet

4. Exam Completed
   ├─ CBT: auto-grade on submit → POST to scores table
   │       using linkedComponentId
   └─ Paper: admin/teacher manually enters via Mark Register

5. All scores in → Result generation triggered
   └─ See GRADING.md for complete result pipeline
```

---

### Important Backend Notes

1. **Auto-Status Update** — Use a Laravel scheduled command (`php artisan schedule:run`) to auto-update exam status based on start/end dates:
   ```php
   // In App\Console\Commands\UpdateExamStatuses
   Exam::where('start_date', '<=', today())
       ->where('end_date', '>=', today())
       ->update(['status' => 'Ongoing']);
   
   Exam::where('end_date', '<', today())
       ->where('status', '!=', 'Completed')
       ->update(['status' => 'Completed']);
   ```

2. **CBT Question Randomization** — When a student starts a CBT:
   - Randomly select `questions_count` questions from `exam_questions` for this exam and subject
   - If `shuffle_options` = true, randomize option order but track mapping for correct grading

3. **Time Enforcement** — CBT sessions must be server-side time-limited:
   - Record `started_at` on session start
   - On any submit: if `(now - started_at).seconds > duration_minutes × 60`, mark `status = 'Timed_Out'` and auto-grade with whatever was answered

4. **Score Conflict Resolution** — If a student has both a CBT auto-score AND a manual entry for the same component, the most recent `updated_at` wins — or require admin approval to override CBT scores manually.

5. **Branch Scoping** — All exam records must include `branch_id`. CBT exams inherit their branch from the parent exam record.

---

*See [GRADING.md](./GRADING.md) for the full result generation pipeline that exam scores feed into, and [ADMIN.md](./ADMIN.md) for administrative management of examinations.*
