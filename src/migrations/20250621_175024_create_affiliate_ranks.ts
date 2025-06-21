import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_affiliate_ranks_rank_name" AS ENUM('seller', 'fan', 'ambassador', 'patron');
  CREATE TYPE "public"."enum_event_affiliate_ranks_rank_name" AS ENUM('seller', 'fan', 'ambassador', 'patron');
  CREATE TYPE "public"."enum_event_affiliate_ranks_status" AS ENUM('draft', 'active', 'disabled');
  CREATE TYPE "public"."enum_affiliate_user_ranks_current_rank" AS ENUM('seller', 'fan', 'ambassador', 'patron');
  CREATE TYPE "public"."enum_affiliate_user_ranks_pending_rank_upgrade" AS ENUM('seller', 'fan', 'ambassador', 'patron');
  CREATE TYPE "public"."enum_affiliate_rank_logs_action_type" AS ENUM('add_points', 'subtract_points', 'rank_upgrade', 'rank_downgrade', 'confirm_rank_upgrade');
  CREATE TYPE "public"."enum_affiliate_rank_logs_rank_before" AS ENUM('seller', 'fan', 'ambassador', 'patron');
  CREATE TYPE "public"."enum_affiliate_rank_logs_rank_after" AS ENUM('seller', 'fan', 'ambassador', 'patron');
  CREATE TABLE IF NOT EXISTS "affiliate_ranks_rewards_ticket_rewards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"min_tickets" numeric,
  	"max_tickets" numeric,
  	"min_revenue" numeric,
  	"max_revenue" numeric,
  	"reward_tickets" numeric
  );
  
  CREATE TABLE IF NOT EXISTS "affiliate_ranks_rewards_commission_rewards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"min_tickets" numeric,
  	"max_tickets" numeric,
  	"min_revenue" numeric,
  	"max_revenue" numeric,
  	"commission_rate" numeric
  );
  
  CREATE TABLE IF NOT EXISTS "affiliate_ranks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"rank_name" "enum_affiliate_ranks_rank_name" NOT NULL,
  	"description" varchar,
  	"min_points" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "event_affiliate_ranks_event_rewards_ticket_rewards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"min_tickets" numeric,
  	"max_tickets" numeric,
  	"min_revenue" numeric,
  	"max_revenue" numeric,
  	"reward_tickets" numeric DEFAULT 0
  );
  
  CREATE TABLE IF NOT EXISTS "event_affiliate_ranks_event_rewards_commission_rewards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"min_tickets" numeric,
  	"max_tickets" numeric,
  	"min_revenue" numeric,
  	"max_revenue" numeric,
  	"commission_rate" numeric DEFAULT 0
  );
  
  CREATE TABLE IF NOT EXISTS "event_affiliate_ranks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_id" integer NOT NULL,
  	"affiliate_user_id" integer NOT NULL,
  	"rank_name" "enum_event_affiliate_ranks_rank_name" NOT NULL,
  	"status" "enum_event_affiliate_ranks_status" DEFAULT 'draft' NOT NULL,
  	"is_locked" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "affiliate_user_ranks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"affiliate_user_id" integer NOT NULL,
  	"current_rank" "enum_affiliate_user_ranks_current_rank" DEFAULT 'seller' NOT NULL,
  	"total_points" numeric DEFAULT 0 NOT NULL,
  	"total_revenue" numeric DEFAULT 0 NOT NULL,
  	"total_revenue_before_discount" numeric DEFAULT 0 NOT NULL,
  	"total_tickets_sold" numeric DEFAULT 0 NOT NULL,
  	"total_commission_earned" numeric DEFAULT 0 NOT NULL,
  	"total_tickets_rewarded" numeric DEFAULT 0 NOT NULL,
  	"rank_achieved_date" timestamp(3) with time zone,
  	"last_activity_date" timestamp(3) with time zone,
  	"pending_rank_upgrade" "enum_affiliate_user_ranks_pending_rank_upgrade",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "affiliate_rank_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"affiliate_user_id" integer NOT NULL,
  	"action_type" "enum_affiliate_rank_logs_action_type" NOT NULL,
  	"points_change" numeric DEFAULT 0,
  	"points_before" numeric,
  	"points_after" numeric,
  	"rank_before" "enum_affiliate_rank_logs_rank_before",
  	"rank_after" "enum_affiliate_rank_logs_rank_after",
  	"description" varchar,
  	"occurred_at" timestamp(3) with time zone NOT NULL,
  	"event_id" integer,
  	"order_id" integer,
  	"admin_user_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "affiliate_ranks_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "event_affiliate_ranks_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "affiliate_user_ranks_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "affiliate_rank_logs_id" integer;
  DO $$ BEGIN
   ALTER TABLE "affiliate_ranks_rewards_ticket_rewards" ADD CONSTRAINT "affiliate_ranks_rewards_ticket_rewards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."affiliate_ranks"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "affiliate_ranks_rewards_commission_rewards" ADD CONSTRAINT "affiliate_ranks_rewards_commission_rewards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."affiliate_ranks"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "event_affiliate_ranks_event_rewards_ticket_rewards" ADD CONSTRAINT "event_affiliate_ranks_event_rewards_ticket_rewards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_affiliate_ranks"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "event_affiliate_ranks_event_rewards_commission_rewards" ADD CONSTRAINT "event_affiliate_ranks_event_rewards_commission_rewards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_affiliate_ranks"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "event_affiliate_ranks" ADD CONSTRAINT "event_affiliate_ranks_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "event_affiliate_ranks" ADD CONSTRAINT "event_affiliate_ranks_affiliate_user_id_users_id_fk" FOREIGN KEY ("affiliate_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "affiliate_user_ranks" ADD CONSTRAINT "affiliate_user_ranks_affiliate_user_id_users_id_fk" FOREIGN KEY ("affiliate_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "affiliate_rank_logs" ADD CONSTRAINT "affiliate_rank_logs_affiliate_user_id_users_id_fk" FOREIGN KEY ("affiliate_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "affiliate_rank_logs" ADD CONSTRAINT "affiliate_rank_logs_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "affiliate_rank_logs" ADD CONSTRAINT "affiliate_rank_logs_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "affiliate_rank_logs" ADD CONSTRAINT "affiliate_rank_logs_admin_user_id_admins_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "affiliate_ranks_rewards_ticket_rewards_order_idx" ON "affiliate_ranks_rewards_ticket_rewards" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "affiliate_ranks_rewards_ticket_rewards_parent_id_idx" ON "affiliate_ranks_rewards_ticket_rewards" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "affiliate_ranks_rewards_commission_rewards_order_idx" ON "affiliate_ranks_rewards_commission_rewards" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "affiliate_ranks_rewards_commission_rewards_parent_id_idx" ON "affiliate_ranks_rewards_commission_rewards" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "affiliate_ranks_rank_name_idx" ON "affiliate_ranks" USING btree ("rank_name");
  CREATE INDEX IF NOT EXISTS "affiliate_ranks_updated_at_idx" ON "affiliate_ranks" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "affiliate_ranks_created_at_idx" ON "affiliate_ranks" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "event_affiliate_ranks_event_rewards_ticket_rewards_order_idx" ON "event_affiliate_ranks_event_rewards_ticket_rewards" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "event_affiliate_ranks_event_rewards_ticket_rewards_parent_id_idx" ON "event_affiliate_ranks_event_rewards_ticket_rewards" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "event_affiliate_ranks_event_rewards_commission_rewards_order_idx" ON "event_affiliate_ranks_event_rewards_commission_rewards" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "event_affiliate_ranks_event_rewards_commission_rewards_parent_id_idx" ON "event_affiliate_ranks_event_rewards_commission_rewards" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "event_affiliate_ranks_event_idx" ON "event_affiliate_ranks" USING btree ("event_id");
  CREATE INDEX IF NOT EXISTS "event_affiliate_ranks_affiliate_user_idx" ON "event_affiliate_ranks" USING btree ("affiliate_user_id");
  CREATE INDEX IF NOT EXISTS "event_affiliate_ranks_updated_at_idx" ON "event_affiliate_ranks" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "event_affiliate_ranks_created_at_idx" ON "event_affiliate_ranks" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "affiliate_user_ranks_affiliate_user_idx" ON "affiliate_user_ranks" USING btree ("affiliate_user_id");
  CREATE INDEX IF NOT EXISTS "affiliate_user_ranks_updated_at_idx" ON "affiliate_user_ranks" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "affiliate_user_ranks_created_at_idx" ON "affiliate_user_ranks" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "affiliate_rank_logs_affiliate_user_idx" ON "affiliate_rank_logs" USING btree ("affiliate_user_id");
  CREATE INDEX IF NOT EXISTS "affiliate_rank_logs_event_idx" ON "affiliate_rank_logs" USING btree ("event_id");
  CREATE INDEX IF NOT EXISTS "affiliate_rank_logs_order_idx" ON "affiliate_rank_logs" USING btree ("order_id");
  CREATE INDEX IF NOT EXISTS "affiliate_rank_logs_admin_user_idx" ON "affiliate_rank_logs" USING btree ("admin_user_id");
  CREATE INDEX IF NOT EXISTS "affiliate_rank_logs_updated_at_idx" ON "affiliate_rank_logs" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "affiliate_rank_logs_created_at_idx" ON "affiliate_rank_logs" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_affiliate_ranks_fk" FOREIGN KEY ("affiliate_ranks_id") REFERENCES "public"."affiliate_ranks"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_affiliate_ranks_fk" FOREIGN KEY ("event_affiliate_ranks_id") REFERENCES "public"."event_affiliate_ranks"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_affiliate_user_ranks_fk" FOREIGN KEY ("affiliate_user_ranks_id") REFERENCES "public"."affiliate_user_ranks"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_affiliate_rank_logs_fk" FOREIGN KEY ("affiliate_rank_logs_id") REFERENCES "public"."affiliate_rank_logs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_affiliate_ranks_id_idx" ON "payload_locked_documents_rels" USING btree ("affiliate_ranks_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_event_affiliate_ranks_id_idx" ON "payload_locked_documents_rels" USING btree ("event_affiliate_ranks_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_affiliate_user_ranks_id_idx" ON "payload_locked_documents_rels" USING btree ("affiliate_user_ranks_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_affiliate_rank_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("affiliate_rank_logs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "affiliate_ranks_rewards_ticket_rewards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "affiliate_ranks_rewards_commission_rewards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "affiliate_ranks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_affiliate_ranks_event_rewards_ticket_rewards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_affiliate_ranks_event_rewards_commission_rewards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_affiliate_ranks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "affiliate_user_ranks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "affiliate_rank_logs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "affiliate_ranks_rewards_ticket_rewards" CASCADE;
  DROP TABLE "affiliate_ranks_rewards_commission_rewards" CASCADE;
  DROP TABLE "affiliate_ranks" CASCADE;
  DROP TABLE "event_affiliate_ranks_event_rewards_ticket_rewards" CASCADE;
  DROP TABLE "event_affiliate_ranks_event_rewards_commission_rewards" CASCADE;
  DROP TABLE "event_affiliate_ranks" CASCADE;
  DROP TABLE "affiliate_user_ranks" CASCADE;
  DROP TABLE "affiliate_rank_logs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_affiliate_ranks_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_event_affiliate_ranks_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_affiliate_user_ranks_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_affiliate_rank_logs_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_affiliate_ranks_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_event_affiliate_ranks_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_affiliate_user_ranks_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_affiliate_rank_logs_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "affiliate_ranks_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "event_affiliate_ranks_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "affiliate_user_ranks_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "affiliate_rank_logs_id";
  DROP TYPE "public"."enum_affiliate_ranks_rank_name";
  DROP TYPE "public"."enum_event_affiliate_ranks_rank_name";
  DROP TYPE "public"."enum_event_affiliate_ranks_status";
  DROP TYPE "public"."enum_affiliate_user_ranks_current_rank";
  DROP TYPE "public"."enum_affiliate_user_ranks_pending_rank_upgrade";
  DROP TYPE "public"."enum_affiliate_rank_logs_action_type";
  DROP TYPE "public"."enum_affiliate_rank_logs_rank_before";
  DROP TYPE "public"."enum_affiliate_rank_logs_rank_after";`)
}
