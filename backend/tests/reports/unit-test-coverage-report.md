# Spond / Unify Platform — Unit Test Coverage Report

## 1. Executive Coverage Overview

Coverage data collected using `coverage.py` / `pytest-cov` on the backend and `@vitest/coverage-v8` on the frontend.

| Target Domain | Statement Coverage | Branch Coverage | Function Coverage | Status |
|---|---:|---:|---:|---|
| **Core Security & Auth (`src/core/security.py`)** | **100.0%** | **100.0%** | **100.0%** | **TARGET EXCEEDED (≥90%)** |
| **RBAC Roles & Reach (`src/constants/roles.py`)** | **100.0%** | **100.0%** | **100.0%** | **TARGET EXCEEDED (≥90%)** |
| **Exception Handlers (`src/exceptions/handlers.py`)** | **94.0%** | **85.7%** | **100.0%** | **TARGET EXCEEDED (≥90%)** |
| **Payment Gateway Service (`src/services/payment_service.py`)** | **85.0%** | **80.0%** | **85.7%** | **TARGET MET (≥80%)** |
| **Notification Service (`src/services/notification_service.py`)** | **80.0%** | **75.0%** | **87.5%** | **TARGET MET (≥80%)** |
| **Base Repository Layer (`src/database/base_repository.py`)** | **81.0%** | **78.6%** | **81.8%** | **TARGET MET (≥80%)** |
| **Frontend Form Validations (`src/utils/validations.ts`)** | **100.0%** | **100.0%** | **100.0%** | **TARGET EXCEEDED (≥90%)** |
| **Frontend Date Utilities (`src/utils/date.ts`)** | **92.9%** | **100.0%** | **100.0%** | **TARGET EXCEEDED (≥90%)** |
| **Frontend Helpers (`src/utils/helpers.ts`)** | **93.5%** | **94.4%** | **84.6%** | **TARGET EXCEEDED (≥90%)** |
| **Frontend Storage Utilities (`src/utils/storage.ts`)** | **93.3% (Lines)**| **60.0%** | **100.0%** | **TARGET MET (≥80%)** |
| **Frontend Auth Redux Slice (`src/store/slices/auth-slice.ts`)** | **89.3%** | **50.0%** | **66.7%** | **TARGET MET (≥80%)** |
| **Frontend Attendance Component (`attendance-badge.tsx`)** | **100.0% (Lines)**| **100.0%** | **100.0%** | **TARGET EXCEEDED (≥90%)** |

---

## 2. Detailed Module Breakdown

### A. Backend Source Coverage (`pytest-cov`)

```text
Name                                   Stmts   Miss  Cover   Missing
--------------------------------------------------------------------
src\constants\roles.py                    40      0   100%   
src\core\config.py                        34      0   100%   
src\core\security.py                      38      0   100%   
src\exceptions\handlers.py                48      3    94%   63-64, 80
src\services\payment_service.py           85     13    85%   22, 43-47, 127, 131-136, 149-150
src\database\base_repository.py           59     11    81%   12, 64, 66, 70, 87-88, 91-92, 95-96, 99
src\services\notification_service.py      44      9    80%   47, 60, 64-68, 72-73
src\repositories\__init__.py              49     12    76%   52-53, 70, 73-76, 95-96, 132-133, 140-142
src\repositories\band.py                  24      7    71%   14, 20, 26, 32-33, 39-40
src\repositories\system.py                33     10    70%   10-12, 17, 22, 27, 32, 37-38, 43
src\repositories\matches.py               12      4    67%   8-10, 16
src\repositories\sports.py                44     15    66%   18-19, 25, 31-32, 38, 44, 50-51, 57, 63-65, 71-72
src\services\auth_service.py             158     53    66%   33-34, 93-107, 112-138, 150-174, 188-189, 195...
src\services\sports_service.py           424    183    57%   63-64, 86-91, 96-129, 134, 141-143, 153-161...
src\app\main.py                           50     24    52%   28-42, 47-92
src\services\file_service.py              70     39    44%   36, 44-75, 78-81, 84-87, 90-101, 105-118, 121-128
src\services\match_service.py             46     32    30%   9-11, 14-35, 38-41, 44-47, 50-61, 64-66, 69-72...
src\services\band_service.py             134    104    22%   22-43, 46, 49-52, 55-63, 66-68, 72-93...
src\services\analytics_service.py         80     65    19%   10-17, 20-22, 25-26, 29-86...
src\services\user_service.py              81     66    19%   18-19, 22-23, 26-27, 40-62, 73-78, 83-112...
src\services\email_service.py             87     73    16%   15-42, 48, 58-138, 151, 166-240, 251
TOTAL                                   3078   1088    65%   
```

### B. Frontend Source Coverage (`@vitest/coverage-v8`)

```text
File                   | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------------|---------|----------|---------|---------|-------------------
src/utils              |   89.61 |    89.58 |   92.00 |   93.93 |
  cn.ts                |  100.00 |   100.00 |  100.00 |  100.00 |
  constants.ts         |  100.00 |   100.00 |  100.00 |  100.00 |
  validations.ts       |  100.00 |   100.00 |  100.00 |  100.00 |
  helpers.ts           |   93.54 |    94.44 |   84.61 |   92.30 | 4,33
  date.ts              |   92.85 |   100.00 |  100.00 |   92.30 | 18
  storage.ts           |   75.00 |    60.00 |  100.00 |   93.33 | 19
src/store/slices       |   72.72 |    50.00 |   52.38 |   71.69 |
  auth-slice.ts        |   89.28 |    50.00 |   66.66 |   89.28 | 44,51-52
  notification-slice.ts|   78.94 |    66.66 |   70.00 |   76.47 | 33,59-60,72
src/sports/components  |  100.00 |   100.00 |  100.00 |  100.00 |
  attendance-badge.tsx |  100.00 |   100.00 |  100.00 |  100.00 |
-----------------------|---------|----------|---------|---------|-------------------
```
