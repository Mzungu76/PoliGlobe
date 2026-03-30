import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-5.4-thinking"),
  ACLED_API_KEY: z.string().optional(),
  ACLED_EMAIL: z.string().optional(),
  UNCOMTRADE_API_KEY: z.string().optional(),
  WORLD_BANK_SOURCE_ID: z.string().default("2")
});

export const env = envSchema.parse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  ACLED_API_KEY: process.env.ACLED_API_KEY,
  ACLED_EMAIL: process.env.ACLED_EMAIL,
  UNCOMTRADE_API_KEY: process.env.UNCOMTRADE_API_KEY,
  WORLD_BANK_SOURCE_ID: process.env.WORLD_BANK_SOURCE_ID
});
