# How Result Templates Work — Technical Deep Dive

> **Files:** `js/templates/classic.js` · `js/templates/modern.js` · `js/templates/elegant.js`
> **Registry:** `window.TEMPLATE_REGISTRY`
> **Loaded by:** `result-sheets.js`, `result-settings.js`, `session-results.js`

---

## 1. The Template Registry

Every result card template is registered in a **global JavaScript object** called `window.TEMPLATE_REGISTRY`. This object lives in the browser window so any script can access it.

```javascript
// Structure of TEMPLATE_REGISTRY
window.TEMPLATE_REGISTRY = {
  classic: { ... },   // Classic template
  modern:  { ... },   // Modern template
  elegant: { ... }    // Elegant template (Austica-style)
};
```

Each script (`classic.js`, `modern.js`, `elegant.js`) is loaded in the page's `<head>` or before the main logic. On load, it registers itself into this global registry.

### Template Registration Pattern
```javascript
// Inside elegant.js
(function() {
    window.TEMPLATE_REGISTRY.elegant = {
        id: 'elegant',
        name: 'Elegant Series',
        description: 'Double-border report card with sharp borders.',

        capabilities: { ... },   // what sections this template supports

        renderTerm(payload)    { return `<div>...HTML...</div>`; },
        renderSession(payload) { return this.renderTerm(payload); }
    };
})();
```

---

## 2. Template Capabilities

Each template declares what it can display. This drives which setting fields show/hide on the **Result Settings page** and which fields show/hide in the **Domains Modal**.

### Capabilities Object
```javascript
capabilities: {
    studentPhoto:       true,   // Renders student passport photo
    dateOfBirth:        false,  // Shows/hides DOB on student info
    attendance:         true,   // Shows times present/absent section
    closingDate:        true,   // Vacation date field
    resumptionDate:     true,   // Resumption date field
    affectiveDomains:   true,   // Behavioral domain rating section
    psychomotorDomains: true,   // Psychomotor skills section
    schoolBills:        true,   // Fee/bills section
    keysToGrading:      true,   // Grading key table at bottom
    keysToRating:       false,  // Domain rating legend
    teacherRemark:      true,   // Teacher's comment
    headTeacherRemark:  true,   // Head teacher comment
    principalRemark:    true,   // Principal comment
    signatures:         true,   // Principal/headteacher signatures
    subjectPosition:    true,   // Position per subject displayed
    subjectHighLow:     true    // Highest/Lowest score per subject
}
```

### How Capabilities Are Used (result-settings.js)
```javascript
function triggerDynamicUI(tplId) {
    const cap = window.TEMPLATE_REGISTRY[tplId].capabilities;

    // Show/hide setting sections based on template capabilities
    const attSec   = document.getElementById('attendance-config-section');
    const billSec  = document.getElementById('school-bills-section');
    const psychoSec = document.getElementById('psychomotor-domains-section');

    if(attSec)   cap.attendance        ? attSec.classList.remove('hidden')   : attSec.classList.add('hidden');
    if(billSec)  cap.schoolBills       ? billSec.classList.remove('hidden')  : billSec.classList.add('hidden');
    if(psychoSec) cap.psychomotorDomains ? psychoSec.classList.remove('hidden'): psychoSec.classList.add('hidden');
}
```

---

## 3. The Payload Object (What Templates Receive)

The `renderTerm(payload)` and `renderSession(payload)` functions both receive a single comprehensive **payload object**. This is assembled by `buildPrintPayload()` in `result-sheets.js`.

### Complete Payload Structure

```javascript
const payload = {
    // Template metadata
    _templateId: "elegant",           // which template was selected
    _mode: "term",                    // "term" or "session"

    // School identity (from school profile)
    school: {
        name:       "Noplin Academy",
        motto:      "Knowledge is Light",
        address:    "12 School Road, Lagos",
        phone:      "08012345678",
        email:      "admin@noplin.school",
        website:    "www.noplin.school",
        logo:       "base64_or_url",
        themeColor: "#0a195c"        // drives template accent color
    },

    // Student identity
    student: {
        id:    "STU001",
        name:  "Adebayo Ogunlesi",
        roll:  "ADM/2024/001",       // admission number
        class: "SS3A",
        section: "A",
        gender: "Male",
        photo: "base64_or_url"
    },

    // Academic context
    context: {
        term:      "2nd Term",
        session:   "2024/2025",
        class:     "SS3A",
        noInClass: 28                // total students in class
    },

    // Grading structure for column headers in result table
    structure: {
        components: [
            { name: "CA 1",  weight: 10 },
            { name: "CA 2",  weight: 20 },
            { name: "EXAM",  weight: 70 }
        ]
    },

    // Per-subject results (one object per subject)
    subjects: [
        {
            subject:    "Mathematics",
            components: {
                "CA 1": { score: 8,  max: 10 },
                "CA 2": { score: 17, max: 20 },
                "EXAM": { score: 58, max: 70 }
            },
            total:    83,
            grade:    "A1",
            remark:   "Excellent",
            highest:  95,
            lowest:   32,
            position: "3rd"
        }
        // ... one per subject
    ],

    // Aggregated result summary
    summary: {
        grandTotal:      1245,
        average:         "74.7",
        position:        "3rd out of 28",
        positionInt:     3,
        sectionAverage:  "71.2",
        sectionPosition: "2nd out of 14",
        isPromoted:      true        // average >= promotionThreshold
    },

    // Grade boundary key (shown in "grading keys" footer)
    gradingKeys: [
        { grade: "A1", min: 75, max: 100, remark: "Excellent" },
        { grade: "B2", min: 70, max: 74,  remark: "Very Good" }
        // ...
    ],

    // Behavioral evaluations
    evaluation: {
        teacherRemark:     "A hardworking and dedicated student.",
        headTeacherRemark: "Excellent result, keep it up.",
        principalRemark:   "An exceptionally bright child.",
        affectiveDomains:  { "Discipline": 5, "Neatness": 4, "Teamwork": 3 },
        psychomotorDomains: { "Handwriting": 4, "Verbal Fluency": 5 }
    },

    // Attendance figures
    attendance: {
        timesOpened:  110,
        timesPresent: 108,
        timesAbsent:  2
    },

    // School bills shown on result card
    bills: {
        tuition:   "50000",
        equipment: "5000",
        library:   "2000",
        sports:    "3000",
        arrears:   "0"
    },

    // Key dates
    dates: {
        closingDate:    "2025-04-05",
        resumptionDate: "9th September, 2025"
    },

    // Signatory info
    signatures: {
        principalName:    "Mr. Adewale Babatunde",
        principalTitle:   "Principal",
        principalSign:    "base64_image",
        headteacherName:  "Mrs. Chioma Okafor",
        headteacherTitle: "Head Teacher",
        headteacherSign:  "base64_image"
    },

    // Domain labels list (for rendering empty domain rows)
    domainsList:     ["Discipline","Neatness","Attentiveness","Punctuality"],
    psychomotorList: ["Handwriting","Drawing & Painting","Verbal Fluency"]
};
```

---

## 4. The Render Flow — Step by Step

```
1. User clicks "Preview" button for a student on the result sheet

2. result-sheets.js:
   const rec      = currentBroadsheetData.find(r => r.student.id === studentId);
   const settings = getGlobalSettings();   // from localStorage
   const profile  = JSON.parse(localStorage.getItem('sms_school_profile') || '{}');
   const evals    = evalDomainsDb[studentId] || {};

3. buildPrintPayload(rec, { settings, profile, evals, mode:'term', ... })
   → Assembles the complete payload object shown in Section 3

4. The active template ID is determined:
   const tpl = settings.activeTemplate || 'classic';

5. The template's renderTerm() is called:
   const innerHtml = window.TEMPLATE_REGISTRY[tpl].renderTerm(payload);

6. The inner HTML is wrapped in an A4 container:
   const html = `<div class="result-pdf-wrapper w-[210mm] h-[296mm] ...">
       ${innerHtml}
   </div>`;

7. The HTML is injected into the preview modal:
   document.getElementById('rs-preview-body').innerHTML = html;

8. The preview is scaled to fit the screen:
   const scale = Math.min(1, (window.innerWidth - 30) / 794);
   previewContainer.style.transform = `scale(${scale})`;

9. User clicks Print:
   → HTML injected into #print-container
   → window.print() called
   → CSS @media print hides everything except #print-container
   → Browser print dialog opens → Save as PDF
```

---

## 5. How Each Template Differs

### Classic Template (`classic.js`)
- Traditional Nigerian report card layout
- Two-column bottom section (affective domains left, psychomotor right)
- Attendance summary table
- School bills table
- Principal and Head Teacher signatures at bottom
- All capabilities enabled

### Modern Template (`modern.js`)
- Sleek, contemporary layout with colored accent bars
- Score table uses colored grade badges (green=A, blue=B, yellow=C, red=F)
- Minimalist footer with single signature line
- May not show bills section

### Elegant Template (`elegant.js`)
- **Austica Memorial College** replica style
- Double-border frame around entire card (`border inside border`)
- Dark thick borders `1px solid #000` throughout all table cells
- Theme color (`themeColor`) from school profile controls accent
- Affective/psychomotor domains use **checkmark** (✓) system instead of written scores
  ```
  Score 5 = ✓ in "Excellent" column
  Score 4 = ✓ in "V.Good" column
  Score 3 = ✓ in "Good" column
  Score 2 = ✓ in "Poor" column
  Score 1 = ✓ in "V.Poor" column
  ```
- Uses `p.school.themeColor` for headers, subject names, and metadata labels
- `renderSession()` reuses `renderTerm()` — same layout for annual results

---

## 6. The Grading Key Footer

Most templates include a **Grading Key** table at the bottom of the result card, automatically populated from `payload.gradingKeys`:

```javascript
// Inside template renderTerm():
let gradingLine = '';
p.gradingKeys.forEach(g => {
    gradingLine += `${g.min} - ${g.max} : ${g.grade} (${g.remark.toUpperCase()}) | `;
});
// Result: "75-100: A1 (EXCELLENT) | 70-74: B2 (VERY GOOD) | ..."
```

---

## 7. Adding a New Template (Guide for Backend Team)

Templates are **100% frontend HTML/CSS**. The backend does NOT need to know about them. The backend's only job is to feed the correct data via API — the template renders everything in the browser.

### Steps to Create a New Template
1. Create `js/templates/my-template.js`
2. Register into `window.TEMPLATE_REGISTRY.myTemplate = { ... }`
3. Declare `capabilities` object
4. Implement `renderTerm(payload)` that returns an HTML string using only inline CSS (for print compatibility)
5. Optionally implement `renderSession(payload)` (or reuse renderTerm)
6. Load the script in the result-related HTML pages
7. Add the new template as a radio button option on the **Result Settings** page

### Print Compatibility Rule
All CSS inside templates **must be inline** (`style="..."` on every element). External CSS classes do NOT print correctly in all browsers. This is why every `<td>` in the templates has explicit `style="border:1px solid #000; padding:6px; ..."`.

---

## 8. Session vs Term Render Mode

The `_mode` field in the payload tells the template what type of result to render:

| Mode | Subject Data | Position | Context |
|------|-------------|---------|---------|
| `term` | Per-component scores + total | Class position this term | Term + Session |
| `session` | Term1 + Term2 + Term3 scores + annual average | Annual position | Session only |

For session mode, the `subjects` array items look like:
```javascript
{
    subject:  "Mathematics",
    t1: 76,   // Term 1 score
    t2: 82,   // Term 2 score
    t3: 71,   // Term 3 score
    annual: 76.3,   // Average of 3 terms
    grade: "A1",
    remark: "Excellent"
}
```

---

## 9. Backend's Role in Templates

The backend should:
1. **Store the active template name** in `result_settings.active_template` (e.g., `"elegant"`)
2. **Serve all payload data** via the result sheet API endpoint — the frontend assembles the payload from this data
3. **NOT render the HTML** — result card rendering is entirely client-side
4. **Optionally generate PDFs server-side** (for download without browser print dialog) using `puppeteer`, `wkhtmltopdf`, or `laravel-dompdf` by feeding the same payload data to a server-side HTML template

### Optional: Server-Side PDF Generation
```php
// Using barryvdh/laravel-dompdf
$payload = $this->buildResultPayload($student, $term);
$html = view('result-templates.elegant', ['payload' => $payload])->render();
$pdf = PDF::loadHTML($html)->setPaper('A4', 'portrait');
return $pdf->download("result_{$student->admission_number}.pdf");
```
This requires porting the frontend HTML templates into Blade views with the same inline CSS.
