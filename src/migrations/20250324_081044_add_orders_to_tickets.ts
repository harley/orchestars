import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tickets" ADD COLUMN "order_id" integer;
  DO $$ BEGIN
   ALTER TABLE "tickets" ADD CONSTRAINT "tickets_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "tickets_order_idx" ON "tickets" USING btree ("order_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "tickets" DROP CONSTRAINT "tickets_order_id_orders_id_fk";
  
  DROP INDEX IF EXISTS "tickets_order_idx";
  ALTER TABLE "tickets" DROP COLUMN IF EXISTS "order_id";`)
}
