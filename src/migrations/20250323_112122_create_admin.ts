import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   -- 1. Create admin role enum and table
   CREATE TYPE "public"."enum_admins_role" AS ENUM('admin', 'super-admin');
   CREATE TABLE IF NOT EXISTS "admins" (
    "id" serial PRIMARY KEY NOT NULL,
    "first_name" varchar NOT NULL,
    "last_name" varchar NOT NULL,
    "role" "enum_admins_role" DEFAULT 'admin' NOT NULL,
    "last_active" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "email" varchar NOT NULL,
    "reset_password_token" varchar,
    "reset_password_expiration" timestamp(3) with time zone,
    "salt" varchar,
    "hash" varchar,
    "login_attempts" numeric DEFAULT 0,
    "lock_until" timestamp(3) with time zone
   );

   -- 2. Create admin indexes
   CREATE INDEX IF NOT EXISTS "admins_updated_at_idx" ON "admins" USING btree ("updated_at");
   CREATE INDEX IF NOT EXISTS "admins_created_at_idx" ON "admins" USING btree ("created_at");
   CREATE UNIQUE INDEX IF NOT EXISTS "admins_email_idx" ON "admins" USING btree ("email");

   -- 3. Copy admin users from users table to admins table
   INSERT INTO "admins" (
     "email",
     "first_name",
     "last_name",
     "role",
     "last_active",
     "salt",
     "hash",
     "created_at",
     "updated_at"
   )
   SELECT
     "email",
     COALESCE("first_name", '') as "first_name",
     COALESCE("last_name", '') as "last_name",
     CASE
       WHEN "role" = 'super-admin' THEN 'super-admin'::"enum_admins_role"
       ELSE 'admin'::"enum_admins_role"
     END as "role",
     "last_active",
     "salt",
     "hash",
     "created_at",
     "updated_at"
   FROM "users"
   WHERE "salt" IS NOT NULL;

   -- 4. Prepare for preference migration
   ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT IF EXISTS "payload_preferences_rels_users_fk";
   DROP INDEX IF EXISTS "payload_preferences_rels_users_id_idx";

   -- 5. Add new columns for admin relationships
   ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "admins_id" integer;
   ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "admins_id" integer;

   -- 6. Now we can safely copy preferences
   INSERT INTO "payload_preferences_rels" ("parent_id", "path", "admins_id", "order")
   SELECT "parent_id", "path", (
     SELECT "admins"."id"
     FROM "admins"
     JOIN "users" ON "users"."email" = "admins"."email"
     WHERE "users"."id" = "payload_preferences_rels"."users_id"
   ), "order"
   FROM "payload_preferences_rels"
   WHERE "users_id" IN (
     SELECT "id" FROM "users" WHERE "salt" IS NOT NULL
   );

   -- 7. Add foreign key constraints
   DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_admins_fk"
    FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_admins_fk"
    FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;

   -- 8. Create indexes for the new columns
   CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_admins_id_idx"
   ON "payload_locked_documents_rels" USING btree ("admins_id");
   CREATE INDEX IF NOT EXISTS "payload_preferences_rels_admins_id_idx"
   ON "payload_preferences_rels" USING btree ("admins_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   -- 1. Copy admin data back to users table before dropping admins table
   UPDATE "users" u
   SET
     "role" = CASE
       WHEN a."role" = 'super-admin' THEN 'super-admin'
       ELSE 'admin'
     END,
     "salt" = a."salt",
     "hash" = a."hash",
     "last_active" = a."last_active"
   FROM "admins" a
   WHERE u."email" = a."email";

   -- 2. Drop admin table and clean up
   ALTER TABLE "admins" DISABLE ROW LEVEL SECURITY;
   DROP TABLE "admins" CASCADE;

   -- 3. Clean up admin relationships
   ALTER TABLE "payload_preferences_rels" RENAME COLUMN "admins_id" TO "users_id";
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_admins_fk";
   ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT IF EXISTS "payload_preferences_rels_admins_fk";
   DROP INDEX IF EXISTS "payload_locked_documents_rels_admins_id_idx";
   DROP INDEX IF EXISTS "payload_preferences_rels_admins_id_idx";

   -- 4. Restore user relationships
   DO $$ BEGIN
    ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk"
    FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;

   CREATE INDEX IF NOT EXISTS "payload_preferences_rels_users_id_idx"
   ON "payload_preferences_rels" USING btree ("users_id");

   -- 5. Clean up remaining columns and types
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "admins_id";
   DROP TYPE IF EXISTS "public"."enum_admins_role";`)
}
