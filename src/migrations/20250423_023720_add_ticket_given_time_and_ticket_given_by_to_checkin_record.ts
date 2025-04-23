import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "checkin_records" ADD COLUMN "ticket_given_time" varchar;
  ALTER TABLE "checkin_records" ADD COLUMN "ticket_given_by_id" integer;
  DO $$ BEGIN
   ALTER TABLE "checkin_records" ADD CONSTRAINT "checkin_records_ticket_given_by_id_admins_id_fk" FOREIGN KEY ("ticket_given_by_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "checkin_records_ticket_given_by_idx" ON "checkin_records" USING btree ("ticket_given_by_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "checkin_records" DROP CONSTRAINT "checkin_records_ticket_given_by_id_admins_id_fk";
  
  DROP INDEX IF EXISTS "checkin_records_ticket_given_by_idx";
  ALTER TABLE "checkin_records" DROP COLUMN IF EXISTS "ticket_given_time";
  ALTER TABLE "checkin_records" DROP COLUMN IF EXISTS "ticket_given_by_id";`)
}
