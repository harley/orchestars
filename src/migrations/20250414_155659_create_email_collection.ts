import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "emails" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer,
  	"event_id" integer,
  	"ticket_id" integer,
  	"to" varchar NOT NULL,
  	"cc" varchar,
  	"subject" varchar NOT NULL,
  	"html" varchar,
  	"text" varchar,
  	"provider" varchar DEFAULT 'RESEND',
  	"extra_data" jsonb,
  	"sent_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "emails_id" integer;
  DO $$ BEGIN
   ALTER TABLE "emails" ADD CONSTRAINT "emails_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "emails" ADD CONSTRAINT "emails_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "emails" ADD CONSTRAINT "emails_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "emails_user_idx" ON "emails" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "emails_event_idx" ON "emails" USING btree ("event_id");
  CREATE INDEX IF NOT EXISTS "emails_ticket_idx" ON "emails" USING btree ("ticket_id");
  CREATE INDEX IF NOT EXISTS "emails_updated_at_idx" ON "emails" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "emails_created_at_idx" ON "emails" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_emails_fk" FOREIGN KEY ("emails_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_emails_id_idx" ON "payload_locked_documents_rels" USING btree ("emails_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "emails" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "emails" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_emails_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_emails_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "emails_id";`)
}
