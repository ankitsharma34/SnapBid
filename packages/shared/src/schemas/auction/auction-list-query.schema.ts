import { z } from "zod";

const moneySchema = z
  .string()
  .trim()
  .regex(
    /^\d{1,35}(\.\d{1,2})?$/,
    "Price must be non-negative and have at most 2 decimal places",
  );

const toMinorUnits = (value: string) => {
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole!) * 100n + BigInt(fraction.padEnd(2, "0"));
};

export const auctionListQuerySchema = z
  .object({
    category: z.string().trim().min(1).max(100).optional(),
    status: z
      .enum(["DRAFT", "SCHEDULED", "LIVE", "ENDED", "CANCELLED"])
      .optional(),
    minPrice: moneySchema.optional(),
    maxPrice: moneySchema.optional(),
    sort: z
      .enum(["newest", "endingSoon", "startingSoon", "priceAsc", "priceDesc"])
      .default("newest"),
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict()
  .refine(
    (query) =>
      query.minPrice === undefined ||
      query.maxPrice === undefined ||
      toMinorUnits(query.minPrice) <= toMinorUnits(query.maxPrice),
    {
      message: "Minimum price cannot exceed maximum price",
      path: ["minPrice"],
    },
  );

export type AuctionListQuery = z.infer<typeof auctionListQuerySchema>;
