import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_forms_status" AS ENUM('active', 'inactive');
  ALTER TABLE "forms" ADD COLUMN "type" varchar DEFAULT 'contact' NOT NULL;
  ALTER TABLE "forms" ADD COLUMN "status" "enum_forms_status" DEFAULT 'active' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "forms" DROP COLUMN IF EXISTS "type";
  ALTER TABLE "forms" DROP COLUMN IF EXISTS "status";
  DROP TYPE "public"."enum_forms_status";`)
}
