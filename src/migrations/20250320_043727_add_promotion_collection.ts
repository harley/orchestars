import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_promotions_discount_type" AS ENUM('percentage', 'fixed_amount');
  CREATE TYPE "public"."enum_promotions_status" AS ENUM('draft', 'active', 'disabled');
  CREATE TYPE "public"."enum_user_promotion_redemptions_status" AS ENUM('pending', 'used', 'cancelled');
  CREATE TABLE IF NOT EXISTS "promotions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"event_id" integer,
  	"max_redemptions" numeric NOT NULL,
  	"total_used" numeric,
  	"per_user_limit" numeric,
  	"discount_type" "enum_promotions_discount_type" NOT NULL,
  	"discount_value" numeric NOT NULL,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone NOT NULL,
  	"status" "enum_promotions_status" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "user_promotion_redemptions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"promotion_id" integer NOT NULL,
  	"payment_id" integer NOT NULL,
  	"event_id" integer,
  	"user_id" integer NOT NULL,
  	"redeem_at" timestamp(3) with time zone,
  	"expire_at" timestamp(3) with time zone,
  	"status" "enum_user_promotion_redemptions_status",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "orders" ADD COLUMN "promotion_id" integer;
  ALTER TABLE "orders" ADD COLUMN "promotion_code" varchar;
  ALTER TABLE "orders" ADD COLUMN "total_before_discount" numeric;
  ALTER TABLE "orders" ADD COLUMN "total_discount" numeric;
  ALTER TABLE "payments" ADD COLUMN "promotion_id" integer;
  ALTER TABLE "payments" ADD COLUMN "promotion_code" varchar;
  ALTER TABLE "payments" ADD COLUMN "total_before_discount" numeric;
  ALTER TABLE "payments" ADD COLUMN "total_discount" numeric;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "promotions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "user_promotion_redemptions_id" integer;
  DO $$ BEGIN
   ALTER TABLE "promotions" ADD CONSTRAINT "promotions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "user_promotion_redemptions" ADD CONSTRAINT "user_promotion_redemptions_promotion_id_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "user_promotion_redemptions" ADD CONSTRAINT "user_promotion_redemptions_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "user_promotion_redemptions" ADD CONSTRAINT "user_promotion_redemptions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "user_promotion_redemptions" ADD CONSTRAINT "user_promotion_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE UNIQUE INDEX IF NOT EXISTS "promotions_code_idx" ON "promotions" USING btree ("code");
  CREATE INDEX IF NOT EXISTS "promotions_event_idx" ON "promotions" USING btree ("event_id");
  CREATE INDEX IF NOT EXISTS "promotions_updated_at_idx" ON "promotions" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "promotions_created_at_idx" ON "promotions" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "user_promotion_redemptions_promotion_idx" ON "user_promotion_redemptions" USING btree ("promotion_id");
  CREATE INDEX IF NOT EXISTS "user_promotion_redemptions_payment_idx" ON "user_promotion_redemptions" USING btree ("payment_id");
  CREATE INDEX IF NOT EXISTS "user_promotion_redemptions_event_idx" ON "user_promotion_redemptions" USING btree ("event_id");
  CREATE INDEX IF NOT EXISTS "user_promotion_redemptions_user_idx" ON "user_promotion_redemptions" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "user_promotion_redemptions_updated_at_idx" ON "user_promotion_redemptions" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "user_promotion_redemptions_created_at_idx" ON "user_promotion_redemptions" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "orders" ADD CONSTRAINT "orders_promotion_id_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payments" ADD CONSTRAINT "payments_promotion_id_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_promotions_fk" FOREIGN KEY ("promotions_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_user_promotion_redemptions_fk" FOREIGN KEY ("user_promotion_redemptions_id") REFERENCES "public"."user_promotion_redemptions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "orders_promotion_idx" ON "orders" USING btree ("promotion_id");
  CREATE INDEX IF NOT EXISTS "payments_promotion_idx" ON "payments" USING btree ("promotion_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_promotions_id_idx" ON "payload_locked_documents_rels" USING btree ("promotions_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_user_promotion_redemptions_id_idx" ON "payload_locked_documents_rels" USING btree ("user_promotion_redemptions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "promotions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "user_promotion_redemptions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "promotions" CASCADE;
  DROP TABLE "user_promotion_redemptions" CASCADE;
  ALTER TABLE "orders" DROP CONSTRAINT "orders_promotion_id_promotions_id_fk";
  
  ALTER TABLE "payments" DROP CONSTRAINT "payments_promotion_id_promotions_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_promotions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_user_promotion_redemptions_fk";
  
  DROP INDEX IF EXISTS "orders_promotion_idx";
  DROP INDEX IF EXISTS "payments_promotion_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_promotions_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_user_promotion_redemptions_id_idx";
  ALTER TABLE "orders" DROP COLUMN IF EXISTS "promotion_id";
  ALTER TABLE "orders" DROP COLUMN IF EXISTS "promotion_code";
  ALTER TABLE "orders" DROP COLUMN IF EXISTS "total_before_discount";
  ALTER TABLE "orders" DROP COLUMN IF EXISTS "total_discount";
  ALTER TABLE "payments" DROP COLUMN IF EXISTS "promotion_id";
  ALTER TABLE "payments" DROP COLUMN IF EXISTS "promotion_code";
  ALTER TABLE "payments" DROP COLUMN IF EXISTS "total_before_discount";
  ALTER TABLE "payments" DROP COLUMN IF EXISTS "total_discount";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "promotions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "user_promotion_redemptions_id";
  DROP TYPE "public"."enum_promotions_discount_type";
  DROP TYPE "public"."enum_promotions_status";
  DROP TYPE "public"."enum_user_promotion_redemptions_status";`)
}
