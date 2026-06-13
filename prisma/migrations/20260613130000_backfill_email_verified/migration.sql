-- Backfill: mark all existing users as email-verified so they are not locked out
-- after enabling requireEmailVerification in Better Auth.
UPDATE "auth_user" SET "emailVerified" = true WHERE "emailVerified" = false;
