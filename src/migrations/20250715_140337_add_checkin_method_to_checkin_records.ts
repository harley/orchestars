import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_checkin_records_checkin_method" AS ENUM('qr', 'paper', 'search');
  ALTER TABLE "checkin_records" ADD COLUMN "checkin_method" "enum_checkin_records_checkin_method" DEFAULT 'qr' NOT NULL;`)
  
  // Update existing records based on manual field
  // manual=true → 'search', manual=false → 'qr'
  await db.execute(sql`
   UPDATE "checkin_records" 
   SET "checkin_method" = CASE 
     WHEN "manual" = true THEN 'search'::enum_checkin_records_checkin_method
     WHEN "manual" = false THEN 'qr'::enum_checkin_records_checkin_method
     ELSE 'qr'::enum_checkin_records_checkin_method
   END;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "checkin_records" DROP COLUMN "checkin_method";
  DROP TYPE "public"."enum_checkin_records_checkin_method";`)
}
