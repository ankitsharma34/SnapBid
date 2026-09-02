import z from "zod";

export const bidSchema = z.object({
  amount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid bid amount")
    .refine((value) => Number(value) > 0, {
      message: "Bid amount must be positive",
    }),
});
