import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ADD COLUMN "detail_description" jsonb;
  ALTER TABLE "events" ADD COLUMN "configuration_show_banner_title" boolean DEFAULT true;
  ALTER TABLE "events" ADD COLUMN "configuration_show_banner_time" boolean DEFAULT true;
  ALTER TABLE "events" ADD COLUMN "configuration_show_banner_location" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" DROP COLUMN IF EXISTS "detail_description";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "configuration_show_banner_title";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "configuration_show_banner_time";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "configuration_show_banner_location";`)
}
