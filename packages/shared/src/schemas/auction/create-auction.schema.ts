import { z } from "zod";

export const createAuctionSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title must not exceed 200 characters"),

    description: z
      .string()
      .trim()
      .max(1000, "Description must not exceed 1000 characters")
      .optional(),

    startingPrice: z.coerce.number().positive(),
    bidIncrement: z.coerce.number().positive(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    auctionImages: z.array(z.url()).max(10).optional().default([]),
    categorySlug: z.string().trim().max(100).optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export type CreateAuctionInput = z.infer<typeof createAuctionSchema>;
