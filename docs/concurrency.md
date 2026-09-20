# Concurrency Design

## The Race Condition Problem

In a real-time auction, multiple users will often attempt to bid at the exact same moment.

Consider a naive bidding implementation:

```typescript
// BAD: Naive implementation
const auction = await db.auction.findUnique({ id });
const newAmount = inputAmount;

if (newAmount >= auction.currentPrice + auction.bidIncrement) {
  // If User A and User B reach this line at the exact same millisecond,
  // they both see the same `currentPrice`.
  await db.bid.create({ amount: newAmount });
  await db.auction.update({ currentPrice: newAmount });
}
```

If the price is $100 and the increment is $10:

1. User A reads price $100.
2. User B reads price $100.
3. User A submits bid for $110. It passes validation.
4. User B submits bid for $110. It passes validation.
5. Both bids are saved. The auction ends up with two winning bids of $110, violating the minimum increment rule.

## The SnapBid Solution: Row-Level Locking

SnapBid solves this entirely at the database layer using explicit row-level locking.

In `bid.repository.ts`, the bid placement logic is wrapped in an explicit `prisma.$transaction`.

```typescript
return prisma.$transaction(
  async (tx) => {
    const auctions = await tx.$queryRaw`
      SELECT id, "currentPrice", "bidIncrement", status 
      FROM "Auction" 
      WHERE "id" = ${auctionId} 
      FOR UPDATE
    `;
    // ... validation ...
    // ... insert bid ...
    // ... update auction ...
  },
  {
    isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
  },
);
```

### How `FOR UPDATE` works:

1. When Request A executes `SELECT ... FOR UPDATE`, PostgreSQL locks the specific Auction row.
2. Request A proceeds to read the `currentPrice`, validate the bid, insert the new bid, and update the Auction row.
3. While Request A is doing this, if Request B executes the same `SELECT ... FOR UPDATE`, **PostgreSQL pauses Request B**. Request B hangs and waits at the database level.
4. Once Request A commits its transaction, the row lock is released.
5. Request B is unpaused. It reads the newly updated row containing the _new_ `currentPrice` set by Request A.
6. Request B attempts to validate its bid against the _new_ price. It will fail the minimum increment rule and throw a `400 Bad Request`.

### Isolation Level

The transaction uses `ReadCommitted` isolation. Because the `FOR UPDATE` lock guarantees exclusive write access to the row during the transaction, `Serializable` isolation is not required for this specific operation, allowing higher database throughput while still ensuring strict financial integrity.
