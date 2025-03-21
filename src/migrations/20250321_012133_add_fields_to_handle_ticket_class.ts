import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "seat_holdings_ticket_classes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"quantity" numeric
  );
  
  ALTER TABLE "seat_holdings" ALTER COLUMN "seat_name" DROP NOT NULL;
  ALTER TABLE "events_ticket_prices" ADD COLUMN "quantity" numeric DEFAULT 0;
  ALTER TABLE "orders" ADD COLUMN "customer_data" jsonb;
  ALTER TABLE "order_items" ADD COLUMN "ticket_price_name" varchar;
  ALTER TABLE "tickets" ADD COLUMN "ticket_price_name" varchar;
  DO $$ BEGIN
   ALTER TABLE "seat_holdings_ticket_classes" ADD CONSTRAINT "seat_holdings_ticket_classes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."seat_holdings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "seat_holdings_ticket_classes_order_idx" ON "seat_holdings_ticket_classes" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "seat_holdings_ticket_classes_parent_id_idx" ON "seat_holdings_ticket_classes" USING btree ("_parent_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "seat_holdings_ticket_classes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "seat_holdings_ticket_classes" CASCADE;
  
  ALTER TABLE "seat_holdings" ALTER COLUMN "seat_name" SET NOT NULL;
  ALTER TABLE "events_ticket_prices" DROP COLUMN IF EXISTS "quantity";
  ALTER TABLE "orders" DROP COLUMN IF EXISTS "customer_data";
  ALTER TABLE "order_items" DROP COLUMN IF EXISTS "ticket_price_name";
  ALTER TABLE "tickets" DROP COLUMN IF EXISTS "ticket_price_name";`)
}
