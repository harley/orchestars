import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "affiliate_user_ranks" ADD COLUMN "total_revenue_after_tax" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE "event_affiliate_user_ranks" ADD COLUMN "total_revenue_after_tax" numeric DEFAULT 0 NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "affiliate_user_ranks" DROP COLUMN IF EXISTS "total_revenue_after_tax";
  ALTER TABLE "event_affiliate_user_ranks" DROP COLUMN IF EXISTS "total_revenue_after_tax";`)
}
