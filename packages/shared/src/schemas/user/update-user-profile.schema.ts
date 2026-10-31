import { z } from "zod";

export const updateUserProfileSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must not exceed 20 characters")
      .optional(),
    displayName: z
      .string()
      .trim()
      .min(2, "Display name must be at least 2 characters")
      .max(30, "Display name must not exceed 30 characters")
      .optional(),
    avatarUrl: z.url("Avatar URL must be valid").nullable().optional(),
  })
  .strict()
  .refine(
    (input) => Object.values(input).some((value) => value !== undefined),
    "At least one profile field must be provided",
  );

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
