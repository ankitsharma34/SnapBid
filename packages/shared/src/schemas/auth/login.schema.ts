import { z } from "zod";
export const loginSchema = z.object({
  email: z.email({ message: "Invalid email address." }).trim().toLowerCase(),
  password: z
    .string()
    .trim()
    .min(8, { message: "Password must be at least 8 characters long." }),
});

export type loginDto = z.infer<typeof loginSchema>;
