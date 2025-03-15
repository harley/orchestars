import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "tickets" ADD COLUMN "event_schedule_id" varchar;
  ALTER TABLE "seat_holdings" ADD COLUMN "event_schedule_id" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "tickets" DROP COLUMN IF EXISTS "event_schedule_id";
  ALTER TABLE "seat_holdings" DROP COLUMN IF EXISTS "event_schedule_id";`)
}
