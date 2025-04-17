import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE INDEX IF NOT EXISTS "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "events_status_idx" ON "events" USING btree ("status");
  CREATE INDEX IF NOT EXISTS "orders_order_code_idx" ON "orders" USING btree ("order_code");
  CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" USING btree ("status");
  CREATE INDEX IF NOT EXISTS "orders_promotion_code_idx" ON "orders" USING btree ("promotion_code");
  CREATE INDEX IF NOT EXISTS "order_items_ticket_price_id_idx" ON "order_items" USING btree ("ticket_price_id");
  CREATE INDEX IF NOT EXISTS "order_items_ticket_price_name_idx" ON "order_items" USING btree ("ticket_price_name");
  CREATE INDEX IF NOT EXISTS "payments_payment_method_idx" ON "payments" USING btree ("payment_method");
  CREATE INDEX IF NOT EXISTS "payments_promotion_code_idx" ON "payments" USING btree ("promotion_code");
  CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments" USING btree ("status");
  CREATE INDEX IF NOT EXISTS "tickets_ticket_code_idx" ON "tickets" USING btree ("ticket_code");
  CREATE INDEX IF NOT EXISTS "tickets_seat_idx" ON "tickets" USING btree ("seat");
  CREATE INDEX IF NOT EXISTS "tickets_ticket_price_name_idx" ON "tickets" USING btree ("ticket_price_name");
  CREATE INDEX IF NOT EXISTS "tickets_event_schedule_id_idx" ON "tickets" USING btree ("event_schedule_id");
  CREATE INDEX IF NOT EXISTS "tickets_seat_event_idx" ON "tickets" USING btree ("seat", "event_id");
  CREATE INDEX IF NOT EXISTS "tickets_ticket_price_name_event_idx" ON "tickets" USING btree ("ticket_price_name", "event_id");
  CREATE INDEX IF NOT EXISTS "seat_holdings_event_schedule_id_idx" ON "seat_holdings" USING btree ("event_schedule_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "events_slug_idx";
  DROP INDEX IF EXISTS "events_status_idx";
  DROP INDEX IF EXISTS "orders_order_code_idx";
  DROP INDEX IF EXISTS "orders_status_idx";
  DROP INDEX IF EXISTS "orders_promotion_code_idx";
  DROP INDEX IF EXISTS "order_items_ticket_price_id_idx";
  DROP INDEX IF EXISTS "order_items_ticket_price_name_idx";
  DROP INDEX IF EXISTS "payments_payment_method_idx";
  DROP INDEX IF EXISTS "payments_promotion_code_idx";
  DROP INDEX IF EXISTS "payments_status_idx";
  DROP INDEX IF EXISTS "tickets_ticket_code_idx";
  DROP INDEX IF EXISTS "tickets_seat_idx";
  DROP INDEX IF EXISTS "tickets_ticket_price_name_idx";
  DROP INDEX IF EXISTS "tickets_event_schedule_id_idx";
  DROP INDEX IF EXISTS "tickets_seat_event_idx";
  DROP INDEX IF EXISTS "tickets_ticket_price_name_event_idx";
  DROP INDEX IF EXISTS "seat_holdings_event_schedule_id_idx";`)
}
