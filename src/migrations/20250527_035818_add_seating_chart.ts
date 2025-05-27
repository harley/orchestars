import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "seating_charts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"seat_map_id" integer,
  	"chart_map_json" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "events" ADD COLUMN "seating_chart_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "seating_charts_id" integer;
  DO $$ BEGIN
   ALTER TABLE "seating_charts" ADD CONSTRAINT "seating_charts_seat_map_id_media_id_fk" FOREIGN KEY ("seat_map_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "seating_charts_seat_map_idx" ON "seating_charts" USING btree ("seat_map_id");
  CREATE INDEX IF NOT EXISTS "seating_charts_updated_at_idx" ON "seating_charts" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "seating_charts_created_at_idx" ON "seating_charts" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "events" ADD CONSTRAINT "events_seating_chart_id_seating_charts_id_fk" FOREIGN KEY ("seating_chart_id") REFERENCES "public"."seating_charts"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_seating_charts_fk" FOREIGN KEY ("seating_charts_id") REFERENCES "public"."seating_charts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "events_seating_chart_idx" ON "events" USING btree ("seating_chart_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_seating_charts_id_idx" ON "payload_locked_documents_rels" USING btree ("seating_charts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "seating_charts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "seating_charts" CASCADE;
  ALTER TABLE "events" DROP CONSTRAINT "events_seating_chart_id_seating_charts_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_seating_charts_fk";
  
  DROP INDEX IF EXISTS "events_seating_chart_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_seating_charts_id_idx";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "seating_chart_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "seating_charts_id";`)
}
