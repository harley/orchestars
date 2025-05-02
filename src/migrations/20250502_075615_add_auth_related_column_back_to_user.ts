import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Step 1: Create user role enum if not exists
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'super-admin', 'customer');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `);

  // Step 2: Drop FK to admins and its index
  await db.execute(sql`
    ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT IF EXISTS "payload_preferences_rels_admins_fk";
    DROP INDEX IF EXISTS "payload_preferences_rels_admins_id_idx";
  `);

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

  // Step 4: Add column for FK from preferences to users
  await db.execute(sql`
    ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "users_id" integer;
  `);

  // Step 5: Copy auth data from admins → users
  await db.execute(sql`
    UPDATE "users" u
    SET
      "role" = CASE 
        WHEN a."role" = 'super-admin' THEN 'super-admin'::enum_users_role
        WHEN a."role" = 'event-admin' THEN 'event-admin'::enum_users_role
        ELSE 'admin'::enum_users_role
      END,
      "reset_password_token" = a.reset_password_token,
      "reset_password_expiration" = a.reset_password_expiration,
      "salt" = a.salt,
      "hash" = a.hash,
      "login_attempts" = a.login_attempts,
      "lock_until" = a.lock_until
    FROM "admins" a
    WHERE u.email = a.email;
  `);

  // Step 6: Drop auth fields from admins (do not drop table)
  await db.execute(sql`
    ALTER TABLE "admins" DROP COLUMN IF EXISTS "reset_password_token";
    ALTER TABLE "admins" DROP COLUMN IF EXISTS "reset_password_expiration";
    ALTER TABLE "admins" DROP COLUMN IF EXISTS "salt";
    ALTER TABLE "admins" DROP COLUMN IF EXISTS "hash";
    ALTER TABLE "admins" DROP COLUMN IF EXISTS "login_attempts";
    ALTER TABLE "admins" DROP COLUMN IF EXISTS "lock_until";
  `);

  // Step 7: Drop old admins_id column from preferences
  await db.execute(sql`
    ALTER TABLE "payload_preferences_rels" DROP COLUMN IF EXISTS "admins_id";
  `);

  // Step 8: Reconnect preferences to users
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk"
      FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_users_id_idx"
    ON "payload_preferences_rels" USING btree ("users_id");
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

  // Step 4: Remove user-based preferences FK/index
  await db.execute(sql`
    ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT IF EXISTS "payload_preferences_rels_users_fk";
    DROP INDEX IF EXISTS "payload_preferences_rels_users_id_idx";
    ALTER TABLE "payload_preferences_rels" DROP COLUMN IF EXISTS "users_id";
  `);

  // Step 5: Restore preferences.admins_id
  await db.execute(sql`
    ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "admins_id" integer;

    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_admins_fk"
      FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_admins_id_idx"
    ON "payload_preferences_rels" USING btree ("admins_id");
  `);

  // Step 6: Drop the enum_users_role type if unused
  await db.execute(sql`
    DO $$ BEGIN
      DROP TYPE IF EXISTS "public"."enum_users_role";
    EXCEPTION WHEN undefined_object THEN null; END $$;
  `);

  // Step 7: Drop users_email_idx safely if needed
  await db.execute(sql`
    DROP INDEX IF EXISTS "users_email_idx";
  `);
}
