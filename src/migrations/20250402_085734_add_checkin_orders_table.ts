import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "checkin_records" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_id" integer NOT NULL,
  	"user_id" integer NOT NULL,
  	"ticket_id" integer NOT NULL,
  	"ticket_code" varchar NOT NULL,
  	"event_schedule_id" varchar,
  	"check_in_time" timestamp(3) with time zone,
  	"checked_in_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "checkin_records_id" integer;
  DO $$ BEGIN
   ALTER TABLE "checkin_records" ADD CONSTRAINT "checkin_records_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "checkin_records" ADD CONSTRAINT "checkin_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "checkin_records" ADD CONSTRAINT "checkin_records_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "checkin_records" ADD CONSTRAINT "checkin_records_checked_in_by_id_users_id_fk" FOREIGN KEY ("checked_in_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "checkin_records_event_idx" ON "checkin_records" USING btree ("event_id");
  CREATE INDEX IF NOT EXISTS "checkin_records_user_idx" ON "checkin_records" USING btree ("user_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "checkin_records_ticket_idx" ON "checkin_records" USING btree ("ticket_id");
  CREATE INDEX IF NOT EXISTS "checkin_records_checked_in_by_idx" ON "checkin_records" USING btree ("checked_in_by_id");
  CREATE INDEX IF NOT EXISTS "checkin_records_updated_at_idx" ON "checkin_records" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "checkin_records_created_at_idx" ON "checkin_records" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_checkin_records_fk" FOREIGN KEY ("checkin_records_id") REFERENCES "public"."checkin_records"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_checkin_records_id_idx" ON "payload_locked_documents_rels" USING btree ("checkin_records_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "checkin_records" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "checkin_records" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_checkin_records_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_checkin_records_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "checkin_records_id";`)
}
