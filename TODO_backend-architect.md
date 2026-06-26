# TODO Backend Architect: SePay Integration & Credit Wallet System

This checklist documents the backend architecture design, database schemas, REST APIs, security, and implementation tasks for the credit wallet and SePay payment system.

---

## 1. Analyze Requirements

### Functional Requirements
* **Wallet Balance**: Users start with 3 free credits and can purchase credit packages.
* **Credit Packages**: Admin can define package price, name, active status, and credits count (10 credits = 35k, 25 credits = 75k, 50 credits = 100k).
* **Payment Generation**: Create a pending transaction and generate a unique `PaymentCode` (`IPAIxxxxxx`). Retrieve bank account and dynamic SePay QR code link.
* **SePay Webhook Verification**: Receive webhooks, verify signatures, ensure amount match, check transaction expiration, update status to Success, and increment user credits safely.
* **Credit Usage**: Deduct credits when starting HR/Technical interviews or CV analysis. Rollback credit if session fails to initialize. Return `402 Payment Required` if balance is zero.

---

## Architecture Plan & Verification Tasks

* [ ] **ARCH-PLAN-1.1: Database Entities Design**
  * **Purpose**: Define database schema for credits and transactions.
  * **Dependencies**: None.
  * **Implementation Notes**:
    * Created entities: `CreditPackage`, `CreditWallet`, `CreditPaymentTransaction`, and `CreditHistory` in [CreditEntities.cs](file:///d:/HeThongPhongVanOnline-main%20%281%29/HeThongPhongVanOnline-main/server-dotnet/Entities/CreditEntities.cs).
  * **Acceptance Criteria**:
    * Clean C# classes compiled without errors.

* [ ] **DB-1.1: Database Indexing & Unique Constraints**
  * **Purpose**: Enforce transaction uniqueness and prevent double-crediting (idempotency).
  * **Dependencies**: `ARCH-PLAN-1.1`.
  * **Implementation Notes**:
    * Added unique index on `CreditPaymentTransaction.PaymentCode`.
    * Added filtered unique index on `CreditPaymentTransaction.SePayTransactionId` where `[SePayTransactionId] IS NOT NULL`.
  * **Acceptance Criteria**:
    * Concurrent webhook calls with same transaction ID will fail at database level.

* [ ] **DB-1.2: Seed Credit Packages**
  * **Purpose**: Populate default packages in the database.
  * **Dependencies**: `ARCH-PLAN-1.1`.
  * **Implementation Notes**:
    * Populated MBBank/Techcombank pricing packages in `AppDbContext` `OnModelCreating`.
  * **Acceptance Criteria**:
    * Tables populated on migration run.

* [ ] **API-1.1: User Payments & Wallet Endpoints**
  * **Purpose**: Allow clients to browse packages, create payments, view transaction details, and check balance.
  * **Dependencies**: `ARCH-PLAN-1.1`.
  * **Implementation Notes**:
    * Created `PaymentsController` and `CreditsController` with routes:
      * `GET /api/payments/packages`
      * `POST /api/payments/create`
      * `GET /api/payments/{transactionId}`
      * `GET /api/payments/history`
      * `GET /api/credits/wallet`
  * **Acceptance Criteria**:
    * Responses returned match the requested DTO formats. Requires JWT token auth.

* [ ] **API-1.2: SePay Webhook Endpoint**
  * **Purpose**: Endpoint for SePay callback notifications.
  * **Dependencies**: `ARCH-PLAN-1.1`.
  * **Implementation Notes**:
    * Route: `POST /api/payment/sepay/webhook`.
    * No JWT auth required. Supports custom bearer token secret authentication header.
  * **Acceptance Criteria**:
    * Returns 200 OK even on failures to prevent endless callback retries from SePay.

* [ ] **API-1.3: Admin Payment & Packages Controllers**
  * **Purpose**: Expose overview stats and package management features.
  * **Dependencies**: `ARCH-PLAN-1.1`.
  * **Implementation Notes**:
    * Route: `/api/admin/payments/overview` & `/api/admin/payments/transactions`
  * **Acceptance Criteria**:
    * Requires `Admin` role checks. Returns correct revenue counts and sold credits.

* [ ] **SERVICE-1.1: Credit Wallet & Usage Services**
  * **Purpose**: Manage credits deduction, creation, and audit logging.
  * **Dependencies**: `ARCH-PLAN-1.1`.
  * **Implementation Notes**:
    * Implemented `ICreditService` and `CreditService` utilizing DB transactions to guarantee atomic decrements.
  * **Acceptance Criteria**:
    * Automatically grants 3 free credits to new wallets. Deducts free credits first, then paid credits.

* [ ] **SERVICE-1.2: SePay Callback Processing Service**
  * **Purpose**: Verify payload details and apply credits.
  * **Dependencies**: `ARCH-PLAN-1.1`.
  * **Implementation Notes**:
    * Implemented `SePayWebhookService` to parse transactions, verify amount, check timeout, update status, and call `ICreditService` inside a single SQL transaction.
  * **Acceptance Criteria**:
    * Giao dịch thành công cộng đúng số lượng lượt tập của gói tương ứng.

---

## Quality Checklist

* [x] Service boundaries are clear and logic is isolated in services.
* [x] APIs are fully documented in controller routes.
* [x] Database includes filtered unique indexes for safety.
* [x] Authentication and authorization policies are strictly applied.
* [x] Inputs are validated correctly in DTO models.
* [x] Double-crediting safety is handled using DB transaction locks.
* [x] Rollback strategies exist for failed AI sessions.
