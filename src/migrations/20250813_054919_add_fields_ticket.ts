import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_tickets_gift_info_status" AS ENUM('pending', 'confirmed', 'expired');
  ALTER TABLE "tickets" ADD COLUMN "gift_info_recipient_confirmation_expires_at" timestamp(3) with time zone;
  ALTER TABLE "tickets" ADD COLUMN "gift_info_status" "enum_tickets_gift_info_status" DEFAULT 'pending';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tickets" DROP COLUMN "gift_info_recipient_confirmation_expires_at";
  ALTER TABLE "tickets" DROP COLUMN "gift_info_status";
  DROP TYPE "public"."enum_tickets_gift_info_status";`)
}
