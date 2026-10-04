import type { AppEnv } from "@/shared/env/app-env.types";

/** A complete, fake `AppEnv` for unit tests. Non-production values only. */
export const TEST_APP_ENV: AppEnv = {
  DATABASE_URL: "postgresql://user:pw@db.example/app",
  APP_STAGE: "test",
  BETTER_AUTH_SECRET: "test-secret-at-least-32-characters-long",
  BETTER_AUTH_URL: "http://localhost:3000",
  GOOGLE_CLIENT_ID: "test-google-client-id",
  GOOGLE_CLIENT_SECRET: "test-google-client-secret",
  RESEND_API_KEY: "re_test",
  AUTH_EMAIL_FROM: "Shutrly <auth@test.shutrly.dev>",
  GOOGLE_DRIVE_API_KEY: "test-drive-api-key",
  // 32 zero bytes, base64url: a fixed non-production cipher key.
  GALLERY_PASSWORD_KEY: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
};
