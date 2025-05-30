import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "promotion_configs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"event_id" integer,
  	"validation_rules_allow_applying_multiple_promotions" boolean DEFAULT false,
  	"validation_rules_max_applied_promotions" numeric DEFAULT 1,
  	"stacking_rules_is_stackable" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "orders_promotions_applied" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"promotion_id" integer NOT NULL,
  	"promotion_code" varchar NOT NULL,
  	"discount_amount" numeric NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payments_promotions_applied" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"promotion_id" integer NOT NULL,
  	"promotion_code" varchar NOT NULL,
  	"discount_amount" numeric NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "promotion_configs_id" integer;
  DO $$ BEGIN
   ALTER TABLE "promotion_configs" ADD CONSTRAINT "promotion_configs_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "orders_promotions_applied" ADD CONSTRAINT "orders_promotions_applied_promotion_id_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "orders_promotions_applied" ADD CONSTRAINT "orders_promotions_applied_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payments_promotions_applied" ADD CONSTRAINT "payments_promotions_applied_promotion_id_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payments_promotions_applied" ADD CONSTRAINT "payments_promotions_applied_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "promotion_configs_event_idx" ON "promotion_configs" USING btree ("event_id");
  CREATE INDEX IF NOT EXISTS "promotion_configs_updated_at_idx" ON "promotion_configs" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "promotion_configs_created_at_idx" ON "promotion_configs" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "orders_promotions_applied_order_idx" ON "orders_promotions_applied" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "orders_promotions_applied_parent_id_idx" ON "orders_promotions_applied" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "orders_promotions_applied_promotion_idx" ON "orders_promotions_applied" USING btree ("promotion_id");
  CREATE INDEX IF NOT EXISTS "orders_promotions_applied_promotion_code_idx" ON "orders_promotions_applied" USING btree ("promotion_code");
  CREATE INDEX IF NOT EXISTS "payments_promotions_applied_order_idx" ON "payments_promotions_applied" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "payments_promotions_applied_parent_id_idx" ON "payments_promotions_applied" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "payments_promotions_applied_promotion_idx" ON "payments_promotions_applied" USING btree ("promotion_id");
  CREATE INDEX IF NOT EXISTS "payments_promotions_applied_promotion_code_idx" ON "payments_promotions_applied" USING btree ("promotion_code");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_promotion_configs_fk" FOREIGN KEY ("promotion_configs_id") REFERENCES "public"."promotion_configs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_promotion_configs_id_idx" ON "payload_locked_documents_rels" USING btree ("promotion_configs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "promotion_configs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders_promotions_applied" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payments_promotions_applied" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "promotion_configs" CASCADE;
  DROP TABLE "orders_promotions_applied" CASCADE;
  DROP TABLE "payments_promotions_applied" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_promotion_configs_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_promotion_configs_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "promotion_configs_id";`)
}
