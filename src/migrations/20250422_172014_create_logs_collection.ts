import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_logs_status" AS ENUM('success', 'error', 'warning', 'info');
  CREATE TABLE IF NOT EXISTS "logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"action" varchar NOT NULL,
  	"description" varchar,
  	"timestamp" timestamp(3) with time zone NOT NULL,
  	"status" "enum_logs_status" DEFAULT 'info',
  	"data" jsonb,
  	"order_id" integer,
  	"payment_id" integer,
  	"ip_address" varchar,
  	"user_agent" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "logs_id" integer;
  DO $$ BEGIN
   ALTER TABLE "logs" ADD CONSTRAINT "logs_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "logs" ADD CONSTRAINT "logs_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "logs_action_idx" ON "logs" USING btree ("action");
  CREATE INDEX IF NOT EXISTS "logs_timestamp_idx" ON "logs" USING btree ("timestamp");
  CREATE INDEX IF NOT EXISTS "logs_status_idx" ON "logs" USING btree ("status");
  CREATE INDEX IF NOT EXISTS "logs_order_idx" ON "logs" USING btree ("order_id");
  CREATE INDEX IF NOT EXISTS "logs_payment_idx" ON "logs" USING btree ("payment_id");
  CREATE INDEX IF NOT EXISTS "logs_updated_at_idx" ON "logs" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "logs_created_at_idx" ON "logs" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_logs_fk" FOREIGN KEY ("logs_id") REFERENCES "public"."logs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("logs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "logs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "logs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_logs_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_logs_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "logs_id";
  DROP TYPE "public"."enum_logs_status";`)
}
