import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "checkin_records_ticket_idx";
  CREATE INDEX IF NOT EXISTS "checkin_records_ticket_idx" ON "checkin_records" USING btree ("ticket_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "checkin_records_ticket_idx";
  CREATE UNIQUE INDEX IF NOT EXISTS "checkin_records_ticket_idx" ON "checkin_records" USING btree ("ticket_id");`)
}
