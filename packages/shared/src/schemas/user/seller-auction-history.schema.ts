import { z } from "zod";

export const sellerAuctionHistoryQuerySchema = z
  .object({
    cursor: z.cuid2().optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    status: z
      .enum(["DRAFT", "SCHEDULED", "LIVE", "ENDED", "CANCELLED"])
      .optional(),
  })
  .strict();

export type SellerAuctionHistoryQuery = z.infer<
  typeof sellerAuctionHistoryQuerySchema
>;
