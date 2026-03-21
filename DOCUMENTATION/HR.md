# Human Resources (HR) Module — Complete Documentation

> **Path:** `pages/admin/hr/` · **JS:** `hr.js` · **Data:** `hr-data.json`
> **Covers:** Departments, Designations, Staff Directory, Leave Management, Payroll

---

## 1. Module Overview

The HR module manages all employment-related data for both **teaching staff (teachers)** and **non-teaching staff**. It extends the basic people records (from the Manage module) with employment details, organizational structure, leave tracking, and payroll.

---

## 2. Departments

**Page:** `hr/departments.html`

Departments are organizational units that staff belong to:

```json
{ "id": "DEP001", "name": "Science", "headId": "T003", "description": "Science faculty" }
```

### Common Departments
- Administration
- Science (Physics, Chemistry, Biology, Mathematics)
- Arts (English, Literature, Government, History)
- Commercial (Economics, Accounting, Commerce)
- Technical (Engineering, IT)
- Support (Maintenance, Security, Kitchen)

### Laravel Table: `departments`
```sql
CREATE TABLE departments (
    id BIGINT PK,
    branch_id BIGINT FK,
    name VARCHAR(100),
    head_id BIGINT FK NULLABLE,    -- FK to teachers or staff
    description TEXT
);
```

### API Endpoints
```
GET    /api/v1/departments
POST   /api/v1/departments
PUT    /api/v1/departments/{id}
DELETE /api/v1/departments/{id}
```

---

## 3. Designations

**Page:** `hr/designations.html`

Job titles / roles within the school:

```json
{ "id": "DES001", "name": "Principal", "level": 1, "departmentId": "DEP001" }
```

### Common Designations
| Designation | Level | Role Type |
|------------|-------|-----------|
| Principal | 1 | Teaching |
| Vice Principal | 2 | Teaching |
| Head of Department (HOD) | 3 | Teaching |
| Class Teacher | 4 | Teaching |
| Subject Teacher | 5 | Teaching |
| Bursar | 3 | Non-Teaching |
| School Secretary | 4 | Non-Teaching |
| Laboratory Assistant | 5 | Non-Teaching |
| Security Guard | 6 | Non-Teaching |
| Cleaner | 7 | Non-Teaching |

### Laravel Table: `designations`
```sql
CREATE TABLE designations (
    id BIGINT PK,
    branch_id BIGINT FK,
    name VARCHAR(100),
    level INT,                  -- hierarchy level (1=highest)
    department_id BIGINT FK
);
```

---

## 4. Staff Directory

**Page:** `hr/staff-directory.html`

Combines teachers and non-teaching staff into one unified HR view. Each person's employment record is shown with:
- Name, photo, designation, department
- Joining date, salary, employment type
- Contact details
- Leave balance

### Extended Employment Fields (added to teachers/staff tables)
```json
{
  "staffId": "T001",
  "departmentId": "DEP002",
  "designationId": "DES004",
  "employmentType": "Full-time",
  "salary": 150000,
  "leaveBalance": {
    "annual": 21,
    "sick": 14,
    "casual": 7
  }
}
```

### Additional Columns on `teachers` / `staff` Tables
```sql
ALTER TABLE teachers ADD COLUMN department_id BIGINT FK;
ALTER TABLE teachers ADD COLUMN designation_id BIGINT FK;
ALTER TABLE teachers ADD COLUMN annual_leave_balance INT DEFAULT 21;
ALTER TABLE teachers ADD COLUMN sick_leave_balance INT DEFAULT 14;
ALTER TABLE teachers ADD COLUMN casual_leave_balance INT DEFAULT 7;
```

---

## 5. Leave Management

**Page:** `hr/leave.html`

### Leave Request Flow
```
Staff submits leave request form
  → Status: Pending
  ↓
Admin reviews and Approves / Rejects
  → Status: Approved / Rejected
  ↓
On approval: leave_balance deducted
On completion of leave dates: Status → Completed
```

### Leave Types
| Type | Typical Days | Paid |
|------|-------------|------|
| Annual Leave | 21 days/year | Yes |
| Sick Leave | 14 days/year | Yes |
| Casual Leave | 7 days/year | Yes |
| Maternity Leave | 90 days | Yes |
| Study Leave | Varies | Partial |
| Unpaid Leave | Varies | No |

### Leave Request Data Model
```json
{
  "id": "LV001",
  "staffId": "T001",
  "staffType": "teacher",
  "type": "Annual",
  "startDate": "2025-03-01",
  "endDate": "2025-03-15",
  "totalDays": 15,
  "reason": "Family vacation",
  "status": "Approved",
  "approvedBy": "U001",
  "handoverNote": "Duties covered by Mrs. Adeola"
}
```

### Laravel Table: `leave_requests`
```sql
CREATE TABLE leave_requests (
    id BIGINT PK,
    branch_id BIGINT FK,
    staff_id BIGINT,
    staff_type ENUM('teacher','staff'),
    type VARCHAR(50),               -- Annual, Sick, Casual, Maternity
    start_date DATE,
    end_date DATE,
    total_days INT,
    reason TEXT,
    handover_note TEXT,
    status ENUM('Pending','Approved','Rejected','Completed') DEFAULT 'Pending',
    approved_by BIGINT FK NULLABLE,
    approved_at TIMESTAMP NULLABLE
);
```

### API Endpoints
```
GET    /api/v1/leave-requests?staff_id=&status=&type=
POST   /api/v1/leave-requests
PATCH  /api/v1/leave-requests/{id}/approve
PATCH  /api/v1/leave-requests/{id}/reject   { reason: "..." }
GET    /api/v1/leave-balance/{staff_id}
```

---

## 6. Payroll

**Page:** `hr/payroll.html`

### Payroll Flow
```
Each month:
  Admin triggers payroll run for selected month
  System fetches all active staff + their salaries
  Computes: gross salary, deductions, net pay
  Generates payslip for each staff
  Admin marks as paid after bank transfer
```

### Payroll Components
```json
{
  "staffId": "T001",
  "month": "2025-02",
  "grossSalary": 150000,
  "allowances": {
    "housing": 20000,
    "transport": 10000
  },
  "deductions": {
    "pension": 11250,
    "nhf": 2500,
    "tax": 8000,
    "absentDays": 0
  },
  "netPay": 158250,
  "status": "Paid",
  "paidDate": "2025-02-28"
}
```

### Common Allowances
`Housing Allowance`, `Transport Allowance`, `Medical Allowance`

### Common Deductions
`Pension (NHF)` — 7.5% of basic salary, `PAYE Tax`, `Loan Repayment`, `Absence Deduction`

### Laravel Tables

#### `payroll_records`
```sql
CREATE TABLE payroll_records (
    id BIGINT PK,
    branch_id BIGINT FK,
    staff_id BIGINT,
    staff_type ENUM('teacher','staff'),
    month VARCHAR(7),               -- "2025-02"
    gross_salary DECIMAL(12,2),
    allowances JSON,
    deductions JSON,
    net_pay DECIMAL(12,2),
    status ENUM('Draft','Processed','Paid') DEFAULT 'Draft',
    paid_date DATE NULLABLE,
    paid_by BIGINT FK NULLABLE
);
```

### API Endpoints
```
GET    /api/v1/payroll?month=2025-02&status=
POST   /api/v1/payroll/run           { month: "2025-02" }   → generate records for all staff
GET    /api/v1/payroll/{id}          → single payroll record
PATCH  /api/v1/payroll/{id}/mark-paid
GET    /api/v1/payroll/payslip/{id}  → payslip data for printing
GET    /api/v1/payroll/summary?month= → total payroll for the month
```

---

## 7. Cross-Module Relationships

```
Teacher ──< LeaveRequests
Staff   ──< LeaveRequests
Teacher / Staff ──< PayrollRecords
Departments ──< Teachers / Staff (department_id)
Designations ──< Teachers / Staff (designation_id)
PayrollRecords.net_pay → ExpenseRecords (monthly salary is a school expense)
```

### Payroll → Expenses Integration
When payroll for a month is marked Paid, it should auto-create a row in `expense_records`:
```php
ExpenseRecord::create([
    'branch_id'   => $branchId,
    'description' => "Staff Payroll — {$month}",
    'amount'      => $totalNetPay,
    'date'        => $paidDate,
    'category'    => 'Salaries',
    'approved_by' => auth()->id()
]);
```
