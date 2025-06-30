import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "affiliate_ranks" ADD COLUMN "rank_name_label" varchar;
  ALTER TABLE "event_affiliate_ranks" ADD COLUMN "rank_name_label" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "affiliate_ranks" DROP COLUMN IF EXISTS "rank_name_label";
  ALTER TABLE "event_affiliate_ranks" DROP COLUMN IF EXISTS "rank_name_label";`)
}
