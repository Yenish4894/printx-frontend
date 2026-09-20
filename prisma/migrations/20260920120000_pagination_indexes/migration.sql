-- Indexes for the list queries that gained pagination in this change. All are
-- additive; none change behaviour or data.
--
-- User.role                    : listCustomers, listStaff, getStats and the
--                                finance aggregate all filter on role, with no
--                                index at all until now — four sequential scans
-- User(role, createdAt)        : those lists also sort by createdAt, so the
--                                composite serves filter + sort in one pass
-- Order(status, placedAt)      : the admin list filters by status AND sorts by
--                                placedAt; Postgres could only use one of the
--                                two single-column indexes
-- Order(userId, placedAt)      : "my orders, newest first"
-- WalletTransaction.createdAt  : admin finance sorts the WHOLE table
--                                newest-first, with no userId predicate, so the
--                                (userId, createdAt) index did not apply
-- WalletTransaction.type       : the CREDIT / DEBIT / REFUND aggregates

CREATE INDEX "User_role_idx"                     ON "User"("role");
CREATE INDEX "User_role_createdAt_idx"           ON "User"("role", "createdAt");
CREATE INDEX "Order_status_placedAt_idx"         ON "Order"("status", "placedAt");
CREATE INDEX "Order_userId_placedAt_idx"         ON "Order"("userId", "placedAt");
CREATE INDEX "WalletTransaction_createdAt_idx"   ON "WalletTransaction"("createdAt");
CREATE INDEX "WalletTransaction_type_idx"        ON "WalletTransaction"("type");
