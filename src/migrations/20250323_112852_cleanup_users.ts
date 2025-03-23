import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "users_email_idx";
   
   -- Remove auth-related columns from users table
   ALTER TABLE "users" DROP COLUMN IF EXISTS "reset_password_token";
   ALTER TABLE "users" DROP COLUMN IF EXISTS "reset_password_expiration";
   ALTER TABLE "users" DROP COLUMN IF EXISTS "salt";
   ALTER TABLE "users" DROP COLUMN IF EXISTS "hash";
   ALTER TABLE "users" DROP COLUMN IF EXISTS "login_attempts";
   ALTER TABLE "users" DROP COLUMN IF EXISTS "lock_until";
   ALTER TABLE "users" DROP COLUMN IF EXISTS "role";
   
   -- Drop the enum type since it's no longer needed
   DROP TYPE IF EXISTS "public"."enum_users_role";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   -- Recreate the enum type
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'super-admin', 'customer');
   
   -- Restore auth-related columns
   ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'customer';
   ALTER TABLE "users" ADD COLUMN "reset_password_token" varchar;
   ALTER TABLE "users" ADD COLUMN "reset_password_expiration" timestamp(3) with time zone;
   ALTER TABLE "users" ADD COLUMN "salt" varchar;
   ALTER TABLE "users" ADD COLUMN "hash" varchar;
   ALTER TABLE "users" ADD COLUMN "login_attempts" numeric DEFAULT 0;
   ALTER TABLE "users" ADD COLUMN "lock_until" timestamp(3) with time zone;
   
   CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");`)
}
