import { afterAll, describe, expect, it } from "vitest";

import { prisma } from "@snapbid/database";

describe("integration test database", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("connects to the isolated migrated PostgreSQL database", async () => {
    const result = await prisma.$queryRaw<Array<{ value: number }>>`
      SELECT 1 AS value
    `;

    expect(result).toEqual([{ value: 1 }]);
  });
});
