import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('affiliate', 'user');
  CREATE TYPE "public"."enum_affiliate_links_status" AS ENUM('active', 'disabled');
  CREATE TYPE "public"."enum_affiliate_settings_tiers_qua_criteria_elig_ticket_types" AS ENUM('zone1', 'zone2', 'zone3', 'zone4', 'zone5');
  CREATE TYPE "public"."enum_affiliate_settings_tiers_rewards_free_tickets_ticket_class" AS ENUM('zone1', 'zone2', 'zone3', 'zone4', 'zone5');
  CREATE TABLE IF NOT EXISTS "affiliate_links" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"affiliate_user_id" integer NOT NULL,
  	"event_id" integer,
  	"affiliate_code" varchar NOT NULL,
  	"promotion_code" varchar,
  	"utm_params" jsonb,
  	"target_link" varchar,
  	"status" "enum_affiliate_links_status" DEFAULT 'active',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "affiliate_click_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"affiliate_user_id" integer NOT NULL,
  	"affiliate_link_id" integer NOT NULL,
  	"ip" varchar,
  	"location" varchar,
  	"referrer" varchar,
  	"user_agent" varchar,
  	"more_information" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "affiliate_settings_tiers_qua_criteria_elig_ticket_types" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_affiliate_settings_tiers_qua_criteria_elig_ticket_types",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "affiliate_settings_tiers_rewards_free_tickets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ticket_class" "enum_affiliate_settings_tiers_rewards_free_tickets_ticket_class" NOT NULL,
  	"quantity" numeric NOT NULL,
  	"ticket_value" numeric
  );
  
  CREATE TABLE IF NOT EXISTS "affiliate_settings_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tier_name" varchar NOT NULL,
  	"tier_level" numeric NOT NULL,
  	"qua_criteria_min_tickets_sold" numeric NOT NULL,
  	"qua_criteria_max_tickets_sold" numeric,
  	"qua_criteria_min_net_revenue" numeric,
  	"qua_criteria_max_net_revenue" numeric,
  	"rewards_commission_percentage" numeric NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "affiliate_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"event_id" integer NOT NULL,
  	"affiliate_user_id" integer NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'user';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "affiliate_links_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "affiliate_click_logs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "affiliate_settings_id" integer;
  DO $$ BEGIN
   ALTER TABLE "affiliate_links" ADD CONSTRAINT "affiliate_links_affiliate_user_id_users_id_fk" FOREIGN KEY ("affiliate_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "affiliate_links" ADD CONSTRAINT "affiliate_links_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "affiliate_click_logs" ADD CONSTRAINT "affiliate_click_logs_affiliate_user_id_users_id_fk" FOREIGN KEY ("affiliate_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "affiliate_click_logs" ADD CONSTRAINT "affiliate_click_logs_affiliate_link_id_affiliate_links_id_fk" FOREIGN KEY ("affiliate_link_id") REFERENCES "public"."affiliate_links"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "affiliate_settings_tiers_qua_criteria_elig_ticket_types" ADD CONSTRAINT "affiliate_settings_tiers_qua_criteria_elig_ticket_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."affiliate_settings_tiers"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "affiliate_settings_tiers_rewards_free_tickets" ADD CONSTRAINT "affiliate_settings_tiers_rewards_free_tickets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."affiliate_settings_tiers"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "affiliate_settings_tiers" ADD CONSTRAINT "affiliate_settings_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."affiliate_settings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "affiliate_settings" ADD CONSTRAINT "affiliate_settings_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "affiliate_settings" ADD CONSTRAINT "affiliate_settings_affiliate_user_id_users_id_fk" FOREIGN KEY ("affiliate_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "affiliate_links_affiliate_user_idx" ON "affiliate_links" USING btree ("affiliate_user_id");
  CREATE INDEX IF NOT EXISTS "affiliate_links_event_idx" ON "affiliate_links" USING btree ("event_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "affiliate_links_affiliate_code_idx" ON "affiliate_links" USING btree ("affiliate_code");
  CREATE INDEX IF NOT EXISTS "affiliate_links_promotion_code_idx" ON "affiliate_links" USING btree ("promotion_code");
  CREATE INDEX IF NOT EXISTS "affiliate_links_updated_at_idx" ON "affiliate_links" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "affiliate_links_created_at_idx" ON "affiliate_links" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "affiliate_click_logs_affiliate_user_idx" ON "affiliate_click_logs" USING btree ("affiliate_user_id");
  CREATE INDEX IF NOT EXISTS "affiliate_click_logs_affiliate_link_idx" ON "affiliate_click_logs" USING btree ("affiliate_link_id");
  CREATE INDEX IF NOT EXISTS "affiliate_click_logs_updated_at_idx" ON "affiliate_click_logs" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "affiliate_click_logs_created_at_idx" ON "affiliate_click_logs" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "affiliate_settings_tiers_qua_criteria_elig_ticket_types_order_idx" ON "affiliate_settings_tiers_qua_criteria_elig_ticket_types" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "affiliate_settings_tiers_qua_criteria_elig_ticket_types_parent_idx" ON "affiliate_settings_tiers_qua_criteria_elig_ticket_types" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "affiliate_settings_tiers_rewards_free_tickets_order_idx" ON "affiliate_settings_tiers_rewards_free_tickets" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "affiliate_settings_tiers_rewards_free_tickets_parent_id_idx" ON "affiliate_settings_tiers_rewards_free_tickets" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "affiliate_settings_tiers_order_idx" ON "affiliate_settings_tiers" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "affiliate_settings_tiers_parent_id_idx" ON "affiliate_settings_tiers" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "affiliate_settings_event_idx" ON "affiliate_settings" USING btree ("event_id");
  CREATE INDEX IF NOT EXISTS "affiliate_settings_affiliate_user_idx" ON "affiliate_settings" USING btree ("affiliate_user_id");
  CREATE INDEX IF NOT EXISTS "affiliate_settings_updated_at_idx" ON "affiliate_settings" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "affiliate_settings_created_at_idx" ON "affiliate_settings" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_affiliate_links_fk" FOREIGN KEY ("affiliate_links_id") REFERENCES "public"."affiliate_links"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_affiliate_click_logs_fk" FOREIGN KEY ("affiliate_click_logs_id") REFERENCES "public"."affiliate_click_logs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_affiliate_settings_fk" FOREIGN KEY ("affiliate_settings_id") REFERENCES "public"."affiliate_settings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_affiliate_links_id_idx" ON "payload_locked_documents_rels" USING btree ("affiliate_links_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_affiliate_click_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("affiliate_click_logs_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_affiliate_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("affiliate_settings_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "affiliate_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "affiliate_click_logs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "affiliate_settings_tiers_qua_criteria_elig_ticket_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "affiliate_settings_tiers_rewards_free_tickets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "affiliate_settings_tiers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "affiliate_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "affiliate_links" CASCADE;
  DROP TABLE "affiliate_click_logs" CASCADE;
  DROP TABLE "affiliate_settings_tiers_qua_criteria_elig_ticket_types" CASCADE;
  DROP TABLE "affiliate_settings_tiers_rewards_free_tickets" CASCADE;
  DROP TABLE "affiliate_settings_tiers" CASCADE;
  DROP TABLE "affiliate_settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_affiliate_links_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_affiliate_click_logs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_affiliate_settings_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_affiliate_links_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_affiliate_click_logs_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_affiliate_settings_id_idx";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "role";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "affiliate_links_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "affiliate_click_logs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "affiliate_settings_id";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_affiliate_links_status";
  DROP TYPE "public"."enum_affiliate_settings_tiers_qua_criteria_elig_ticket_types";
  DROP TYPE "public"."enum_affiliate_settings_tiers_rewards_free_tickets_ticket_class";`)
}
