import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" ADD COLUMN "category" varchar DEFAULT 'order_payment';
  CREATE INDEX IF NOT EXISTS "orders_category_idx" ON "orders" USING btree ("category");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "orders_category_idx";
  ALTER TABLE "orders" DROP COLUMN IF EXISTS "category";`)
}
