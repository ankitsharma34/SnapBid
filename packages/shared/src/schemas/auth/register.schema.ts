import { z } from "zod";

// Requires at least 1 uppercase, 1 lowercase, 1 number, and 1 special character
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, { message: "Username should be atleast 3 character long." })
      .max(20, { message: "Username should not exceed 20 characters." }),
    email: z.email({ message: "Invalid email address." }).trim().toLowerCase(),
    displayName: z
      .string()
      .trim()
      .min(2, { message: "Display name should be atleast 2 character long." })
      .max(30, { message: "Display name should not exceed 30 characters." }),
    password: z
      .string()
      .trim()
      .min(8, { message: "Password must be at least 8 characters long." })
      .regex(passwordRegex, {
        message:
          "Password must contain uppercase, lowercase, number, and special character",
      }),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .transform(({ confirmPassword, ...data }) => data);

export type registerDto = z.infer<typeof registerSchema>;
