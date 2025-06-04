import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_emails_status" AS ENUM('pending', 'sent', 'failed');
  ALTER TABLE "emails" ADD COLUMN "from" varchar;
  ALTER TABLE "emails" ADD COLUMN "status" "enum_emails_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "emails" DROP COLUMN IF EXISTS "from";
  ALTER TABLE "emails" DROP COLUMN IF EXISTS "status";
  DROP TYPE "public"."enum_emails_status";`)
}
