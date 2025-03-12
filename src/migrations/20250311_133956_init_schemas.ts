import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'super-admin', 'customer');
  CREATE TYPE "public"."enum_events_ticket_quantity_limitation" AS ENUM('perTicketType', 'perEvent');
  CREATE TYPE "public"."enum_payments_status" AS ENUM('processing', 'canceled', 'paid', 'failed');
  CREATE TYPE "public"."enum_partners_status" AS ENUM('active', 'inactive');
  CREATE TYPE "public"."enum_performers_status" AS ENUM('active', 'inactive');
  CREATE TYPE "public"."enum_faqs_status" AS ENUM('active', 'inactive');
  CREATE TABLE IF NOT EXISTS "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"username" varchar,
  	"first_name" varchar,
  	"last_name" varchar,
  	"role" "enum_users_role",
  	"last_active" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE IF NOT EXISTS "seating_charts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"chart_map" jsonb NOT NULL,
  	"event_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "events_schedules_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"time" varchar,
  	"name" varchar,
  	"description" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "events_schedules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "events_ticket_prices" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" numeric,
  	"currency" varchar DEFAULT 'VND'
  );
  
  CREATE TABLE IF NOT EXISTS "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"keyword" varchar,
  	"start_datetime" timestamp(3) with time zone,
  	"end_datetime" timestamp(3) with time zone,
  	"show_after_expiration" boolean,
  	"show_tickets_automatically" boolean,
  	"event_location" varchar,
  	"event_terms_and_conditions" varchar,
  	"event_logo_id" integer,
  	"event_banner_id" integer,
  	"sponsor_logo_id" integer,
  	"ticket_quantity_limitation" "enum_events_ticket_quantity_limitation",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_code" varchar,
  	"user_id" integer,
  	"status" varchar,
  	"total" numeric,
  	"currency" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "order_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_id" integer NOT NULL,
  	"event_id" integer NOT NULL,
  	"ticket_price_id" varchar NOT NULL,
  	"quantity" numeric NOT NULL,
  	"price" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"order_id" integer NOT NULL,
  	"payment_method" varchar,
  	"currency" varchar,
  	"total" numeric NOT NULL,
  	"app_trans_id" varchar,
  	"payment_data" jsonb,
  	"status" "enum_payments_status" NOT NULL,
  	"paid_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "tickets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"attendee_name" varchar,
  	"user_id" integer,
  	"ticket_code" varchar,
  	"ticket_price_info" jsonb,
  	"event_id" integer,
  	"order_item_id" integer,
  	"order_status" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "app_information_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"link" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "app_information" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer,
  	"description" varchar,
  	"address" varchar,
  	"email" varchar,
  	"phone_number" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "partners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer,
  	"description" varchar,
  	"status" "enum_partners_status" DEFAULT 'active',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "performers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"avatar_id" integer,
  	"genre" varchar,
  	"role" varchar,
  	"description" varchar,
  	"status" "enum_performers_status" DEFAULT 'active',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"status" "enum_faqs_status" DEFAULT 'active',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"seating_charts_id" integer,
  	"events_id" integer,
  	"orders_id" integer,
  	"order_items_id" integer,
  	"payments_id" integer,
  	"tickets_id" integer,
  	"app_information_id" integer,
  	"partners_id" integer,
  	"performers_id" integer,
  	"faqs_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  DO $$ BEGIN
   ALTER TABLE "seating_charts" ADD CONSTRAINT "seating_charts_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events_schedules_details" ADD CONSTRAINT "events_schedules_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_schedules"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events_schedules" ADD CONSTRAINT "events_schedules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events_ticket_prices" ADD CONSTRAINT "events_ticket_prices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events" ADD CONSTRAINT "events_event_logo_id_media_id_fk" FOREIGN KEY ("event_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events" ADD CONSTRAINT "events_event_banner_id_media_id_fk" FOREIGN KEY ("event_banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events" ADD CONSTRAINT "events_sponsor_logo_id_media_id_fk" FOREIGN KEY ("sponsor_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "order_items" ADD CONSTRAINT "order_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "tickets" ADD CONSTRAINT "tickets_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "tickets" ADD CONSTRAINT "tickets_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "app_information_socials" ADD CONSTRAINT "app_information_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."app_information"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "app_information" ADD CONSTRAINT "app_information_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "partners" ADD CONSTRAINT "partners_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "performers" ADD CONSTRAINT "performers_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_seating_charts_fk" FOREIGN KEY ("seating_charts_id") REFERENCES "public"."seating_charts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_order_items_fk" FOREIGN KEY ("order_items_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payments_fk" FOREIGN KEY ("payments_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tickets_fk" FOREIGN KEY ("tickets_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_app_information_fk" FOREIGN KEY ("app_information_id") REFERENCES "public"."app_information"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_performers_fk" FOREIGN KEY ("performers_id") REFERENCES "public"."performers"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX IF NOT EXISTS "seating_charts_event_idx" ON "seating_charts" USING btree ("event_id");
  CREATE INDEX IF NOT EXISTS "seating_charts_updated_at_idx" ON "seating_charts" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "seating_charts_created_at_idx" ON "seating_charts" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "events_schedules_details_order_idx" ON "events_schedules_details" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "events_schedules_details_parent_id_idx" ON "events_schedules_details" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "events_schedules_order_idx" ON "events_schedules" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "events_schedules_parent_id_idx" ON "events_schedules" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "events_ticket_prices_order_idx" ON "events_ticket_prices" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "events_ticket_prices_parent_id_idx" ON "events_ticket_prices" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "events_event_logo_idx" ON "events" USING btree ("event_logo_id");
  CREATE INDEX IF NOT EXISTS "events_event_banner_idx" ON "events" USING btree ("event_banner_id");
  CREATE INDEX IF NOT EXISTS "events_sponsor_logo_idx" ON "events" USING btree ("sponsor_logo_id");
  CREATE INDEX IF NOT EXISTS "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "orders_user_idx" ON "orders" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "order_items_order_idx" ON "order_items" USING btree ("order_id");
  CREATE INDEX IF NOT EXISTS "order_items_event_idx" ON "order_items" USING btree ("event_id");
  CREATE INDEX IF NOT EXISTS "order_items_updated_at_idx" ON "order_items" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "order_items_created_at_idx" ON "order_items" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payments_user_idx" ON "payments" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "payments_order_idx" ON "payments" USING btree ("order_id");
  CREATE INDEX IF NOT EXISTS "payments_updated_at_idx" ON "payments" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payments_created_at_idx" ON "payments" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "tickets_user_idx" ON "tickets" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "tickets_event_idx" ON "tickets" USING btree ("event_id");
  CREATE INDEX IF NOT EXISTS "tickets_order_item_idx" ON "tickets" USING btree ("order_item_id");
  CREATE INDEX IF NOT EXISTS "tickets_updated_at_idx" ON "tickets" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "tickets_created_at_idx" ON "tickets" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "app_information_socials_order_idx" ON "app_information_socials" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "app_information_socials_parent_id_idx" ON "app_information_socials" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "app_information_logo_idx" ON "app_information" USING btree ("logo_id");
  CREATE INDEX IF NOT EXISTS "app_information_updated_at_idx" ON "app_information" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "app_information_created_at_idx" ON "app_information" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "partners_logo_idx" ON "partners" USING btree ("logo_id");
  CREATE INDEX IF NOT EXISTS "partners_updated_at_idx" ON "partners" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "partners_created_at_idx" ON "partners" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "performers_avatar_idx" ON "performers" USING btree ("avatar_id");
  CREATE INDEX IF NOT EXISTS "performers_updated_at_idx" ON "performers" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "performers_created_at_idx" ON "performers" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_seating_charts_id_idx" ON "payload_locked_documents_rels" USING btree ("seating_charts_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_items_id_idx" ON "payload_locked_documents_rels" USING btree ("order_items_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_payments_id_idx" ON "payload_locked_documents_rels" USING btree ("payments_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_tickets_id_idx" ON "payload_locked_documents_rels" USING btree ("tickets_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_app_information_id_idx" ON "payload_locked_documents_rels" USING btree ("app_information_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_partners_id_idx" ON "payload_locked_documents_rels" USING btree ("partners_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_performers_id_idx" ON "payload_locked_documents_rels" USING btree ("performers_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX IF NOT EXISTS "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "seating_charts" CASCADE;
  DROP TABLE "events_schedules_details" CASCADE;
  DROP TABLE "events_schedules" CASCADE;
  DROP TABLE "events_ticket_prices" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "order_items" CASCADE;
  DROP TABLE "payments" CASCADE;
  DROP TABLE "tickets" CASCADE;
  DROP TABLE "app_information_socials" CASCADE;
  DROP TABLE "app_information" CASCADE;
  DROP TABLE "partners" CASCADE;
  DROP TABLE "performers" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_events_ticket_quantity_limitation";
  DROP TYPE "public"."enum_payments_status";
  DROP TYPE "public"."enum_partners_status";
  DROP TYPE "public"."enum_performers_status";
  DROP TYPE "public"."enum_faqs_status";`)
}
