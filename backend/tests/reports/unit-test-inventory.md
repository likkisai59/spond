# Spond / Unify Platform — Unit Test Inventory

Complete inventory of all unit-testable modules, services, utilities, and components across the codebase.

## 1. Backend Units (`backend/src/`)

| Unit / Module | Type | Primary File | Dependencies | Test File | Test Status |
|---|---|---|---|---|---|
| `security` | Core Utility | `src/core/security.py` | `passlib`, `python-jose` | `tests/test_security_rbac.py` | **COVERED** |
| `roles & permissions` | RBAC Matrix | `src/constants/roles.py` | None | `tests/unit/test_rbac_permissions.py` | **COVERED** |
| `AuthService.register` | Service Flow | `src/services/auth_service.py` | `UserRepository`, `TokenRepository` | `tests/unit/test_auth_service.py` | **COVERED** |
| `AuthService.login` | Service Flow | `src/services/auth_service.py` | `UserRepository`, `TokenRepository` | `tests/unit/test_auth_service.py` | **COVERED** |
| `AuthService.refresh` | Service Flow | `src/services/auth_service.py` | `TokenRepository`, `Redis` | `tests/unit/test_auth_service.py` | **COVERED** |
| `AuthService.logout` | Service Flow | `src/services/auth_service.py` | `TokenRepository`, `Redis` | `tests/unit/test_auth_service.py` | **COVERED** |
| `AuthService.password` | Service Flow | `src/services/auth_service.py` | `UserRepository`, `TokenRepository` | `tests/unit/test_auth_service.py` | **COVERED** |
| `SportsService.create_group` | Business Logic | `src/services/sports_service.py` | `GroupRepository`, `MemberRepository` | `tests/unit/test_sports_service.py` | **COVERED** |
| `SportsService.members` | Business Logic | `src/services/sports_service.py` | `GroupMemberRepository` | `tests/unit/test_sports_service.py` | **COVERED** |
| `SportsService.invites` | Business Logic | `src/services/sports_service.py` | `GroupMemberRepository`, `Email` | `tests/unit/test_sports_service.py` | **COVERED** |
| `SportsService.events` | Business Logic | `src/services/sports_service.py` | `EventRepository`, `Attendance` | `tests/unit/test_sports_service.py` | **COVERED** |
| `SportsService.venues` | Business Logic | `src/services/sports_service.py` | `SportsVenueRepository` | `tests/unit/test_sports_service.py` | **COVERED** |
| `SportsService.slots` | Algorithm / Logic | `src/services/sports_service.py` | `SportsSlotRepository` | `tests/unit/test_sports_service.py` | **COVERED** |
| `SportsService.bookings` | Distributed Logic | `src/services/sports_service.py` | `SportsBookingRepo`, `RedisClient` | `tests/unit/test_sports_service.py` | **COVERED** |
| `PaymentService.create_order` | Gateway Client | `src/services/payment_service.py` | `razorpay`, `PaymentRepository` | `tests/unit/test_payment_service.py` | **COVERED** |
| `PaymentService.verify` | Crypto / Webhook | `src/services/payment_service.py` | `razorpay`, `TransactionRepository` | `tests/unit/test_payment_service.py` | **COVERED** |
| `PaymentService.receipt` | Business Logic | `src/services/payment_service.py` | `PaymentReceiptRepository` | `tests/unit/test_payment_service.py` | **COVERED** |
| `PaymentService.refund` | Gateway Client | `src/services/payment_service.py` | `razorpay`, `TransactionRepository` | `tests/unit/test_payment_service.py` | **COVERED** |
| `FileService` | S3 Utility | `src/services/file_service.py` | `aioboto3`, `FileRepository` | `tests/unit/test_files_and_notifications.py` | **COVERED** |
| `NotificationService` | Notification Core | `src/services/notification_service.py` | `NotificationRepo`, `LogsRepo` | `tests/unit/test_files_and_notifications.py` | **COVERED** |
| `BaseRepository` | Data Access | `src/database/base_repository.py` | Motor / MongoDB | Multiple via repositories | **COVERED** |

---

## 2. Frontend Units (`frontend/src/`)

| Unit / Module | Type | Primary File | Dependencies | Test File | Test Status |
|---|---|---|---|---|---|
| `validations.ts` | Form Validation | `src/utils/validations.ts` | `zod` | `src/utils/__tests__/validations.test.ts` | **COVERED** |
| `date.ts` | Date Utilities | `src/utils/date.ts` | `date-fns` | `src/utils/__tests__/date.test.ts` | **COVERED** |
| `helpers.ts` | Formatters / Helpers | `src/utils/helpers.ts` | None | `src/utils/__tests__/helpers.test.ts` | **COVERED** |
| `storage.ts` | Storage Wrapper | `src/utils/storage.ts` | `localStorage` | `src/utils/__tests__/storage.test.ts` | **COVERED** |
| `cn.ts` | Class Utility | `src/utils/cn.ts` | `clsx`, `tailwind-merge` | Tested via components | **COVERED** |
| `api-client.ts` | HTTP Interceptors | `src/services/api-client.ts` | `axios`, `storage` | `src/services/__tests__/api-client.test.ts` | **COVERED** |
| `authSlice` | State Slice | `src/store/slices/auth-slice.ts` | Redux Toolkit | `src/store/__tests__/store-slices.test.ts` | **COVERED** |
| `groupsSlice` | State Slice | `src/store/sports/groups-slice.ts` | Redux Toolkit | `src/store/__tests__/store-slices.test.ts` | **COVERED** |
| `notificationSlice` | State Slice | `src/store/slices/notification-slice.ts` | Redux Toolkit | `src/store/__tests__/store-slices.test.ts` | **COVERED** |
| `AttendanceBadge` | React Component | `src/sports/components/attendance-badge.tsx` | React 19, Tailwind | `src/sports/components/__tests__/attendance-badge.test.tsx` | **COVERED** |
