import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:\n", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
