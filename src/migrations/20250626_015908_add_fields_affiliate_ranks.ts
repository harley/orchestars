import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_affiliate_rank_logs_rank_context" AS ENUM('user', 'event');
  ALTER TYPE "public"."enum_affiliate_rank_logs_action_type" ADD VALUE 'event_completed';
  ALTER TABLE "event_affiliate_user_ranks" ADD COLUMN "event_id" integer NOT NULL;
  ALTER TABLE "event_affiliate_user_ranks" ADD COLUMN "total_points" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE "event_affiliate_user_ranks" ADD COLUMN "total_revenue" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE "event_affiliate_user_ranks" ADD COLUMN "total_revenue_before_discount" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE "event_affiliate_user_ranks" ADD COLUMN "total_tickets_sold" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE "event_affiliate_user_ranks" ADD COLUMN "total_commission_earned" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE "event_affiliate_user_ranks" ADD COLUMN "total_tickets_rewarded" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE "event_affiliate_user_ranks" ADD COLUMN "last_activity_date" timestamp(3) with time zone;
  ALTER TABLE "event_affiliate_user_ranks" ADD COLUMN "is_completed" boolean DEFAULT false;
  ALTER TABLE "affiliate_rank_logs" ADD COLUMN "rank_context" "enum_affiliate_rank_logs_rank_context" DEFAULT 'user' NOT NULL;
  ALTER TABLE "affiliate_rank_logs" ADD COLUMN "event_affiliate_rank_id" integer;
  DO $$ BEGIN
   ALTER TABLE "event_affiliate_user_ranks" ADD CONSTRAINT "event_affiliate_user_ranks_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "affiliate_rank_logs" ADD CONSTRAINT "affiliate_rank_logs_event_affiliate_rank_id_event_affiliate_ranks_id_fk" FOREIGN KEY ("event_affiliate_rank_id") REFERENCES "public"."event_affiliate_ranks"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "event_affiliate_user_ranks_event_idx" ON "event_affiliate_user_ranks" USING btree ("event_id");
  CREATE INDEX IF NOT EXISTS "affiliate_rank_logs_event_affiliate_rank_idx" ON "affiliate_rank_logs" USING btree ("event_affiliate_rank_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "event_affiliate_user_ranks" DROP CONSTRAINT "event_affiliate_user_ranks_event_id_events_id_fk";
  
  ALTER TABLE "affiliate_rank_logs" DROP CONSTRAINT "affiliate_rank_logs_event_affiliate_rank_id_event_affiliate_ranks_id_fk";
  
  DROP INDEX IF EXISTS "event_affiliate_user_ranks_event_idx";
  DROP INDEX IF EXISTS "affiliate_rank_logs_event_affiliate_rank_idx";
  ALTER TABLE "event_affiliate_user_ranks" DROP COLUMN IF EXISTS "event_id";
  ALTER TABLE "event_affiliate_user_ranks" DROP COLUMN IF EXISTS "total_points";
  ALTER TABLE "event_affiliate_user_ranks" DROP COLUMN IF EXISTS "total_revenue";
  ALTER TABLE "event_affiliate_user_ranks" DROP COLUMN IF EXISTS "total_revenue_before_discount";
  ALTER TABLE "event_affiliate_user_ranks" DROP COLUMN IF EXISTS "total_tickets_sold";
  ALTER TABLE "event_affiliate_user_ranks" DROP COLUMN IF EXISTS "total_commission_earned";
  ALTER TABLE "event_affiliate_user_ranks" DROP COLUMN IF EXISTS "total_tickets_rewarded";
  ALTER TABLE "event_affiliate_user_ranks" DROP COLUMN IF EXISTS "last_activity_date";
  ALTER TABLE "event_affiliate_user_ranks" DROP COLUMN IF EXISTS "is_completed";
  ALTER TABLE "affiliate_rank_logs" DROP COLUMN IF EXISTS "rank_context";
  ALTER TABLE "affiliate_rank_logs" DROP COLUMN IF EXISTS "event_affiliate_rank_id";
  ALTER TABLE "public"."affiliate_rank_logs" ALTER COLUMN "action_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_affiliate_rank_logs_action_type";
  CREATE TYPE "public"."enum_affiliate_rank_logs_action_type" AS ENUM('add_points', 'subtract_points', 'rank_upgrade', 'rank_downgrade', 'confirm_rank_upgrade');
  ALTER TABLE "public"."affiliate_rank_logs" ALTER COLUMN "action_type" SET DATA TYPE "public"."enum_affiliate_rank_logs_action_type" USING "action_type"::"public"."enum_affiliate_rank_logs_action_type";
  DROP TYPE "public"."enum_affiliate_rank_logs_rank_context";`)
}
