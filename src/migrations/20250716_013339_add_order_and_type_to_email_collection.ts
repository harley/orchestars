import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_emails_type" AS ENUM('qr_event_ticket', 'event_ticket_confirmation', 'reset_password');
  ALTER TABLE "emails" ADD COLUMN "order_id" integer;
  ALTER TABLE "emails" ADD COLUMN "type" "enum_emails_type";
  ALTER TABLE "emails" ADD CONSTRAINT "emails_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "emails_order_idx" ON "emails" USING btree ("order_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "emails" DROP CONSTRAINT "emails_order_id_orders_id_fk";
  
  DROP INDEX "emails_order_idx";
  ALTER TABLE "emails" DROP COLUMN "order_id";
  ALTER TABLE "emails" DROP COLUMN "type";
  DROP TYPE "public"."enum_emails_type";`)
}
