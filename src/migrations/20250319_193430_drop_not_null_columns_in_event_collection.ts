import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   
  DROP INDEX IF EXISTS "events_event_logo_1_idx";
  DROP INDEX IF EXISTS "events_event_banner_1_idx";
  DROP INDEX IF EXISTS "events_event_thumbnail_1_idx";
  DROP INDEX IF EXISTS "events_sponsor_logo_1_idx";
  DROP INDEX IF EXISTS "events_updated_at_1_idx";
  DROP INDEX IF EXISTS "events_created_at_1_idx";
  ALTER TABLE "events" ALTER COLUMN "updated_at" SET DEFAULT now();
  ALTER TABLE "events" ALTER COLUMN "updated_at" SET NOT NULL;
  ALTER TABLE "events" ALTER COLUMN "created_at" SET DEFAULT now();
  ALTER TABLE "events" ALTER COLUMN "created_at" SET NOT NULL;

  
  CREATE INDEX IF NOT EXISTS "events_event_logo_idx" ON "events" USING btree ("event_logo_id");
  CREATE INDEX IF NOT EXISTS "events_event_banner_idx" ON "events" USING btree ("event_banner_id");
  CREATE INDEX IF NOT EXISTS "events_event_thumbnail_idx" ON "events" USING btree ("event_thumbnail_id");
  CREATE INDEX IF NOT EXISTS "events_sponsor_logo_idx" ON "events" USING btree ("sponsor_logo_id");
  CREATE INDEX IF NOT EXISTS "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "events_created_at_idx" ON "events" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP INDEX IF EXISTS "events_event_logo_idx";
  DROP INDEX IF EXISTS "events_event_banner_idx";
  DROP INDEX IF EXISTS "events_event_thumbnail_idx";
  DROP INDEX IF EXISTS "events_sponsor_logo_idx";
  DROP INDEX IF EXISTS "events_updated_at_idx";
  DROP INDEX IF EXISTS "events_created_at_idx";
  ALTER TABLE "events" ALTER COLUMN "updated_at" DROP DEFAULT;
  ALTER TABLE "events" ALTER COLUMN "updated_at" DROP NOT NULL;
  ALTER TABLE "events" ALTER COLUMN "created_at" DROP DEFAULT;
  ALTER TABLE "events" ALTER COLUMN "created_at" DROP NOT NULL;
  CREATE INDEX IF NOT EXISTS "events_event_logo_1_idx" ON "events" USING btree ("event_logo_id");
  CREATE INDEX IF NOT EXISTS "events_event_banner_1_idx" ON "events" USING btree ("event_banner_id");
  CREATE INDEX IF NOT EXISTS "events_event_thumbnail_1_idx" ON "events" USING btree ("event_thumbnail_id");
  CREATE INDEX IF NOT EXISTS "events_sponsor_logo_1_idx" ON "events" USING btree ("sponsor_logo_id");
  CREATE INDEX IF NOT EXISTS "events_updated_at_1_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "events_created_at_1_idx" ON "events" USING btree ("created_at");
  `)
}
