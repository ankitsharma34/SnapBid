-- Indexes supporting auction list filtering, sorting, and pagination.
CREATE INDEX "Auction_createdAt_idx" ON "Auction"("createdAt");

CREATE INDEX "Auction_currentPrice_idx" ON "Auction"("currentPrice");

CREATE INDEX "Auction_status_currentPrice_idx" ON "Auction"("status", "currentPrice");

CREATE INDEX "Auction_status_startTime_idx" ON "Auction"("status", "startTime");

CREATE INDEX "Auction_categoryId_status_createdAt_idx" ON "Auction"("categoryId", "status", "createdAt");
