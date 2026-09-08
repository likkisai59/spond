# Spond / Unify Platform — Production Defect Log

Report of confirmed production defects discovered during unit testing implementation and verified with regression testing.

---

## 1. Defect Log Summary

| Defect ID | Module | Severity | Description | Status | Retest Result |
|---|---|---|---|---|---|
| **DEF-001** | `SportsService` (`src/services/sports_service.py`) | **High** | `create_slot` did not default `is_available: True` when `is_available` was omitted in `SlotCreateRequest`, causing new slots to fail `create_booking` immediately. | **RESOLVED** | Verified: `test_venue_and_slots` & `test_booking_lifecycle` PASS |
| **DEF-002** | `NotificationService` (`src/services/notification_service.py`) | **High** | `create_notification` passed inserted document dict directly to `get_notification` causing `ValueError` in `to_object_id`. Additionally, `delete_notification` referenced nonexistent `self.notifications._object_id`. | **RESOLVED** | Verified: `test_notification_create_and_get` & `test_notification_delete` PASS |

---

## 2. Detailed Defect Analysis

### DEF-001: Unset `is_available` in Slot Creation Prevents Booking

* **File:** `src/services/sports_service.py` (Line 429)
* **Severity:** High
* **Symptoms:** Creating a slot without explicitly passing `is_available=True` resulted in a document without `is_available`. When `create_booking` checked `if not slot.get("is_available")`, it rejected the booking with `AppException(400, "Slot is not available")`.
* **Root Cause:** `SlotCreateRequest` in `src/schemas/sports.py` defaults `is_available: bool = True`. However, `data.model_dump(exclude_unset=True)` dropped the field because it was not explicitly supplied in the request body.
* **Surgical Fix:** Added `slot_doc.setdefault("is_available", True)` right after `model_dump`:
  ```python
  slot_doc = data.model_dump(exclude_unset=True)
  slot_doc["venue_id"] = venue_id
  slot_doc.setdefault("is_available", True)
  created = await self.slots.insert(slot_doc)
  ```
* **Retest Verification:** Both `test_venue_and_slots` and `test_booking_lifecycle` passed successfully.

---

### DEF-002: Malformed Entity ID and Missing Method in `NotificationService`

* **File:** `src/services/notification_service.py` (Lines 21-30, Line 55)
* **Severity:** High
* **Symptoms:**
  1. `create_notification` called `nid = await self.notifications.insert(doc)`. Because `BaseRepository.insert` returns a serialized document dict `{"id": "...", ...}`, `get_notification(nid)` received a `dict` instead of an `id` string, causing a crash when `find_by_id` tried to convert it to `ObjectId`.
  2. `delete_notification` invoked `self.notifications._object_id(nid)`. `NotificationRepository` inherits from `BaseRepository` which does not define `_object_id`, causing an `AttributeError`.
* **Root Cause:** Incorrect return value handling from `insert()` and wrong helper function reference (`_object_id` instead of imported `to_object_id`).
* **Surgical Fix:**
  1. Extracted `nid = created["id"]`.
  2. Imported and used `to_object_id(nid)` in `delete_notification`.
* **Retest Verification:** All tests in `test_files_and_notifications.py` passed with 100% success.
