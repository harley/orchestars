import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "marketing_trackings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_id" integer,
  	"description" varchar,
  	"utm_source" varchar,
  	"utm_medium" varchar,
  	"utm_campaign" varchar,
  	"utm_term" varchar,
  	"utm_content" varchar,
  	"conversion_type" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "marketing_trackings_id" integer;
  DO $$ BEGIN
   ALTER TABLE "marketing_trackings" ADD CONSTRAINT "marketing_trackings_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "marketing_trackings_order_idx" ON "marketing_trackings" USING btree ("order_id");
  CREATE INDEX IF NOT EXISTS "marketing_trackings_utm_source_idx" ON "marketing_trackings" USING btree ("utm_source");
  CREATE INDEX IF NOT EXISTS "marketing_trackings_utm_medium_idx" ON "marketing_trackings" USING btree ("utm_medium");
  CREATE INDEX IF NOT EXISTS "marketing_trackings_utm_campaign_idx" ON "marketing_trackings" USING btree ("utm_campaign");
  CREATE INDEX IF NOT EXISTS "marketing_trackings_conversion_type_idx" ON "marketing_trackings" USING btree ("conversion_type");
  CREATE INDEX IF NOT EXISTS "marketing_trackings_updated_at_idx" ON "marketing_trackings" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "marketing_trackings_created_at_idx" ON "marketing_trackings" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_marketing_trackings_fk" FOREIGN KEY ("marketing_trackings_id") REFERENCES "public"."marketing_trackings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_marketing_trackings_id_idx" ON "payload_locked_documents_rels" USING btree ("marketing_trackings_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "marketing_trackings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "marketing_trackings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_marketing_trackings_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_marketing_trackings_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "marketing_trackings_id";`)
}
