# Auction integration tests

Integration tests use the dedicated PostgreSQL service in
`docker-compose.test.yml`. They never use a duplicate Prisma schema.

From the repository root:

```sh
pnpm test:db:up
pnpm test:integration
pnpm test:db:down
```

The integration runner loads `packages/auction/.env.test` when present and
otherwise uses the disposable values in `.env.test.example`. Before applying
migrations, it rejects production mode, non-local hosts, ports other than
`55432`, and database names that do not end in `_test`.

`pnpm test:integration` runs `prisma migrate deploy` from `@snapbid/database`,
so the tests always use the package's existing schema and migration history.

## Overall Integration Test Flow

```mermaid

flowchart TD
    A["Start Vitest"] --> B["setup.ts: Validate DATABASE_URL"]
    B --> C["Connect Prisma"]
    C --> D["Run integration test"]
    D --> E["Create seller and bidder"]
    E --> F["Create auction"]
    F --> G["Create bid"]
    G --> H["Verify data and relationships"]
    H --> I["afterEach: Cleanup test data"]
    I --> J{"More tests?"}
    J -->|Yes| D
    J -->|No| K["afterAll: Disconnect Prisma"]

```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Vitest
    participant Setup
    participant Fixtures
    participant Prisma
    participant PostgreSQL

    Vitest->>Setup: beforeAll()
    Setup->>Setup: Validate DATABASE_URL
    Setup->>Prisma: $connect()
    Prisma->>PostgreSQL: Connect

    Vitest->>Fixtures: createUserFixture()
    Fixtures->>Prisma: user.create()
    Prisma->>PostgreSQL: INSERT User
    PostgreSQL-->>Fixtures: Return user

    Vitest->>Fixtures: createAuctionFixture()
    Fixtures->>Prisma: auction.create()
    Prisma->>PostgreSQL: INSERT Auction
    PostgreSQL-->>Fixtures: Return auction

    Vitest->>Fixtures: createBidFixture()
    Fixtures->>Prisma: bid.create()
    Prisma->>PostgreSQL: INSERT Bid
    PostgreSQL-->>Fixtures: Return bid

    Vitest->>Vitest: Assertions
    Vitest->>Setup: afterEach()
    Setup->>Fixtures: cleanupTestData()
    Fixtures->>PostgreSQL: DELETE test records

    Vitest->>Setup: afterAll()
    Setup->>Prisma: $disconnect()
```
