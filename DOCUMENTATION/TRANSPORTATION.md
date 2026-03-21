# Transportation Module — Complete Documentation

> **Path:** `pages/admin/transportation/` · **JS:** `transportation.js`
> **Data:** `transport-routes.json`, `transport-vehicles.json`, `transport-drivers.json`

---

## 1. Module Overview

The Transportation module manages the school's fleet of buses, the routes they cover, the drivers assigned to them, and which students ride each route. It also supports daily transport attendance.

---

## 2. Vehicles (Fleet)

**Page:** `transportation/vehicles.html`

### Vehicle Data Model
```json
{
  "id": "VH001",
  "name": "School Bus 1",
  "plateNumber": "LAG-001-KJA",
  "type": "Bus",
  "capacity": 45,
  "driverId": "DR001",
  "status": "Active",
  "insuranceExpiry": "2025-12-31",
  "lastService": "2025-01-20"
}
```

### Vehicle Status Values
| Status | Meaning |
|--------|---------|
| `Active` | In service |
| `On Maintenance` | Under repair |
| `Inactive` | Decommissioned |

### Laravel Table: `transport_vehicles`
```sql
CREATE TABLE transport_vehicles (
    id BIGINT PK,
    branch_id BIGINT FK,
    name VARCHAR(100),
    plate_number VARCHAR(30) UNIQUE,
    type VARCHAR(50),               -- Bus, Mini-bus, Van
    capacity INT,
    driver_id BIGINT FK NULLABLE,
    status ENUM('Active','On Maintenance','Inactive') DEFAULT 'Active',
    insurance_expiry DATE,
    last_service DATE
);
```

---

## 3. Drivers

**Page:** `transportation/drivers.html`

### Driver Data Model
```json
{
  "id": "DR001",
  "name": "Emmanuel Adeyemi",
  "phone": "08023456789",
  "licenseNumber": "LIC2024001",
  "licenseExpiry": "2026-06-30",
  "vehicleId": "VH001",
  "status": "Active",
  "address": "5 Orile Road, Lagos"
}
```

### Laravel Table: `transport_drivers`
```sql
CREATE TABLE transport_drivers (
    id BIGINT PK,
    branch_id BIGINT FK,
    name VARCHAR(150),
    phone VARCHAR(20),
    license_number VARCHAR(50) UNIQUE,
    license_expiry DATE,
    vehicle_id BIGINT FK NULLABLE,
    status ENUM('Active','Inactive'),
    address TEXT
);
```

---

## 4. Routes

**Page:** `transportation/routes.html`

### Route Data Model
```json
{
  "id": "RT001",
  "name": "Victoria Island Route",
  "vehicleId": "VH001",
  "stops": [
    { "order": 1, "location": "Eko Hotel Junction", "time": "06:45" },
    { "order": 2, "location": "Five Cowries Creek", "time": "06:55" },
    { "order": 3, "location": "Ozumba Mbadiwe Ave", "time": "07:05" }
  ],
  "morningPickup": "06:45",
  "afternoonDrop": "14:30",
  "fee": 25000,
  "status": "Active"
}
```

### Laravel Tables

#### `transport_routes`
```sql
CREATE TABLE transport_routes (
    id BIGINT PK,
    branch_id BIGINT FK,
    name VARCHAR(150),
    vehicle_id BIGINT FK,
    morning_pickup TIME,
    afternoon_drop TIME,
    fee DECIMAL(10,2),             -- Monthly/term transport fee
    status ENUM('Active','Inactive')
);
```

#### `transport_route_stops`
```sql
CREATE TABLE transport_route_stops (
    id BIGINT PK,
    route_id BIGINT FK,
    stop_order INT,
    location VARCHAR(200),
    pickup_time TIME
);
```

---

## 5. Student Allocations

**Page:** `transportation/allocations.html`

Assigns a student to a specific route (and optionally a specific stop on that route).

```json
{
  "studentId": "STU001",
  "routeId": "RT001",
  "stopId": "STOP002",
  "termId": "TM002",
  "academicYearId": "AY002"
}
```

### Laravel Table: `transport_allocations`
```sql
CREATE TABLE transport_allocations (
    id BIGINT PK,
    student_id BIGINT FK,
    route_id BIGINT FK,
    stop_id BIGINT FK NULLABLE,
    term_id BIGINT FK,
    academic_year_id BIGINT FK,
    UNIQUE (student_id, term_id)    -- One route per student per term
);
```

---

## 6. Transport Attendance

Daily tracking of students who used the school bus.

```json
{
  "allocationId": "TA_STU001_RT001",
  "studentId": "STU001",
  "routeId": "RT001",
  "date": "2025-02-15",
  "morningStatus": "Boarded",
  "afternoonStatus": "Boarded"
}
```

### Status Values: `Boarded`, `Absent`, `Excused`

### Laravel Table: `transport_attendances`
```sql
CREATE TABLE transport_attendances (
    id BIGINT PK,
    student_id BIGINT FK,
    route_id BIGINT FK,
    date DATE,
    morning_status ENUM('Boarded','Absent','Excused') DEFAULT 'Absent',
    afternoon_status ENUM('Boarded','Absent','Excused') DEFAULT 'Absent'
);
```

---

## 7. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/vehicles` | List fleet |
| POST | `/api/v1/vehicles` | Add vehicle |
| PUT | `/api/v1/vehicles/{id}` | Update |
| GET | `/api/v1/drivers` | List drivers |
| POST | `/api/v1/drivers` | Add driver |
| GET | `/api/v1/routes` | List routes with stops |
| POST | `/api/v1/routes` | Create route |
| POST | `/api/v1/transport-allocations` | Assign student to route |
| DELETE | `/api/v1/transport-allocations/{id}` | Remove student from route |
| GET | `/api/v1/transport-attendance?route_id=&date=` | Attendance by route/date |
| POST | `/api/v1/transport-attendance/bulk` | Mark attendance |

---

## 8. Cross-Module Relationships

```
Route ──< TransportAllocations >──< Student
Route ──── Vehicle ──── Driver
TransportAllocations → Term + AcademicYear
Route.fee → FeeStructure (transport fees can appear on student fee account)
```

### Transport Fee Integration
Route fees can be added as a dedicated `FeeStructure` item on the student's fee account:
```php
FeeStructure::create([
    'name'       => "Transport Fee — {$route->name}",
    'amount'     => $route->fee,
    'term_id'    => $termId,
    'student_id' => $studentId,   // per-student, not per-class
]);
```
