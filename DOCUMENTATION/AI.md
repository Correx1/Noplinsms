# AI & Automations Module — Complete Documentation

> **Page:** `pages/admin/ai-automations.html` · **JS:** `ai-automations.js`

---

## 1. Module Overview

The AI & Automations module provides smart automation features that reduce administrative workload by using data already stored in the system. These are **rule-based automations** (not true ML/AI — the name reflects the smart, data-driven nature of the features).

### Feature Categories

| Category | Feature |
|----------|---------|
| Auto-Notifications | Fee reminders, result release alerts, exam notices |
| Smart Reporting | Auto-generated performance summaries |
| Result Analytics | Identify at-risk students, top performers |
| Fee Analytics | Students with multiple outstanding terms |
| Bulk Messaging | SMS/email campaigns to parents or students |
| Attendance Intelligence | Students below attendance threshold |
| Scheduled Actions | Auto-update exam statuses, term transitions |

---

## 2. Auto Notifications

### Trigger-Based Notifications
These fire automatically when certain conditions are met:

| Trigger | Recipients | Message Type |
|---------|-----------|-------------|
| Student fee outstanding > 30 days | Parent | SMS/Email |
| Result published for a class | All students in class | In-app + Email |
| Exam period starts | Students + Parents | SMS |
| Exam results entered | Admin | In-app |
| Student attendance below 75% | Parent | SMS |
| Leave request submitted | Admin | In-app |
| Leave approved/rejected | Staff | In-app |

### Setting Up Automation Rules
```json
{
  "id": "AUTO001",
  "name": "Low Attendance Alert",
  "trigger": "attendance.rate_below_threshold",
  "threshold": 75,
  "recipients": "parent",
  "channel": "SMS",
  "template": "TPL003",
  "active": true,
  "frequency": "weekly"
}
```

### Laravel Table: `automation_rules`
```sql
CREATE TABLE automation_rules (
    id BIGINT PK,
    branch_id BIGINT FK,
    name VARCHAR(150),
    trigger_event VARCHAR(100),
    threshold DECIMAL(10,2) NULLABLE,
    recipients VARCHAR(50),         -- parent, student, admin, teacher
    channel ENUM('SMS','Email','InApp','All'),
    template_id BIGINT FK NULLABLE,
    is_active BOOLEAN DEFAULT TRUE,
    frequency VARCHAR(20)           -- daily, weekly, monthly, on_trigger
);
```

---

## 3. Smart Performance Analytics

### At-Risk Students Detection
The system scans scores to identify students likely to fail:

```
Criteria:
  - Any subject score < 50 in 2+ consecutive terms
  - Overall average < 45
  - Attendance rate < 75%
  - Outstanding fees for 2+ terms

Output: "At-Risk Students" list shown to admin with reasons
```

### Top Performers
```
Criteria:
  - Overall average ≥ 80 in current term
  - Attendance ≥ 95%
  - No outstanding fees

Output: "Honor Roll" list for recognition
```

### Laravel API
```
GET /api/v1/ai/at-risk-students?term_id=TM002&threshold=45
GET /api/v1/ai/top-performers?term_id=TM002&min_average=80
```

### Response Example
```json
{
  "atRiskStudents": [
    {
      "studentId": "STU015",
      "name": "Chukwuemeka Obi",
      "class": "SS2A",
      "average": 38.5,
      "reasons": ["Average below 45", "3 subjects below 50", "Attendance 62%"],
      "trend": "declining"
    }
  ]
}
```

---

## 4. Bulk Messaging

### Compose & Send
Admin composes a message and sends to:
- All students in a class
- All parents of a class
- All teachers
- Specific individuals

```json
{
  "id": "MSG001",
  "title": "PTA Meeting Notice",
  "body": "Dear Parents, there is a PTA meeting on Friday 28th February at 10am in the school hall.",
  "channel": "SMS",
  "recipients": {
    "type": "class_parents",
    "classIds": ["C004", "C005", "C006"]
  },
  "scheduledAt": null,
  "sentAt": "2025-02-20T10:00:00",
  "status": "Sent",
  "deliveredCount": 87,
  "failedCount": 3
}
```

### Laravel Table: `bulk_messages`
```sql
CREATE TABLE bulk_messages (
    id BIGINT PK,
    branch_id BIGINT FK,
    title VARCHAR(200),
    body TEXT,
    channel ENUM('SMS','Email','InApp'),
    recipient_type VARCHAR(50),    -- all_parents, class_students, all_teachers
    recipient_filter JSON,         -- { class_ids: [...] }
    scheduled_at TIMESTAMP NULLABLE,
    sent_at TIMESTAMP NULLABLE,
    status ENUM('Draft','Scheduled','Sending','Sent','Failed'),
    delivered_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    sent_by BIGINT FK
);
```

### API Endpoints
```
POST   /api/v1/messages/bulk           → send or schedule bulk message
GET    /api/v1/messages/bulk?status=   → list past messages
GET    /api/v1/messages/bulk/{id}      → detail with delivery stats
POST   /api/v1/messages/preview        → preview with placeholder replacements
```

---

## 5. Fee Outstanding Automation

### What It Does
Scans all students for unpaid fees and triggers reminders to parents:
- 1st reminder: 7 days after term starts
- 2nd reminder: 21 days after term starts
- 3rd reminder (escalation): admin alert + automatic SMS to parent

### Report Generated
```json
{
  "term": "2nd Term 2024/2025",
  "totalStudents": 240,
  "fullyPaid": 180,
  "partial": 42,
  "unpaid": 18,
  "totalOutstanding": 4800000,
  "topDefaulters": [
    { "studentId": "STU055", "name": "Emeka Okafor", "outstanding": 160000, "terms": 2 }
  ]
}
```

---

## 6. Scheduled Laravel Commands

These backend commands power the automation engine:

```php
// app/Console/Kernel.php

$schedule->command('sms:send-fee-reminders')->weekly();
$schedule->command('attendance:update-risk-flags')->daily();
$schedule->command('exams:update-statuses')->daily();
$schedule->command('terms:check-transitions')->daily();
$schedule->command('payroll:remind-admin')->monthly();
```

### Command Examples

```php
// app/Console/Commands/SendFeeReminders.php
Artisan::command('sms:send-fee-reminders', function() {
    $outstanding = FeePayment::getOutstandingStudents(currentTermId());
    foreach ($outstanding as $student) {
        $parent = $student->parents()->where('is_primary_contact', true)->first();
        if ($parent && $parent->phone) {
            SMS::send($parent->phone, templateMessage('fee_reminder', $student));
        }
    }
});
```

---

## 7. SMS & Email Integration

### Recommended Services
| Service | Use Case |
|---------|---------|
| **Termii** | Nigerian bulk SMS (cheapest) |
| **Twilio** | International SMS |
| **Mailgun / SendGrid** | Email delivery |

### Laravel Config (`config/sms.php`)
```php
return [
    'provider' => env('SMS_PROVIDER', 'termii'),
    'termii' => [
        'api_key' => env('TERMII_API_KEY'),
        'sender_id' => env('TERMII_SENDER_ID'),
    ],
];
```

### Phone Log Table
```sql
CREATE TABLE phone_logs (
    id BIGINT PK,
    branch_id BIGINT FK,
    recipient VARCHAR(20),
    message TEXT,
    status ENUM('Sent','Failed','Pending'),
    provider VARCHAR(50),
    sent_at TIMESTAMP,
    error_message VARCHAR(255) NULLABLE
);
```

---

## 8. AI Dashboard Display

The admin-facing AI dashboard shows:

| Widget | Data Source |
|--------|------------|
| At-Risk Students count | Computed from scores + attendance |
| Fee Collection rate this term | From fee_payments |
| Avg Attendance this week | From attendances |
| Top 5 Students | From scores |
| Pending automations | From automation_rules |
| Recent SMS logs | From phone_logs |

### API
```
GET /api/v1/ai/dashboard-summary
```
