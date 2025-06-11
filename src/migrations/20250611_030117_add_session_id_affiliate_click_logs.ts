import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "affiliate_click_logs" ADD COLUMN "session_id" varchar;
  CREATE INDEX IF NOT EXISTS "affiliate_click_logs_session_id_idx" ON "affiliate_click_logs" USING btree ("session_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "affiliate_click_logs_session_id_idx";
  ALTER TABLE "affiliate_click_logs" DROP COLUMN IF EXISTS "session_id";`)
}
