import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ADD COLUMN "mobile_event_banner_id" integer;
  DO $$ BEGIN
   ALTER TABLE "events" ADD CONSTRAINT "events_mobile_event_banner_id_media_id_fk" FOREIGN KEY ("mobile_event_banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "events_mobile_event_banner_idx" ON "events" USING btree ("mobile_event_banner_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" DROP CONSTRAINT "events_mobile_event_banner_id_media_id_fk";
  
  DROP INDEX IF EXISTS "events_mobile_event_banner_idx";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "mobile_event_banner_id";`)
}
