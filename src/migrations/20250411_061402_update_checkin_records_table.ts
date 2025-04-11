import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "checkin_records" DROP CONSTRAINT "checkin_records_checked_in_by_id_users_id_fk";
  
  DO $$ BEGIN
   ALTER TABLE "checkin_records" ADD CONSTRAINT "checkin_records_checked_in_by_id_admins_id_fk" FOREIGN KEY ("checked_in_by_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "checkin_records" DROP CONSTRAINT "checkin_records_checked_in_by_id_admins_id_fk";
  
  DO $$ BEGIN
   ALTER TABLE "checkin_records" ADD CONSTRAINT "checkin_records_checked_in_by_id_users_id_fk" FOREIGN KEY ("checked_in_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  `)
}
