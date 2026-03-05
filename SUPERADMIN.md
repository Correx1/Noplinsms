# Super Admin Role Specification

_(Note: In the current frontend design phase, the Super Admin portal is structurally identical to the Admin portal, but with elevated backend privileges. As the system scales, a dedicated Super-Admin SaaS dashboard for managing multiple schools may be required. For this iteration, their flow is documented here.)_

## Scope of Access

The Super Admin has absolute master access over the entire school instance. They possess every capability of an `Admin` but with the added authority to manage the system environment, create other Admins, and handle destructive actions.

## Expected Backend Validations

- Every endpoint accessed by this role must verify a `super_admin` or `system_admin` elevated permission flag.
- Super Admins should bypass standard ownership checks (e.g., they can edit any teacher's profile, delete any class, irrespective of who created it).

## Super Admin Exclusive Controls (Backend Requirements)

While the frontend sidebar utilizes the standard `components/sidebar.html` (Admin), the backend must support these underlying capabilities for Super Admins:

1. **System Configuration:** Global settings, school branding, timezone, currency setups.
2. **Admin Management:** The ability to add, suspend, or remove basic Admin users.
3. **Database Management (Optional):** Triggering manual backups, archiving old academic years, or purging deleted logs.
4. **Subscription / Licensing:** If this is a SaaS product, managing the school's active subscription, SMS API gateways, and module limits.

_Please refer to [ADMIN.md](./ADMIN.md) for the exhaustive list of modules and day-to-day UX flow, as the Super Admin utilizes the same frontend dashboard structure._
