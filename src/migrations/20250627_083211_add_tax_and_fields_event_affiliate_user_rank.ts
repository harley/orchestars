import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ADD COLUMN "vat_enabled" boolean DEFAULT true;
  ALTER TABLE "events" ADD COLUMN "vat_percentage" numeric DEFAULT 8;
  ALTER TABLE "events" ADD COLUMN "vat_note" varchar;
  ALTER TABLE "event_affiliate_user_ranks" ADD COLUMN "total_revenue_before_tax" numeric DEFAULT 0 NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" DROP COLUMN IF EXISTS "vat_enabled";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "vat_percentage";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "vat_note";
  ALTER TABLE "event_affiliate_user_ranks" DROP COLUMN IF EXISTS "total_revenue_before_tax";`)
}
