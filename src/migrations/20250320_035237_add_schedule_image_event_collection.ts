import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events_schedules" ADD COLUMN "schedule_image_id" integer;
  DO $$ BEGIN
   ALTER TABLE "events_schedules" ADD CONSTRAINT "events_schedules_schedule_image_id_media_id_fk" FOREIGN KEY ("schedule_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "events_schedules_schedule_image_idx" ON "events_schedules" USING btree ("schedule_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events_schedules" DROP CONSTRAINT "events_schedules_schedule_image_id_media_id_fk";
  
  DROP INDEX IF EXISTS "events_schedules_schedule_image_idx";
  ALTER TABLE "events_schedules" DROP COLUMN IF EXISTS "schedule_image_id";`)
}
