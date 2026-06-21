import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().min(1),
        APP_URL: z.string().min(1),
        R2_ACCOUNT_ID: z.string().min(1),
        R2_ACCESS_KEY_ID: z.string().min(1),
        R2_SECRET_ACCESS_KEY: z.string().min(1),
        R2_BUCKET_NAME: z.string().min(1),
        CHATTERBOX_API_URL: z.url(),
        CHATTERBOX_API_KEY: z.string().min(1),
        SENTRY_DSN: z.string().optional(),
        SENTRY_ORG: z.string().optional(),
        SENTRY_PROJECT: z.string().optional(),
        SENTRY_AUTH_TOKEN: z.string().optional(),
    },
    client: {
        NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
    },
    experimental__runtimeEnv: {
        NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    },
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});