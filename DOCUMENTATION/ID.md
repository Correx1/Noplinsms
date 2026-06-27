# Smart ID Cards Module — Detailed System Documentation

> **Front-end View:** `pages/admin/academics/id-cards.html`  
> **Javascript Controller:** `js/id-cards.js`  
> **Local Database Keys:** `sms_id_card_config` (Studio Settings), `sms_students` (Students Directory), `sms_school_profile` (Branding & Contact Info)

---

## 1. Module Overview

The **Smart ID Cards Hub** is a premium, high-fidelity system designed for modern schools to customize, configure, preview, bind, and print student identity cards. 

It acts as a complete **Card Design Studio** and **Student Directory** that bridges the gap between digital credentials and physical identity tokens. It features 10 radically unique double-sided design themes, dynamic custom fields, custom signatory blocks, SVG-drawn security codes, and integrated **NFC Card Binding** for automated biometric scanning.

---

## 2. Technical Architecture & Storage Schemas

The module operates entirely client-side using standard HTML5, Tailwind CSS, and local storage state, making it highly responsive and instantly reactive.

### A. Design Studio Configuration (`sms_id_card_config`)
The visual setup of the templates is stored as a serialized JSON object under the key `sms_id_card_config`.

```json
{
  "orientation": "portrait",
  "templateId": 1,
  "showPhoto": true,
  "showDob": true,
  "showBlood": true,
  "showPhone": true,
  "colorMode": "global",
  "cardCustomColor": "#0284c7",
  "showBarcode": true,
  "customBackground": null,
  "signatures": [
    {
      "id": "sig_17182902312",
      "name": "Dr. Adebayo",
      "title": "School Principal",
      "image": "data:image/png;base64,iVBORw0KGgoAAA..."
    }
  ],
  "customFields": [
    { "id": "f_1", "label": "Bus Route", "value": "Route A", "enabled": true }
  ],
  "rules": "This card is the official property of Noplin Academy. If found, please return to the administration desk..."
}
```

### B. Student Entity Schema (`sms_students`)
Each student record contains fields specifically allocated for ID card rendering and biometric scanner validation.

```json
{
  "id": "STU0001",
  "name": "Amara Okafor",
  "className": "SSS3A",
  "session": "2024/2025",
  "dob": "2007-11-14",
  "gender": "Female",
  "bloodGroup": "O+",
  "phone": "08031245678",
  "photo": "data:image/jpeg;base64,...",
  "emoji": "👧",
  "nfc_uid": "NFC88192"
}
```

---

## 3. The 10 High-Fidelity Design Templates

The system renders standard credit-card-sized (**CR80**: `85.6mm x 54mm`) layouts with absolute precision. Visual aesthetics dynamically adjust based on the school's global theme branding color or custom accent color overrides.

| Template ID | Name | Styling Theme & Visual Accents | Photo Layout |
| :--- | :--- | :--- | :--- |
| **Template 1** | Modern Corporate | Minimalist header band matching primary brand color, clean alignment. | Rectangular border matching brand color. |
| **Template 2** | Clean Elegant | Diagonal skewed ribbon accents cutting through the header and footer. | Floating square photo. |
| **Template 3** | Crest Banner | V-shaped shield banner layout inspired by traditional academy emblems. | Centered circular photo with thick white border. |
| **Template 4** | Block Header | Heavy blocks of dark slate and brand colors separating titles. | Square photo. |
| **Template 5** | Wavy Fluid | Curved organic fluid vector shapes acting as top and bottom highlights. | Rounded square photo with brand border. |
| **Template 6** | Elegant Stripes | Dual-tone vertical branding stripes running down the sidebar. | Offset circular photo. |
| **Template 7** | Minimalist Border | Full dark mode theme background with glowing slate and colored outlines. | Circular photo with soft shadow overlay. |
| **Template 8** | Book Traditional | Classic double-border outline mimicking standard certificate pages. | Square photo. |
| **Template 9** | Executive Dark | Dark, rich charcoal background with neon accent color borders. | Rectangular photo with glow drop-shadow. |
| **Template 10** | Tech Glow Grid | Cyberpunk-inspired terminal grid layout with neon green/blue glow details. | Square photo in neon glowing frame. |

---

## 4. Key Functional Features

### 1. Dynamic Layout Studio
Administrators can customize card designs in real time:
- **Orientation Toggle**: Instantly switch between `Portrait` (`230px x 348px` aspect ratio) and `Landscape` (`348px x 230px`).
- **Color Customization**: Choose `Global Theme` (inherits HSL values from the main portal settings) or `Custom Color` (RGB hex picker).
- **Field Toggles**: Toggle display of Photo, Date of Birth, Blood Group, Emergency Contact, and QR code barcodes.
- **Custom Metadata Fields**: Create custom fields dynamically (e.g., *Bus Route*, *Hostel Block*, *Scholarship Status*).

### 2. Signatory Manager
- Upload official signature PNG/JPEG assets.
- Base64 encoding allows images to be stored directly inside the config profile.
- Display multiple signatories on the card front or back with custom titles.

### 3. Smart NFC Credential Binding
- **Hardware Integration**: Connects with physical card writers and keyboard wedge readers.
- **Wedge Focus Capture**: The binding dialog triggers an invisible, auto-focused text field to capture scanned raw UIDs without interfering with the user interface.
- **Database Association**: Saves the captured `nfc_uid` directly onto the student's local storage record, instantly granting access across all physical school registers.

### 4. Direct SVG Security Barcode Generator
- Renders simulated QR code arrays natively using vector inline SVGs.
- Avoids external API dependency, ensuring **100% offline functionality** and extremely fast print compilation.
- Encodes the unique `Student ID` directly within the vector code.

### 5. Double-Sided Batch Printing Sheet
- Matches standard paper sheets (`Letter`/`A4`) for printing.
- Integrates CSS `@media print` directives to automatically hide sidebars, navigation banners, and control panels during printing.
- Renders page-break dividers matching standard paper heights, preventing card layouts from cutting off between pages.

---

## 5. Relational Database Mapping (SQL/Laravel Migration)

To translate this client-side module into a persistent relational database model, use the following migrations.

### Laravel Migration: `student_id_cards`
```php
Schema::create('student_id_cards', function (Blueprint $table) {
    $table->id();
    $table->foreignId('branch_id')->constrained()->onDelete('cascade');
    $table->string('orientation')->default('portrait');
    $table->integer('template_id')->default(1);
    $table->boolean('show_photo')->default(true);
    $table->boolean('show_dob')->default(true);
    $table->boolean('show_blood')->default(true);
    $table->boolean('show_phone')->default(true);
    $table->string('color_mode')->default('global');
    $table->string('card_custom_color', 7)->default('#0284c7');
    $table->boolean('show_barcode')->default(false);
    $table->text('custom_background')->nullable(); // Base64 or cloud URL
    $table->json('signatures')->nullable();        // Array of titles and signature assets
    $table->json('custom_fields')->nullable();     // Dynamic labels and value rules
    $table->text('rules')->nullable();             // Backside terms of use
    $table->timestamps();
});
```

### Laravel Migration: `students` (NFC update)
```php
Schema::table('students', function (Blueprint $table) {
    $table->string('nfc_uid', 50)->nullable()->unique()->after('id');
    $table->string('photo_url', 255)->nullable()->after('gender');
});
```

---

## 6. Cross-Module Relationships

```
                     ┌───────────────────┐
                     │   SchoolProfile   │ (Logo, Name, Address)
                     └─────────┬─────────┘
                               │
                               ▼
 ┌───────────────┐   ┌───────────────────┐   ┌──────────────────┐
 │  ThemeSystem  ├──>│   Student IDCard  │<──┤    Student DB    │
 │ (Brand Color) │   │ (Design Config)   │   │  (Active Class)  │
 └───────────────┘   └─────────┬─────────┘   └────────┬─────────┘
                               │                      │
                               ▼                      ▼
                     ┌──────────────────────────────────┐
                     │          Printed Sheet           │ (CR80 Dimension Card)
                     └────────────────┬─────────────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │  Smart Scanner   │ (Instant NFC Attendance)
                             └──────────────────┘
```

1. **Theme System Integration**: Changes to the brand color in the global theme settings immediately reflect on all printed ID cards set to `global` color mode.
2. **NFC Attendance Link**: The card's `nfc_uid` bound in the ID Cards portal acts as the authentication key for the **NFC Unified Scanner Portal** (`scanner.html`), logging daily biometric attendance, library check-outs, and hostel entries instantly.
3. **Finance/Bursary check**: Printed card barcodes are mapped to the student account, letting the bursar quickly scan a physical card to load outstanding fees on the Bursar desk scanner terminal.
