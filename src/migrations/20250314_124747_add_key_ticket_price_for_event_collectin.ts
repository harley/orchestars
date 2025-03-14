import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_events_ticket_prices_key" AS ENUM('zone1', 'zone2', 'zone3', 'zone4', 'zone5');
  ALTER TABLE "events_ticket_prices" ADD COLUMN "key" "enum_events_ticket_prices_key";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events_ticket_prices" DROP COLUMN IF EXISTS "key";
  DROP TYPE "public"."enum_events_ticket_prices_key";`)
}
