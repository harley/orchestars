import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_admins_role" ADD VALUE 'event-admin' BEFORE 'admin';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "public"."admins" ALTER COLUMN "role" SET DATA TYPE text;
  DROP TYPE "public"."enum_admins_role";
  CREATE TYPE "public"."enum_admins_role" AS ENUM('admin', 'super-admin');
  ALTER TABLE "public"."admins" ALTER COLUMN "role" SET DATA TYPE "public"."enum_admins_role" USING "role"::"public"."enum_admins_role";`)
}
