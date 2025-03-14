import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "seat_holdings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seat_name" varchar NOT NULL,
  	"event_id" integer NOT NULL,
  	"code" varchar NOT NULL,
  	"user_info" jsonb,
  	"closed_at" timestamp(3) with time zone,
  	"expire_time" timestamp(3) with time zone,
  	"ip_address" varchar,
  	"user_agent" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'processing';
  ALTER TABLE "payments" ADD COLUMN "transaction_code" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "seat_holdings_id" integer;
  DO $$ BEGIN
   ALTER TABLE "seat_holdings" ADD CONSTRAINT "seat_holdings_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "seat_holdings_event_idx" ON "seat_holdings" USING btree ("event_id");
  CREATE INDEX IF NOT EXISTS "seat_holdings_updated_at_idx" ON "seat_holdings" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "seat_holdings_created_at_idx" ON "seat_holdings" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_seat_holdings_fk" FOREIGN KEY ("seat_holdings_id") REFERENCES "public"."seat_holdings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_seat_holdings_id_idx" ON "payload_locked_documents_rels" USING btree ("seat_holdings_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "seat_holdings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "seat_holdings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_seat_holdings_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_seat_holdings_id_idx";
  ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE varchar;
  ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;
  ALTER TABLE "payments" DROP COLUMN IF EXISTS "transaction_code";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "seat_holdings_id";`)
}
