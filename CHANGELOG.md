# Changelog

All notable changes to Bhagini Graphics (PrintX) are recorded here.
Versions use `MAJOR.MINOR.PATCH.MICRO`.

## [Unreleased]

### Added
- Admin approval for new customers. A new signup can no longer sign in until an admin approves it: they see an "Application received" notice, and trying to sign in shows that the account is awaiting approval. Admins get a "Pending" tab (with a count) on Customers, a "Signups to Approve" tile on the dashboard, and Approve / Reject (with a reason the applicant sees) in the customer profile. Every account that existed before, and every staff account, is unaffected.
- Product catalogue category filters and the order/refund status tabs now show edge fades and scroll arrows when there are more options than fit, instead of silently running off-screen.

### Changed
- Payment is by direct bank transfer only. UPI is gone from the bank details, the customer payment screen and all marketing copy.
- Signing in from the normal login page now takes admins to the admin console and customers to their dashboard. A signed-in visitor who opens the login page is sent straight to their own dashboard, and the Bhagini Graphics logo in the app goes to it too.
- A deactivated, demoted or un-approved account is signed out on its next action instead of carrying on with stale menus until a reload.
- The admin customer profile shows the real lifetime order count (it stopped at 20).
- The catalogue page heading is now "Our Print Catalog".

### Removed
- The old "Wallet & Transactions" admin page and the unused wallet top-up limits in Settings.

## [0.2.0.0] - 2026-09-22

### Added
- Pay by bank transfer. After placing an order, customers see the account details (with copy buttons), transfer the amount, and upload a screenshot or PDF of the payment with an optional UTR. The order shows "Payment pending" until the team approves it.
- Payment review for admins. Each order shows the customer's screenshot, the UTR and the amount due. Approving moves the order to Placed and issues the invoice. Rejecting asks the customer for a new screenshot and tells them why.
- A warning on the admin order page when the same UTR has been quoted on another order, so one transfer can't pay for two orders.
- Bank details in admin Settings. Checkout stays closed until the account holder, account number and IFSC are filled in, so no customer is ever shown an incomplete account.
- "Payments to Verify", "Awaiting Payment" and "Refunds to Send" counts on the dashboards.
- Invoices now have their own consecutive series for each Indian financial year (for example `INV/26-27/00001`), issued only when payment is verified.
- Every list (orders, customers, products, refunds, transactions) is paginated.

### Changed
- Order flow: Payment Pending → Placed → Design Review → Printing → Quality Check → Out for Delivery → Delivered. An order only reaches Placed through payment approval.
- Cancelling a paid order raises a refund for the team to send by bank transfer. Refunds show as "Refunded" once sent.
- An order can't be cancelled while its payment screenshot is being checked. The team approves or rejects it first, so money that has been sent is never lost track of.
- Only a super admin can change the bank account customers pay into, and every change notifies all super admins.
- Revenue, lifetime spend and "total spent" count only paid orders.
- Consistent buttons, loading, empty and error states across the customer and admin screens. Headings and contrast now meet WCAG AA on all 17 screens.

### Fixed
- Checkout failing permanently once any order had been deleted (order numbers were reused).
- An admin cancel racing a payment approval could cancel a paid order with no refund.
- A proof upload racing a cancel could leave a cancelled order holding a payment.
- Orders saved with an old "Payment confirmed" status no longer drop out of the Active tab and the in-production counts.
- Broken order specs, draft products leaking into the catalogue, and a stale status value.
- Keyboard focus on the payment upload, touch targets on copy buttons, and several screen-reader labels.

### Removed
- The customer wallet, wallet top-ups and the admin wallet adjustment. Customers pay each order by bank transfer. Past wallet history remains in the admin transactions ledger.
