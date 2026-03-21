# Finance Module — Complete Documentation

> **Path:** `pages/admin/finance/` · **Sidebar section:** Finance
> **JS files:** `fee-collection.js`, `income.js`, `expenses.js`
> **Data files:** `fee-data.json`, `income-data.json`, `expenses-data.json`

---

## 1. Module Overview

The Finance module covers three distinct financial areas:

| Area | Purpose | Key Table |
|------|---------|-----------|
| **Fee Collection** | Student school fees — billing & payment tracking | `fee_payments` |
| **Income** | General school income (not student fees) | `income_records` |
| **Expenses** | School expenditures | `expense_records` |

---

## 2. Fee Collection

**Page:** `finance/fee-collection.html` · **JS:** `fee-collection.js`

### 2.1 Fee Structure

A fee structure defines what a student owes. It's composed of multiple fee types (Tuition, Development Levy, Exam Fee, etc.), each with an amount. Fee structures are defined **per class per term per academic year**.

```json
{
  "id": "FS001",
  "name": "Tuition Fee",
  "amount": 120000,
  "classId": null,
  "termId": "TM002",
  "academicYearId": "AY002",
  "branchId": "BR001"
}
```

> Setting `classId = null` makes it apply to **all classes**. Setting a specific `classId` makes it class-specific.

### Common Fee Types
| Fee Type | Description |
|---------|-------------|
| Tuition Fee | Core school fee |
| Development Levy | Building/infrastructure fund |
| Exam Fee | WAEC/NECO/internal exam |
| Sports Fee | Games & athletics |
| Library Fee | Book maintenance |
| Uniform Fee | One-time on admission |
| PTA Levy | Parent-Teacher Association |

### 2.2 Student Fee Account

Each student has a fee account that shows:
- Total fee owed (sum of all fee structures for their class + term)
- Total amount paid
- Outstanding balance
- Full payment history (transactions)

```json
{
  "studentId": "STU001",
  "termId": "TM002",
  "academicYearId": "AY002",
  "feeStructure": [
    { "feeStructureId": "FS001", "name": "Tuition Fee", "amount": 120000 },
    { "feeStructureId": "FS002", "name": "Development Levy", "amount": 25000 },
    { "feeStructureId": "FS003", "name": "Exam Fee", "amount": 15000 }
  ],
  "totalFee": 160000,
  "paidAmount": 100000,
  "outstanding": 60000,
  "status": "Partial",
  "transactions": [
    {
      "id": "TXN001",
      "date": "2025-01-15",
      "amount": 100000,
      "method": "Bank Transfer",
      "reference": "BT20250115001",
      "remarks": "First installment",
      "receivedBy": "U001"
    }
  ]
}
```

### Fee Payment Status
| Status | Condition |
|--------|-----------|
| `Paid` | `paidAmount >= totalFee` |
| `Partial` | `0 < paidAmount < totalFee` |
| `Unpaid` | `paidAmount == 0` |
| `Overpaid` | `paidAmount > totalFee` (credit balance) |

### Payment Methods
`Cash`, `Bank Transfer`, `Card`, `Online (Paystack/Flutterwave)`, `Cheque`

### 2.3 Receipt Generation

On recording a payment, the system generates a printable receipt containing:
- Student name, class, admission number
- Payment date, amount, method, reference
- Fee breakdown
- Outstanding balance after payment
- Received-by staff name

### Laravel Tables

#### `fee_structures` — What students are billed
```sql
CREATE TABLE fee_structures (
    id BIGINT PK,
    branch_id BIGINT FK,
    academic_year_id BIGINT FK,
    term_id BIGINT FK,
    class_id BIGINT FK NULLABLE,      -- NULL = all classes
    name VARCHAR(100),                -- "Tuition Fee"
    amount DECIMAL(12,2),
    description TEXT NULLABLE
);
```

#### `fee_payments` — Actual payment transactions
```sql
CREATE TABLE fee_payments (
    id BIGINT PK,
    student_id BIGINT FK,
    fee_structure_id BIGINT FK,
    academic_year_id BIGINT FK,
    term_id BIGINT FK,
    amount_paid DECIMAL(12,2),
    payment_date DATE,
    method ENUM('Cash','Bank Transfer','Card','Online','Cheque'),
    reference VARCHAR(100),
    remarks TEXT,
    received_by BIGINT FK,            -- FK to users table
    receipt_number VARCHAR(50) UNIQUE
);
```

### Fee Collection API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/fee-structures?term_id=&class_id=` | List fee structures |
| POST | `/api/v1/fee-structures` | Create fee structure |
| PUT | `/api/v1/fee-structures/{id}` | Update |
| DELETE | `/api/v1/fee-structures/{id}` | Delete |
| GET | `/api/v1/student-fees/{student_id}?term_id=` | Student's fee account |
| POST | `/api/v1/fee-payments` | Record a payment |
| GET | `/api/v1/fee-payments?class_id=&term_id=&status=` | List payments with filters |
| GET | `/api/v1/fee-payments/{id}/receipt` | Generate receipt data |
| GET | `/api/v1/fee-summary?term_id=&class_id=` | Summary: total billed, collected, outstanding |

---

## 3. Income (General)

**Page:** `finance/income.html` · **JS:** `income.js`

### Purpose
Tracks non-fee income: uniform sales, canteen receipts, donations, grants, rental of school facilities.

### Income Record
```json
{
  "id": "INC001",
  "source": "School Uniform Sales",
  "amount": 250000,
  "date": "2024-10-05",
  "category": "Sales",
  "description": "Sold 50 uniform sets at ₦5000 each",
  "recordedBy": "U001"
}
```

### Income Categories
`Sales`, `Donation`, `Grant`, `Facility Rental`, `Event Income`, `Other`

### Laravel Table: `income_records`
```sql
CREATE TABLE income_records (
    id BIGINT PK,
    branch_id BIGINT FK,
    source VARCHAR(200),
    amount DECIMAL(12,2),
    date DATE,
    category VARCHAR(100),
    description TEXT,
    recorded_by BIGINT FK
);
```

### API Endpoints
```
GET    /api/v1/income?category=&start_date=&end_date=&page=
POST   /api/v1/income
PUT    /api/v1/income/{id}
DELETE /api/v1/income/{id}
GET    /api/v1/income/summary?year=2024       → total income by category
```

---

## 4. Expenses

**Page:** `finance/expenses.html` · **JS:** `expenses.js`

### Purpose
Tracks school expenditure: maintenance, salaries, utilities, supplies, events.

### Expense Record
```json
{
  "id": "EXP001",
  "description": "Classroom Renovation — Block A",
  "amount": 500000,
  "date": "2024-10-10",
  "category": "Maintenance",
  "vendor": "Emeka Contractors",
  "approvedBy": "U001",
  "receipt": "url_or_null"
}
```

### Expense Categories
`Maintenance`, `Utilities`, `Salaries`, `Supplies`, `Events`, `Transport`, `IT Equipment`, `Other`

### Laravel Table: `expense_records`
```sql
CREATE TABLE expense_records (
    id BIGINT PK,
    branch_id BIGINT FK,
    description VARCHAR(300),
    amount DECIMAL(12,2),
    date DATE,
    category VARCHAR(100),
    vendor VARCHAR(200),
    approved_by BIGINT FK,
    receipt_url VARCHAR(255)
);
```

### API Endpoints
```
GET    /api/v1/expenses?category=&start_date=&end_date=&page=
POST   /api/v1/expenses
PUT    /api/v1/expenses/{id}
DELETE /api/v1/expenses/{id}
GET    /api/v1/expenses/summary?year=2024     → total expenses by category
```

---

## 5. Financial Dashboard / Reports

### Key Metrics Computed for Finance Dashboard
```
Fee Collection Summary (per term):
  Total Billed      = SUM(fee_structures.amount per class) × enrolled students
  Total Collected   = SUM(fee_payments.amount_paid WHERE term_id = ?)
  Outstanding       = Total Billed - Total Collected
  Collection Rate   = (Collected / Billed) × 100

General P&L (per academic year):
  Total Income      = SUM(fee_payments) + SUM(income_records)
  Total Expenses    = SUM(expense_records)
  Net Balance       = Income - Expenses
```

### API Endpoints
```
GET /api/v1/finance/dashboard?term_id=&academic_year_id=
GET /api/v1/finance/report/fees?from=&to=           → fee collection report
GET /api/v1/finance/report/income-vs-expenses?year= → P&L summary
```

---

## 6. Cross-Module Relationships

```
Student ──< FeePayments (student_id)
FeeStructure ──< FeePayments
FeeStructure → Class (class_id, nullable)
FeeStructure → AcademicYear + Term
FeePayment → User (received_by — the bursar/admin who recorded it)
FeePayment.amount_paid → appears in result card "bills/arrears" section
                          via StudentResultEvaluations.fee_arrears field
```

### Fee Data on Result Card
The **school bills section** on certain result card templates shows:
- Tuition amount (from `result_settings.bills_tuition`)
- Any arrears owed (from `student_result_evaluations.fee_arrears`)

These are manually entered or computed from `fee_payments`:
```php
$outstanding = $totalFee - FeePayment::where('student_id', $id)
    ->where('term_id', $termId)->sum('amount_paid');
$arrears = max(0, $outstanding);
```

*See [HR.md](./HR.md) for payroll (staff salary payments), which is separate from the general expenses table.*
