import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    POSTGRES_URL: z.string(),
    VERCEL_ENV: z.string().optional(),
  },
  experimental__runtimeEnv: {
    POSTGRES_URL: process.env.POSTGRES_URL,
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    VERCEL_ENV: process.env.VERCEL_ENV,
  },
});
