import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("5000"),
});

export const env = envSchema.parse(process.env);
