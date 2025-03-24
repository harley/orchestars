import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function fillTicketOrderIds({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  UPDATE "tickets" AS t
  SET "order_id" = subquery."order_id"
  FROM (
    SELECT t2.id AS ticket_id, oi.order_id
    FROM "tickets" t2
    JOIN "order_items" oi ON oi.id = t2.order_item_id
    WHERE t2.order_id IS NULL
  ) AS subquery
  WHERE t.id = subquery.ticket_id;
  
  `);
}


export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tickets" ADD COLUMN "order_id" integer;
  DO $$ BEGIN
   ALTER TABLE "tickets" ADD CONSTRAINT "tickets_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "tickets_order_idx" ON "tickets" USING btree ("order_id");
  ALTER TABLE "users" DROP COLUMN IF EXISTS "role";
  DROP TYPE "public"."enum_users_role";`)
  await fillTicketOrderIds({ db, payload, req });
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('customer');
  ALTER TABLE "tickets" DROP CONSTRAINT "tickets_order_id_orders_id_fk";
  
  DROP INDEX IF EXISTS "users_email_idx";
  DROP INDEX IF EXISTS "tickets_order_idx";
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'customer';
  ALTER TABLE "tickets" DROP COLUMN IF EXISTS "order_id";`)
}
