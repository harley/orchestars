import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published_upcoming', 'published_open_sales', 'completed', 'cancelled');
  ALTER TABLE "events" ADD COLUMN "status" "enum_events_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" DROP COLUMN IF EXISTS "status";
  DROP TYPE "public"."enum_events_status";`)
}
