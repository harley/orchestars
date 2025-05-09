import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {

  // Step 3: Add auth-related fields to users
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "enum_users_role";
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_token" varchar;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_expiration" timestamp(3) with time zone;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "salt" varchar;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "hash" varchar;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "login_attempts" numeric DEFAULT 0;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lock_until" timestamp(3) with time zone;
    ALTER TYPE "public"."enum_users_role" ADD VALUE IF NOT EXISTS 'event-admin';
  `);


  // Step 9: Handle duplicated users, keeping the one with a booked ticket
 // Step 9: Handle duplicated users, keeping the one with a booked ticket
await db.execute(sql`
  WITH duplicate_users AS (
    SELECT email, MIN(id) AS keeper_user_id
    FROM users
    GROUP BY email
    HAVING COUNT(*) > 1
  ),
  -- Update payments to point to keeper_user_id
  update_payments AS (
    UPDATE payments p
    SET user_id = du.keeper_user_id
    FROM duplicate_users du
    WHERE p.user_id IN (
      SELECT id FROM users WHERE email = du.email
    )
    RETURNING p.id
  ),
    update_checkin_records AS (
    UPDATE checkin_records cr
    SET user_id = du.keeper_user_id
    FROM duplicate_users du
    WHERE cr.user_id IN (
      SELECT id FROM users WHERE email = du.email
    )
    RETURNING cr.id
  ),
    update_user_promotion_redemptions AS (
    UPDATE user_promotion_redemptions upr
    SET user_id = du.keeper_user_id
    FROM duplicate_users du
    WHERE upr.user_id IN (
      SELECT id FROM users WHERE email = du.email
    )
    RETURNING upr.id
  ),
  
  -- Update tickets to point to keeper_user_id
  update_tickets AS (
    UPDATE tickets t
    SET user_id = du.keeper_user_id
    FROM duplicate_users du
    WHERE t.user_id IN (
      SELECT id FROM users WHERE email = du.email
    )
    RETURNING t.id
  ),
  -- Update preferences to point to keeper_user_id
  update_preferences AS (
    UPDATE payload_preferences_rels ppr
    SET users_id = du.keeper_user_id
    FROM duplicate_users du
    WHERE ppr.users_id IN (
      SELECT id FROM users WHERE email = du.email
    )
    RETURNING ppr.id
  )
  -- Delete duplicate users, keeping the keeper_user_id
  DELETE FROM users u
  USING duplicate_users du
  WHERE u.id != du.keeper_user_id
    AND u.email = du.email;
`);

  // Step 10: Enforce uniqueness on the email column
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Step 1: Re-add auth fields to admins
  await db.execute(sql`
    ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "reset_password_token" varchar;
    ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "reset_password_expiration" timestamp(3) with time zone;
    ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "salt" varchar;
    ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "hash" varchar;
    ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "login_attempts" numeric DEFAULT 0;
    ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "lock_until" timestamp(3) with time zone;
  `);

  // Step 2: Copy values from users back to admins
  await db.execute(sql`
    UPDATE "admins" a
    SET
      "salt" = u."salt",
      "hash" = u."hash",
      "reset_password_token" = u."reset_password_token",
      "reset_password_expiration" = u."reset_password_expiration",
      "login_attempts" = u."login_attempts",
      "lock_until" = u."lock_until"
    FROM "users" u
    WHERE a."email" = u."email";
  `);

  // Step 3: Drop users' auth-related fields
  await db.execute(sql`
    ALTER TABLE "users" DROP COLUMN IF EXISTS "role";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "reset_password_token";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "reset_password_expiration";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "salt";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "hash";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "login_attempts";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "lock_until";
  `);

  // Step 7: Drop users_email_idx safely if needed
  await db.execute(sql`
    DROP INDEX IF EXISTS "users_email_idx";
  `);
}
