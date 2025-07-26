import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_order_items_status" AS ENUM('processing', 'canceled', 'completed');
  ALTER TABLE "order_items" ADD COLUMN "status" "enum_order_items_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "order_items" DROP COLUMN "status";
  DROP TYPE "public"."enum_order_items_status";`)
}
