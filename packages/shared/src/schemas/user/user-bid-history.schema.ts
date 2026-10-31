import { z } from "zod";

export const userBidHistoryQuerySchema = z
  .object({
    cursor: z.cuid2().optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict();

export type UserBidHistoryQuery = z.infer<typeof userBidHistoryQuerySchema>;
