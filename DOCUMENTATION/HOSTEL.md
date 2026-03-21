# Hostel Module — Complete Documentation

> **Path:** `pages/admin/hostel/` · **JS:** `hostel.js`
> **Data:** `hostel-data.json`

---

## 1. Module Overview

The Hostel module manages boarding facilities: hostel buildings, rooms, student allocations per term, and nightly hostel attendance. It also integrates with the Finance module for hostel fees.

---

## 2. Hostel Buildings

```json
{
  "id": "HB001",
  "name": "Boys' Hostel Block A",
  "type": "Male",
  "totalRooms": 20,
  "status": "Active"
}
```

### Laravel Table: `hostel_buildings`
```sql
CREATE TABLE hostel_buildings (
    id BIGINT PK,
    branch_id BIGINT FK,
    name VARCHAR(150),
    type ENUM('Male','Female','Mixed'),
    total_rooms INT,
    status ENUM('Active','Inactive')
);
```

---

## 3. Rooms

```json
{
  "id": "HR001",
  "buildingId": "HB001",
  "roomNumber": "101",
  "type": "Standard",
  "capacity": 4,
  "currentOccupants": 3,
  "status": "Active"
}
```

### Room Types
`Standard`, `Dormitory`, `Prefect Room`, `Executive`

### Laravel Table: `hostel_rooms`
```sql
CREATE TABLE hostel_rooms (
    id BIGINT PK,
    building_id BIGINT FK,
    room_number VARCHAR(20),
    type VARCHAR(50),
    capacity INT,
    status ENUM('Active','Maintenance','Inactive'),
    UNIQUE (building_id, room_number)
);
```

---

## 4. Student Allocations

Assigns a student to a specific room for a given term.

```json
{
  "studentId": "STU011",
  "roomId": "HR001",
  "buildingId": "HB001",
  "termId": "TM002",
  "academicYearId": "AY002",
  "bedNumber": "Bed 2",
  "feeStatus": "Paid"
}
```

### Allocation Rules (Backend Must Enforce)
1. Gender match — Male students → Male buildings only
2. Room capacity — cannot exceed `hostel_rooms.capacity`
3. One allocation per student per term

### Laravel Table: `hostel_allocations`
```sql
CREATE TABLE hostel_allocations (
    id BIGINT PK,
    student_id BIGINT FK,
    room_id BIGINT FK,
    term_id BIGINT FK,
    academic_year_id BIGINT FK,
    bed_number VARCHAR(20),
    allocated_at TIMESTAMP,
    UNIQUE (student_id, term_id)    -- one room per student per term
);
```

### API Endpoints
```
GET    /api/v1/hostel/buildings
POST   /api/v1/hostel/buildings
GET    /api/v1/hostel/rooms?building_id=&status=
POST   /api/v1/hostel/rooms
GET    /api/v1/hostel/allocations?term_id=&building_id=
POST   /api/v1/hostel/allocations       { student_id, room_id, term_id, bed_number }
DELETE /api/v1/hostel/allocations/{id}  → vacate room
GET    /api/v1/hostel/rooms/{id}/occupants   → students in this room
```

---

## 5. Hostel Attendance (Night Check)

Daily/nightly check-in tracking for boarding students.

```json
{
  "studentId": "STU011",
  "roomId": "HR001",
  "date": "2025-02-15",
  "checkInTime": "21:30",
  "status": "Present",
  "markedBy": "U008"
}
```

### Status Values: `Present`, `Absent`, `Excused (Permission)`

### Laravel Table: `hostel_attendances`
```sql
CREATE TABLE hostel_attendances (
    id BIGINT PK,
    student_id BIGINT FK,
    room_id BIGINT FK,
    date DATE,
    check_in_time TIME NULLABLE,
    status ENUM('Present','Absent','Excused'),
    marked_by BIGINT FK
);
```

---

## 6. Hostel Fees Integration

Hostel accommodation is an additional fee charged to boarding students. It should appear as a `FeeStructure` item:

```php
FeeStructure::create([
    'name'             => "Hostel Fee — {$building->name}",
    'amount'           => 80000,
    'term_id'          => $termId,
    'academic_year_id' => $yearId,
    'class_id'         => null,     // null = applies to specific student only
]);
```

---

## 7. Cross-Module Relationships

```
HostelBuilding ──< HostelRoom ──< HostelAllocation >──< Student
HostelAllocation → Term + AcademicYear  
HostelAttendance ──< Student ──< HostelAllocation
Student.gender → must match HostelBuilding.type (Male/Female)
```
