# 💳 Booking & Milestone Payment Specification (25% / 75%)

## 1. Milestone Payment Model & Business Rules

EventHub enforces a secure, two-stage milestone payment model:

- **Advance Milestone (25%):** Customer pays 25% after Provider Acceptance to lock the booking date and confirm the contract.
- **Final Milestone (75%):** Customer pays the remaining 75% after the event has been completed.
- **Platform Fee:** Currently, **no platform fee** is charged ($0.00 / 0\%$).
- **Customer Authorization Rule:** Provider marking the event as completed **ONLY** makes the final payment available/pending in the UI. It does **NOT** automatically charge the customer's card/account. The customer must explicitly initiate and authorize the 75% final checkout.

---

## 2. Decoupled State Machine Specification

Booking Status and Payment Status are tracked as separate attributes:

```
[Customer Submits Booking Request]
              │
              ▼
    Booking: REQUESTED
    Payment: UNPAID
              │
    ┌─────────┴─────────┐
    ▼                   ▼
[Provider REJECTS]   [Provider ACCEPTS]
    │                   │
    ▼                   ▼
 Booking: REJECTED    Booking: ACCEPTED
 Payment: UNPAID      Payment: ADVANCE_PAYMENT_PENDING (25% required)
                        │
                        ▼
             [Customer Pays 25% Advance via Razorpay]
             [Backend HMAC Signature Verification Passes]
                        │
                        ▼
                     Booking: CONFIRMED
                     Payment: ADVANCE_PAID
                        │
                        ▼
                 [EVENT DAY OCCURS]
                        │
                        ▼
             [Provider Marks "Event Completed"]
                        │
                        ▼
                     Booking: EVENT_COMPLETED
                     Payment: FINAL_PAYMENT_PENDING (75% available)
                        │
                        ▼
             [Customer Initiates & Pays 75% Final Balance]
             [Backend HMAC Signature Verification Passes]
                        │
                        ▼
                     Booking: COMPLETED / FULLY_PAID
                     Payment: FULLY_PAID
                        │
                        ▼
             [Customer Leaves Review & Rating]
```

### Enumeration Details:

#### Booking Status (`booking_status`):
- `REQUESTED` `[EXISTING]` — Submitted by customer; pending provider review.
- `ACCEPTED` `[EXTENDED]` — Provider agreed to perform; awaiting advance deposit.
- `REJECTED` `[EXTENDED]` — Provider declined; booking closed.
- `CONFIRMED` `[EXISTING]` — 25% Advance verified; date locked in calendar.
- `EVENT_COMPLETED` `[NEW]` — Provider delivered performance; final payment pending.
- `COMPLETED` `[EXISTING]` — 100% payments verified and booking finalized.
- `CANCELLED` `[EXISTING]` — Terminated before event performance.

#### Payment Status (`payment_status`):
- `UNPAID` `[NEW]` — Initial state.
- `ADVANCE_PAYMENT_PENDING` `[NEW]` — 25% deposit awaiting customer checkout.
- `ADVANCE_PAID` `[NEW]` — 25% cryptographically verified on backend.
- `FINAL_PAYMENT_PENDING` `[NEW]` — Event concluded; 75% balance awaiting customer checkout.
- `FULLY_PAID` `[NEW]` — 100% total balance verified.
- `REFUNDED` `[NEW]` — Refund processed if booking cancelled according to policy.

---

## 3. Cryptographic Razorpay Verification Flow

Frontend payment handlers must **never** directly mutate database booking states. All transactions follow a strict backend HMAC-SHA256 signature verification loop:

### Step 1: Order Generation `[EXISTING REUSED]`
- **API:** `POST /api/v1/payments/create-order`
- **Request Body:**
  ```json
  {
    "module": "band",
    "module_id": "booking_id_xyz",
    "amount": 25000,
    "currency": "INR"
  }
  ```
- **Backend:** Calls Razorpay SDK (`client.order.create`) and returns `razorpay_order_id`.

### Step 2: Client Checkout Execution `[EXISTING REUSED]`
- Client opens Razorpay modal using `useRazorpay()` hook (`frontend/src/hooks/use-razorpay.ts`).
- User authorizes payment.
- Razorpay returns payload: `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`.

### Step 3: Backend Cryptographic Verification `[EXISTING REUSED]`
- **API:** `POST /api/v1/payments/verify-signature`
- **Request Body:**
  ```json
  {
    "order_id": "order_xyz",
    "payment_id": "pay_abc",
    "signature": "hmac_sha256_signature_from_client"
  }
  ```
- **Backend Verification Logic:**
  ```python
  expected_signature = hmac.new(
      key=settings.RAZORPAY_KEY_SECRET.encode(),
      msg=f"{order_id}|{payment_id}".encode(),
      digestmod=hashlib.sha256
  ).hexdigest()
  
  if expected_signature != signature:
      raise AppException(400, "Invalid payment signature")
  ```
- **State Transition:** Only upon successful cryptographic match, the backend updates the booking to `ADVANCE_PAID` / `CONFIRMED` (or `FULLY_PAID` / `COMPLETED`).
