-- A user may win more than one auction. Keep winner lookups indexed without
-- enforcing one-to-one cardinality between User and Auction.
DROP INDEX "Auction_winnerId_key";

CREATE INDEX "Auction_winnerId_idx" ON "Auction"("winnerId");
