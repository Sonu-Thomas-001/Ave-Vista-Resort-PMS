# Ave Vista PMS - QA Test Report
**Date**: 2026-02-03
**Tester**: Antigravity (Static Analysis Mode)

> [!WARNING]
> **Browser Testing Unavailable**: The automated browser testing environment failed to initialize (`$HOME` variable error). This report is based on a comprehensive **Static Code Analysis** of the provided source files.

## 🚨 Critical Issues (Logic & Data)

### 1. Dashboard Revenue Chart Broken
*   **Issue Type**: Logic / Database Mismatch
*   **Severity**: **Critical**
*   **Location**: `src/app/page.tsx` (Line 63)
*   **Description**: The Dashboard attempts to fetch a column named `amount` from the `invoices` table to calculate revenue. However, the `BillingPage` inserts data into `total_amount` and `paid_amount`. The column `amount` likely does not exist or is legacy.
*   **Impact**: "Today's Revenue" will always show ₹0 or cause a query error.
*   **Fix**: Update reference to `total_amount` or `paid_amount`.
    ```typescript
    // Change Line 63 in page.tsx
    .select('paid_amount') // Use this for actual cash flow
    ```

### 2. Invoice GST Logic Missing
*   **Issue Type**: Logic / Financial
*   **Severity**: **Critical**
*   **Location**: `src/app/billing/page.tsx` (Lines 52-70)
*   **Description**: When creating a new invoice, the user selects a "GST Rate" (12%/18%) and enters a "Total Amount". The code saves the `gst_rate` but **does not apply it** to the final calculation. The `total_amount` inserted is exactly what the user typed.
*   **Impact**: Invoices may be undercharged (if user entered pre-tax amount) or tax reporting will be incorrect.
*   **Fix**: Update `handleCreateInvoice` to calculate tax:
    ```typescript
    const base = parseFloat(newInv.amount);
    const tax = base * (parseInt(newInv.gstRate) / 100);
    const finalTotal = base + tax; // If input is pre-tax
    ```

## ⚠️ Medium Priority Issues (UI & UX)

### 3. Guest List "Room Number" Crash Risk
*   **Issue Type**: Logic / Runtime Error
*   **Severity**: Medium
*   **Location**: `src/app/guests/page.tsx` (Line 76)
*   **Description**: The Supabase query fetches `bookings ( rooms (room_number) )`. If a booking is associated with multiple rooms (if schema supports it) or the join returns an array, the type definition `{ room_number: string } | null` might not match runtime data (Array of objects vs Object).
*   **Fix**: Verify partial types or use `.single()` if 1:1, or handle array mapping in `getGuestStatus`.

### 4. Missing Pagination
*   **Issue Type**: Performance
*   **Severity**: Low (for now)
*   **Location**: All Lists (`/bookings`, `/guests`, `/billing`)
*   **Description**: Data fetching loads **all** records (`.select('*')` without `limit` or `range`).
*   **Impact**: As data grows, pages will become slow and unresponsive.

## ✅ Passing Checks (Verified Logic)
*   **Authentication**: RBAC logic in `ClientLayout` and `Sidebar` correctly redirects users based on `permissions.ts`.
*   **Real-time Extensions**: Dashboard uses Supabase Subscriptions correctly for `bookings` and `rooms` updates.
*   **Security**: Layout properly hides the Sidebar logic for unauthenticated users.

## 📝 Recommendations
1.  **Run SQL Migration**: Ensure `total_amount` column exists on `invoices` table (Schema check).
2.  **Fix Dashboard Query**: `amount` -> `paid_amount`.
3.  **UI Update**: Show "Grand Total (incl. GST)" in Invoice Modal before saving.
