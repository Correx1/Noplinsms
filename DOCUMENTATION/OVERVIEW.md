# Dynamic Data Overview — Cross-System Dropdown & Data Dependencies

> **Purpose:** This document informs the backend developer that **almost every dropdown, select input, and data table across the entire Noplin SMS frontend is dynamic** — populated from API responses, not hardcoded. This section explains the dependency chain and the expected API contracts that drive this dynamism.

---

## 1. The Core Principle

> **Nothing is hardcoded. Everything comes from the database.**

When the admin adds a class with its sections, those sections immediately appear in every section dropdown across the system — Score Sheets, Timetable, Attendance, Hostel, Transport, Results, and more. When a teacher is added, they appear in every teacher assignment dropdown. When a subject is linked to a class, it appears on that class's score entry form.

**The frontend simply fetches and renders. The backend owns all the data.**

---

## 2. The Class → Section Cascade

This is the most important dependency chain in the system. It runs across **every module**.

### How It Works

```
Admin adds a Class (e.g., JSS1) with Sections (A, B, C)
                ↓
Section A, B, C are stored in the DB → sections table
                ↓
Every dropdown in the system that asks "which section?" 
fetches from: GET /api/v1/sections?class_id={selectedClassId}
                ↓
Selecting JSS1 in any Class dropdown → dynamically loads A, B, C in the Section dropdown
```

### Where This Cascade Appears

| Module | Class → Section Cascade? |
|--------|--------------------------|
| Score Sheets / Mark Entry | ✅ Yes |
| Master Sheet | ✅ Yes |
| Cumulative Master Sheet | ✅ Yes |
| Result Sheets | ✅ Yes |
| Session Results | ✅ Yes |
| Attendance | ✅ Yes |
| Timetable | ✅ Yes |
| Promote Students | ✅ Yes |
| Hostel Allocations | ✅ Yes (student → section) |
| Transport Allocations | ✅ Yes (student → section) |
| Exam Scheduling | ✅ Yes |
| CBT Setup | ✅ Yes |
| ID Card Generator | ✅ Yes |
| Report Filters | ✅ Yes |

### Backend Must Implement

```
GET /api/v1/classes?academic_year_id=AY002
→ Returns all classes for the current academic year

GET /api/v1/sections?class_id=C004
→ Returns sections ONLY for the selected class

// Response shape:
[
  { "id": "S001", "name": "A", "class_id": "C004" },
  { "id": "S002", "name": "B", "class_id": "C004" },
  { "id": "S003", "name": "C", "class_id": "C004" }
]
```

**Every section dropdown listens to the class dropdown's `change` event and re-fetches.**

---

## 3. Class → Subject Cascade

When a class is selected on any score entry or result form, the **subject list** is filtered to only show subjects assigned to that class.

```
Admin assigns subjects to classes via: POST /api/v1/subjects/{id}/assign-classes
                ↓
GET /api/v1/subjects?class_id=C004
→ Returns only subjects linked to JSS1, not all subjects in school
```

### Where This Appears
- Score Sheets (subject column headers come from class-linked subjects)
- Mark Entry (subject dropdown filters by selected class)
- Timetable builder (only class-relevant subjects shown)
- Syllabus management

---

## 4. Class → Grading Structure Cascade

Each class is linked to exactly one grading structure (e.g., Junior uses CA1+CA2+Exam = 100%, Senior uses different weights).

```
GET /api/v1/grading-structures?class_id=C004
→ Returns the structure and its components for that class

// Response:
{
  "id": "STR-Junior",
  "components": [
    { "name": "CA 1", "weight": 10 },
    { "name": "CA 2", "weight": 20 },
    { "name": "Exam", "weight": 70 }
  ]
}
```

- The **score sheet column headers** are built from this response — not hardcoded
- If a class has no assigned structure, score entry cannot proceed
- The **result card** uses this same structure to know which columns to show

---

## 5. Term → Academic Year Relationship

All time-scoped data is term-aware. The term dropdown depends on the selected academic year.

```
GET /api/v1/academic-years          → loads the Year dropdown
GET /api/v1/terms?academic_year_id= → loads Term dropdown when year changes
```

- Selecting **2024/2025** → shows **First Term, Second Term, Third Term** for that year only
- Every data fetch (scores, attendance, results) includes **both** `term_id` and `academic_year_id`

---

## 6. Teacher Dropdowns

Teacher options across the system (Form Teacher, Section Teachers, Subject Teachers) come from:

```
GET /api/v1/teachers?status=Active&branch_id=BR001
→ Returns all active teachers for the branch
```

### Where This Appears
- **Add/Edit Class form** → Form Teacher select
- **Add/Edit Section form** → Section Teachers multi-select
- **Add/Edit Subject form** → Subject Teachers multi-select
- **Timetable builder** → Teacher column per slot
- **Score sheet** → "Entered by" teacher field

---

## 7. Student Dropdowns & Lists

Student lists in any module are always filtered by **class + section + term**:

```
GET /api/v1/students?class_id=C004&section_id=S006&status=Active
→ Returns students enrolled in JSS1A for the current term
```

- Score entry rows = exactly this list
- Attendance registers = exactly this list
- Domain evaluation modals = exactly this list
- Result sheets = exactly this list

If a student is transferred or set to Inactive, they **disappear from all dropdowns and lists** instantly.

---

## 8. Parent → Student Link in Parent Portal

In the Parent portal, when a parent logs in, the system fetches only their linked students:

```
GET /api/v1/parents/{parent_id}/students
→ Returns only the children linked to this parent account
```

The parent never sees other students' data. All dashboards, result views, and fee summaries are scoped to these linked students only.

---

## 9. Branch Scoping (Multi-Tenancy)

Every API call is **automatically scoped to the authenticated user's branch**. The frontend sends a `branch_id` (or it's derived from the auth token on the backend).

```
// ALL these are filtered by branch automatically:
GET /api/v1/classes        → only classes in this branch
GET /api/v1/students       → only students in this branch
GET /api/v1/teachers       → only teachers in this branch
GET /api/v1/fee-structures → only fee structures for this branch
```

**The Owner portal is the only exception** — it can switch between branches and sees all.

---

## 10. Summary Table — All Dynamic Dropdowns

| Dropdown | Depends On | API Endpoint |
|----------|-----------|-------------|
| Section | Selected Class | `GET /sections?class_id=` |
| Subject | Selected Class | `GET /subjects?class_id=` |
| Grading Structure | Selected Class | `GET /grading-structures?class_id=` |
| Term | Selected Academic Year | `GET /terms?academic_year_id=` |
| Student List | Class + Section + Term | `GET /students?class_id=&section_id=` |
| Teacher List | Branch (Active only) | `GET /teachers?status=Active` |
| Parent's Children | Logged-in Parent | `GET /parents/{id}/students` |
| Exam Questions | Subject + Exam | `GET /exam-questions?exam_id=` |
| Fee Structures | Class + Term | `GET /fee-structures?class_id=&term_id=` |
| Hostel Rooms | Selected Building | `GET /hostel/rooms?building_id=` |
| Transport Routes | Branch | `GET /routes` |

---

## 11. Implementation Recommendation

### On the Backend

Each relevant endpoint **must** accept filter query parameters and return filtered results. Do not return all records and let the frontend filter — always filter on the database query level.

```php
// Example: sections filtered by class
public function index(Request $request) {
    $query = Section::query()->where('branch_id', auth()->user()->branch_id);
    
    if ($request->class_id) {
        $query->where('class_id', $request->class_id);
    }
    
    return SectionResource::collection($query->get());
}
```

### On the Frontend

The frontend JavaScript pattern for all cascading dropdowns:

```javascript
classSelect.addEventListener('change', async () => {
    const classId = classSelect.value;
    sectionSelect.innerHTML = '<option>Loading...</option>';
    
    const sections = await fetch(`/api/v1/sections?class_id=${classId}`)
        .then(r => r.json());
    
    sectionSelect.innerHTML = sections.map(s =>
        `<option value="${s.id}">${s.name}</option>`
    ).join('');
});
```

This pattern is used consistently everywhere in the system.

---

*The frontend is fully built with this dynamic model in mind. The backend simply needs to return the correctly filtered data from the endpoints described above, and the entire UI will work seamlessly.*
