import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_tickets_status" AS ENUM('booked', 'pending_payment', 'hold', 'cancelled');
  ALTER TABLE "order_items" ADD COLUMN "seat" varchar;
  ALTER TABLE "tickets" ADD COLUMN "seat" varchar;
  ALTER TABLE "tickets" ADD COLUMN "status" "enum_tickets_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "order_items" DROP COLUMN IF EXISTS "seat";
  ALTER TABLE "tickets" DROP COLUMN IF EXISTS "seat";
  ALTER TABLE "tickets" DROP COLUMN IF EXISTS "status";
  DROP TYPE "public"."enum_tickets_status";`)
}
