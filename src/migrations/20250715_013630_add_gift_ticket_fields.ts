import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tickets" ADD COLUMN "gift_info_is_gifted" boolean DEFAULT false;
  ALTER TABLE "tickets" ADD COLUMN "gift_info_attendee_name" varchar;
  ALTER TABLE "tickets" ADD COLUMN "gift_info_gift_recipient_id" integer;
  ALTER TABLE "tickets" ADD COLUMN "gift_info_gift_date" timestamp(3) with time zone;
  ALTER TABLE "tickets" ADD CONSTRAINT "tickets_gift_info_gift_recipient_id_users_id_fk" FOREIGN KEY ("gift_info_gift_recipient_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "tickets_gift_info_gift_info_gift_recipient_idx" ON "tickets" USING btree ("gift_info_gift_recipient_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tickets" DROP CONSTRAINT "tickets_gift_info_gift_recipient_id_users_id_fk";
  
  DROP INDEX "tickets_gift_info_gift_info_gift_recipient_idx";
  ALTER TABLE "tickets" DROP COLUMN "gift_info_is_gifted";
  ALTER TABLE "tickets" DROP COLUMN "gift_info_attendee_name";
  ALTER TABLE "tickets" DROP COLUMN "gift_info_gift_recipient_id";
  ALTER TABLE "tickets" DROP COLUMN "gift_info_gift_date";`)
}
