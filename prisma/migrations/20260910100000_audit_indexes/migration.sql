-- Indexes for the access patterns the app actually has. All are additive and
-- concurrent-safe to add on a small table; none change behaviour.
--
-- Order.status   : the admin order list filters by it
-- Order.placedAt : every order list sorts newest-first
-- Refund.status  : the admin refund list filters by it
-- WalletTransaction(userId, createdAt) : "my ledger, newest first" is always
--                  filtered by user AND sorted by time; the userId-only index
--                  left the sort to a filesort
-- CartItem.fileUrl / OrderItem.fileUrl : GET /api/files/[key] now resolves the
--                  owning line by fileUrl to enforce access control, which
--                  would otherwise be a sequential scan on every file request

CREATE INDEX "Order_status_idx"    ON "Order"("status");
CREATE INDEX "Order_placedAt_idx"  ON "Order"("placedAt");
CREATE INDEX "Refund_status_idx"   ON "Refund"("status");
CREATE INDEX "WalletTransaction_userId_createdAt_idx" ON "WalletTransaction"("userId", "createdAt");
CREATE INDEX "CartItem_fileUrl_idx"  ON "CartItem"("fileUrl");
CREATE INDEX "OrderItem_fileUrl_idx" ON "OrderItem"("fileUrl");
