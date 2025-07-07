import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_membership_rank_configs_rank_name" AS ENUM('Tier1', 'Tier2', 'Tier3', 'Tier4');
  CREATE TYPE "public"."enum_membership_rank_configs_benefits_ticket_gift" AS ENUM('zone1', 'zone2', 'zone3', 'zone4', 'zone5');
  CREATE TYPE "public"."enum_membership_gifts_gift_type" AS ENUM('giftTicket');
  CREATE TYPE "public"."enum_membership_gifts_ticket_gift" AS ENUM('zone1', 'zone2', 'zone3', 'zone4', 'zone5');
  CREATE TYPE "public"."enum_membership_histories_type" AS ENUM('earned', 'spent', 'birthday', 'receivedTicketGift');
  CREATE TABLE "memberships" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"total_points" numeric DEFAULT 0 NOT NULL,
  	"membership_rank_id" integer,
  	"last_active" timestamp(3) with time zone NOT NULL,
  	"points_expiration_date" timestamp(3) with time zone,
  	"last_received_birthday_point_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "membership_rank_configs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"rank_name" "enum_membership_rank_configs_rank_name" NOT NULL,
  	"rank_name_label" varchar,
  	"expires_in" numeric DEFAULT 380,
  	"description" varchar,
  	"condition_min_points" numeric DEFAULT 0 NOT NULL,
  	"benefits_birthday_points" numeric DEFAULT 0,
  	"benefits_ticket_gift" "enum_membership_rank_configs_benefits_ticket_gift",
  	"benefits_gift_expires_in" numeric DEFAULT 365,
  	"benefits_discount_percentage" numeric DEFAULT 0,
  	"benefits_vip_check_in" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "membership_gifts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"gift_type" "enum_membership_gifts_gift_type" NOT NULL,
  	"ticket_gift" "enum_membership_gifts_ticket_gift",
  	"received_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "membership_histories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"membership_id" integer,
  	"order_id" integer,
  	"points_before" numeric,
  	"points_change" numeric DEFAULT 0,
  	"points_after" numeric,
  	"type" "enum_membership_histories_type" NOT NULL,
  	"description" varchar,
  	"more_information" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "memberships_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "membership_rank_configs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "membership_gifts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "membership_histories_id" integer;
  ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "memberships" ADD CONSTRAINT "memberships_membership_rank_id_membership_rank_configs_id_fk" FOREIGN KEY ("membership_rank_id") REFERENCES "public"."membership_rank_configs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "membership_gifts" ADD CONSTRAINT "membership_gifts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "membership_histories" ADD CONSTRAINT "membership_histories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "membership_histories" ADD CONSTRAINT "membership_histories_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "membership_histories" ADD CONSTRAINT "membership_histories_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "memberships_user_idx" ON "memberships" USING btree ("user_id");
  CREATE INDEX "memberships_membership_rank_idx" ON "memberships" USING btree ("membership_rank_id");
  CREATE INDEX "memberships_updated_at_idx" ON "memberships" USING btree ("updated_at");
  CREATE INDEX "memberships_created_at_idx" ON "memberships" USING btree ("created_at");
  CREATE UNIQUE INDEX "membership_rank_configs_rank_name_idx" ON "membership_rank_configs" USING btree ("rank_name");
  CREATE INDEX "membership_rank_configs_updated_at_idx" ON "membership_rank_configs" USING btree ("updated_at");
  CREATE INDEX "membership_rank_configs_created_at_idx" ON "membership_rank_configs" USING btree ("created_at");
  CREATE INDEX "membership_gifts_user_idx" ON "membership_gifts" USING btree ("user_id");
  CREATE INDEX "membership_gifts_gift_type_idx" ON "membership_gifts" USING btree ("gift_type");
  CREATE INDEX "membership_gifts_expires_at_idx" ON "membership_gifts" USING btree ("expires_at");
  CREATE INDEX "membership_gifts_updated_at_idx" ON "membership_gifts" USING btree ("updated_at");
  CREATE INDEX "membership_gifts_created_at_idx" ON "membership_gifts" USING btree ("created_at");
  CREATE INDEX "membership_histories_user_idx" ON "membership_histories" USING btree ("user_id");
  CREATE INDEX "membership_histories_membership_idx" ON "membership_histories" USING btree ("membership_id");
  CREATE INDEX "membership_histories_order_idx" ON "membership_histories" USING btree ("order_id");
  CREATE INDEX "membership_histories_updated_at_idx" ON "membership_histories" USING btree ("updated_at");
  CREATE INDEX "membership_histories_created_at_idx" ON "membership_histories" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_memberships_fk" FOREIGN KEY ("memberships_id") REFERENCES "public"."memberships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_membership_rank_configs_fk" FOREIGN KEY ("membership_rank_configs_id") REFERENCES "public"."membership_rank_configs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_membership_gifts_fk" FOREIGN KEY ("membership_gifts_id") REFERENCES "public"."membership_gifts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_membership_histories_fk" FOREIGN KEY ("membership_histories_id") REFERENCES "public"."membership_histories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_memberships_id_idx" ON "payload_locked_documents_rels" USING btree ("memberships_id");
  CREATE INDEX "payload_locked_documents_rels_membership_rank_configs_id_idx" ON "payload_locked_documents_rels" USING btree ("membership_rank_configs_id");
  CREATE INDEX "payload_locked_documents_rels_membership_gifts_id_idx" ON "payload_locked_documents_rels" USING btree ("membership_gifts_id");
  CREATE INDEX "payload_locked_documents_rels_membership_histories_id_idx" ON "payload_locked_documents_rels" USING btree ("membership_histories_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "memberships" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "membership_rank_configs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "membership_gifts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "membership_histories" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "memberships" CASCADE;
  DROP TABLE "membership_rank_configs" CASCADE;
  DROP TABLE "membership_gifts" CASCADE;
  DROP TABLE "membership_histories" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_memberships_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_membership_rank_configs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_membership_gifts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_membership_histories_fk";
  
  DROP INDEX "payload_locked_documents_rels_memberships_id_idx";
  DROP INDEX "payload_locked_documents_rels_membership_rank_configs_id_idx";
  DROP INDEX "payload_locked_documents_rels_membership_gifts_id_idx";
  DROP INDEX "payload_locked_documents_rels_membership_histories_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "memberships_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "membership_rank_configs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "membership_gifts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "membership_histories_id";
  DROP TYPE "public"."enum_membership_rank_configs_rank_name";
  DROP TYPE "public"."enum_membership_rank_configs_benefits_ticket_gift";
  DROP TYPE "public"."enum_membership_gifts_gift_type";
  DROP TYPE "public"."enum_membership_gifts_ticket_gift";
  DROP TYPE "public"."enum_membership_histories_type";`)
}
