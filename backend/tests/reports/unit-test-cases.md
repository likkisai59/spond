# Spond / Unify Platform — Unit Test Cases Specification

Comprehensive specification of all unit test cases executed across backend and frontend suites.

---

## 1. Backend Test Cases

### Suite: AuthService (`tests/unit/test_auth_service.py`)
* `TC-AUTH-001` [Happy]: Register valid user with email, name, password, phone, and sports module -> returns JWT access & refresh tokens, sets role to `member`.
* `TC-AUTH-002` [Negative]: Register with already registered email -> raises `ConflictError` (409) "already exists".
* `TC-AUTH-003` [Negative]: Register with weak password (<8 chars or no numbers) -> raises `UnauthorizedError` (401).
* `TC-AUTH-004` [Happy]: Register with `venue_owner` role -> correctly assigns role without privilege escalation.
* `TC-AUTH-005` [Happy]: Login with valid credentials -> returns user details and dual tokens.
* `TC-AUTH-006` [Negative]: Login with wrong password -> raises `UnauthorizedError` (401).
* `TC-AUTH-007` [Negative]: Login with nonexistent email -> raises `UnauthorizedError` (401).
* `TC-AUTH-008` [Security]: Login with inactive/deactivated account -> raises `ForbiddenError` (403).
* `TC-AUTH-009` [Security]: Refresh token rotation -> rotates to new token, revokes old JTI, rejects reuse attempts.
* `TC-AUTH-010` [Happy]: Logout user -> revokes presented refresh token in Redis/DB.
* `TC-AUTH-011` [Happy/Negative]: Change password -> verifies current password, updates hash, revokes all existing sessions.
* `TC-AUTH-012` [Lifecycle]: Forgot & reset password -> creates single-use token, resets password, forbids token reuse.

### Suite: RBAC & Permissions (`tests/unit/test_rbac_permissions.py`)
* `TC-RBAC-001` [Boundary]: Verify exactly 10 roles are defined in `ALL_ROLES`.
* `TC-RBAC-002` [Security]: Verify admin classification (`super_admin`, `platform_admin`).
* `TC-RBAC-003` [Isolation]: `super_admin` always has reach across both `sports` and `band` modules.
* `TC-RBAC-004` [Isolation]: `platform_admin` reach is limited to assigned accessible modules.
* `TC-RBAC-005` [Isolation]: Sports roles (`sports_admin`, `coach`, `venue_owner`, `player`) cannot access `band` domain.
* `TC-RBAC-006` [Isolation]: Band roles (`band_admin`, `artist`, `band_manager`) cannot access `sports` domain.
* `TC-RBAC-007` [Security]: Discard unrecognized module names during effective module resolution.
* `TC-RBAC-008` [Security]: Wildcard permissions expansion for `super_admin`.
* `TC-RBAC-009` [Security]: Granular permissions for `platform_admin` vs `sports_admin`.
* `TC-RBAC-010` [Security]: Member role restricted to basic read permissions.

### Suite: Sports Domain (`tests/unit/test_sports_service.py`)
* `TC-SPORTS-001` [Happy]: Create sports group -> creator set as Owner, member_count initialized to 1.
* `TC-SPORTS-002` [Negative]: Create duplicate group name -> raises `AppException` (400) "already exists".
* `TC-SPORTS-003` [Lifecycle]: Group member lifecycle -> add member with invite token, update role to Coach, remove member.
* `TC-SPORTS-004` [Lifecycle]: Invitation response -> accept token sets status Confirmed, reject sets Rejected, invalid raises NotFound.
* `TC-SPORTS-005` [Happy]: Create event -> initializes with attendance summary (`going: 0`, `maybe: 0`, `not_responded: 0`).
* `TC-SPORTS-006` [Security]: Venue and slot authorization -> only venue owner can add slots; unauthorized user rejected with 403.
* `TC-SPORTS-007` [Algorithm]: Bulk slot generation -> generates sequential intervals between start_time and end_time.
* `TC-SPORTS-008` [Distributed]: Booking lifecycle -> acquires Redis distributed lock, marks status HELD, sets slot unavailable, confirms booking, cancel frees slot.
* `TC-SPORTS-009` [Negative]: Book already booked slot -> raises `AppException` (400) "Slot is not available".
* `TC-SPORTS-010` [Lifecycle]: Payment request lifecycle -> creates entry fee request, updates status to Paid.

### Suite: Payments (`tests/unit/test_payment_service.py`)
* `TC-PAY-001` [Happy]: Create Razorpay order -> converts amount to paise (`* 100`), passes module notes, returns PENDING order.
* `TC-PAY-002` [Happy]: Verify payment signature -> validates HMAC, marks payment SUCCESS, stores transaction log.
* `TC-PAY-003` [Security]: Verify invalid signature -> catches `SignatureVerificationError`, marks payment FAILED, raises 400.
* `TC-PAY-004` [Negative]: Verify unknown order -> raises `NotFoundError` (404).
* `TC-PAY-005` [Negative]: Generate receipt for unpaid order -> raises `AppException` (400).
* `TC-PAY-006` [Idempotence]: Generate receipt for paid order -> creates REC receipt, subsequent calls return identical record.
* `TC-PAY-007` [Lifecycle]: Refund payment -> gateway refund called, payment status marked REFUNDED, refund transaction logged.

### Suite: Files & Notifications (`tests/unit/test_files_and_notifications.py`)
* `TC-NOTIF-001` [Happy]: Create notification -> stores notification, creates DELIVERED log entry.
* `TC-NOTIF-002` [Happy]: Mark single notification read -> updates `is_read: True`.
* `TC-NOTIF-003` [Happy]: Mark all notifications read -> updates all unread notifications for user.
* `TC-NOTIF-004` [Happy]: Delete notification -> deletes notification and associated logs.
* `TC-FILE-001` [Boundary]: S3 key generation -> formats key with module and optional module_id hierarchy.
* `TC-FILE-002` [Boundary]: File upload size guard -> files > 10MB rejected with `AppException` (400).

---

## 2. Frontend Test Cases

### Suite: Validations (`frontend/src/utils/__tests__/validations.test.ts`)
* `TC-FE-VAL-001` to `005`: Email validation (valid, missing domain, missing @, empty string).
* `TC-FE-VAL-006` to `009`: Password validation (>=8 chars, letter and number required, min length boundary).
* `TC-FE-VAL-010` to `013`: Name validation (min 2, max 64, alphabetic only, rejection of numbers).
* `TC-FE-VAL-014` to `015`: Required string schema and ID validation.

### Suite: Date Utilities (`frontend/src/utils/__tests__/date.test.ts`)
* `TC-FE-DATE-001` to `003`: `formatDate` (default pattern, custom pattern, empty/null/invalid string fallbacks).
* `TC-FE-DATE-004` to `005`: `formatDateTime` with time component and invalid fallback.
* `TC-FE-DATE-006` to `007`: `formatRelative` past date format and fallback.
* `TC-FE-DATE-008` to `009`: `isValidDate` validation for ISO strings, Date objects, and invalid values.

### Suite: Helpers (`frontend/src/utils/__tests__/helpers.test.ts`)
* `TC-FE-HLP-001` to `002`: `capitalize` string formatting.
* `TC-FE-HLP-003` to `004`: `getInitials` extraction for single and multi-word names with null fallback.
* `TC-FE-HLP-005` to `007`: `formatCount` (thousands 'k', millions 'M', raw numbers).
* `TC-FE-HLP-008`: `formatCurrency` INR format.
* `TC-FE-HLP-009` to `010`: `formatTime` 24h to 12h AM/PM conversion with edge cases (00:00, 12:00, 23:59).
* `TC-FE-HLP-011` to `012`: `pathToBreadcrumbs` and `formatFilePath`.
* `TC-FE-HLP-013`: `sleep` promise resolution.

### Suite: Storage (`frontend/src/utils/__tests__/storage.test.ts`)
* `TC-FE-STR-001` to `006`: `storage.set`, `storage.get`, `storage.remove`, `storage.clear`, corrupted JSON handling.

### Suite: API Client (`frontend/src/services/__tests__/api-client.test.ts`)
* `TC-FE-API-001` to `004`: `ApiRequestError` status getters (`isUnauthorized`, `isForbidden`, `isNotFound`, `isValidationError`).
* `TC-FE-API-005` to `007`: `getErrorMessage` error extraction and fallback message.
* `TC-FE-API-008`: Token storage synchronization for authentication.

### Suite: Redux Slices (`frontend/src/store/__tests__/store-slices.test.ts`)
* `TC-FE-RED-001` to `004`: `authSlice` (credentialsReceived, userUpdated, authFailed, loggedOut).
* `TC-FE-RED-005` to `007`: `groupsSlice` (memberAdded, memberRoleChanged, memberRemoved).
* `TC-FE-RED-008` to `010`: `notificationSlice` (notificationAdded, notificationRead, markAllRead, cleared).

### Suite: AttendanceBadge Component (`frontend/src/sports/components/__tests__/attendance-badge.test.tsx`)
* `TC-FE-CMP-001`: Render "Present" when response is "Going".
* `TC-FE-CMP-002`: Render "Absent" when response is "No response".
* `TC-FE-CMP-003`: Render "Maybe" when response is "Maybe".
* `TC-FE-CMP-004`: Direct "Present" and "Absent" response rendering.
* `TC-FE-CMP-005`: Custom `className` merging.
