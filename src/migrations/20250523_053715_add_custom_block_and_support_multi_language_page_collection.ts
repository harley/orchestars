import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_cards_block_sections_cards_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_cards_block_sections_cards_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_cards_block_sections_cards_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_cards_block_sections_cards_link_appearance" AS ENUM('default', 'outline');
  CREATE TABLE IF NOT EXISTS "pages_blocks_cards_block_sections_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_cards_block_sections_cards_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum_pages_blocks_cards_block_sections_cards_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_cards_block_sections_cards_locales" (
  	"title" varchar,
  	"description" varchar,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_cards_block_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_cards_block_sections_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_cards_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_card_detail_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"banner_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_card_detail_block_locales" (
  	"title" varchar,
  	"category" varchar,
  	"intro_content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "pages_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_cards_block_sections_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_cards_block_sections_cards_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum__pages_v_blocks_cards_block_sections_cards_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_cards_block_sections_cards_locales" (
  	"title" varchar,
  	"description" varchar,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_cards_block_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_cards_block_sections_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_cards_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_card_detail_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"banner_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_card_detail_block_locales" (
  	"title" varchar,
  	"category" varchar,
  	"intro_content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_version_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "pages_blocks_content_columns_locales" ADD COLUMN "rich_text" jsonb;
  ALTER TABLE "pages" ADD COLUMN "banner_id" integer;
  ALTER TABLE "pages" ADD COLUMN "parent_id" integer;
  ALTER TABLE "pages_locales" ADD COLUMN "title" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "description" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "hero_rich_text" jsonb;
  ALTER TABLE "_pages_v_blocks_content_columns_locales" ADD COLUMN "rich_text" jsonb;
  ALTER TABLE "_pages_v" ADD COLUMN "version_banner_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_parent_id" integer;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_title" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_description" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_hero_rich_text" jsonb;
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_cards_block_sections_cards" ADD CONSTRAINT "pages_blocks_cards_block_sections_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_cards_block_sections_cards" ADD CONSTRAINT "pages_blocks_cards_block_sections_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cards_block_sections"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_cards_block_sections_cards_locales" ADD CONSTRAINT "pages_blocks_cards_block_sections_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cards_block_sections_cards"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_cards_block_sections" ADD CONSTRAINT "pages_blocks_cards_block_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cards_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_cards_block_sections_locales" ADD CONSTRAINT "pages_blocks_cards_block_sections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cards_block_sections"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_cards_block" ADD CONSTRAINT "pages_blocks_cards_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_card_detail_block" ADD CONSTRAINT "pages_blocks_card_detail_block_banner_id_media_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_card_detail_block" ADD CONSTRAINT "pages_blocks_card_detail_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_card_detail_block_locales" ADD CONSTRAINT "pages_blocks_card_detail_block_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_card_detail_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_breadcrumbs" ADD CONSTRAINT "pages_breadcrumbs_doc_id_pages_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_breadcrumbs" ADD CONSTRAINT "pages_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_cards_block_sections_cards" ADD CONSTRAINT "_pages_v_blocks_cards_block_sections_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_cards_block_sections_cards" ADD CONSTRAINT "_pages_v_blocks_cards_block_sections_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cards_block_sections"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_cards_block_sections_cards_locales" ADD CONSTRAINT "_pages_v_blocks_cards_block_sections_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cards_block_sections_cards"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_cards_block_sections" ADD CONSTRAINT "_pages_v_blocks_cards_block_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cards_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_cards_block_sections_locales" ADD CONSTRAINT "_pages_v_blocks_cards_block_sections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cards_block_sections"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_cards_block" ADD CONSTRAINT "_pages_v_blocks_cards_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_card_detail_block" ADD CONSTRAINT "_pages_v_blocks_card_detail_block_banner_id_media_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_card_detail_block" ADD CONSTRAINT "_pages_v_blocks_card_detail_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_card_detail_block_locales" ADD CONSTRAINT "_pages_v_blocks_card_detail_block_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_card_detail_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_version_breadcrumbs" ADD CONSTRAINT "_pages_v_version_breadcrumbs_doc_id_pages_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_version_breadcrumbs" ADD CONSTRAINT "_pages_v_version_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "pages_blocks_cards_block_sections_cards_order_idx" ON "pages_blocks_cards_block_sections_cards" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_cards_block_sections_cards_parent_id_idx" ON "pages_blocks_cards_block_sections_cards" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_cards_block_sections_cards_image_idx" ON "pages_blocks_cards_block_sections_cards" USING btree ("image_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "pages_blocks_cards_block_sections_cards_locales_locale_parent_id_unique" ON "pages_blocks_cards_block_sections_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_cards_block_sections_order_idx" ON "pages_blocks_cards_block_sections" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_cards_block_sections_parent_id_idx" ON "pages_blocks_cards_block_sections" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "pages_blocks_cards_block_sections_locales_locale_parent_id_unique" ON "pages_blocks_cards_block_sections_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_cards_block_order_idx" ON "pages_blocks_cards_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_cards_block_parent_id_idx" ON "pages_blocks_cards_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_cards_block_path_idx" ON "pages_blocks_cards_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_blocks_card_detail_block_order_idx" ON "pages_blocks_card_detail_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_card_detail_block_parent_id_idx" ON "pages_blocks_card_detail_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_card_detail_block_path_idx" ON "pages_blocks_card_detail_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_blocks_card_detail_block_banner_idx" ON "pages_blocks_card_detail_block" USING btree ("banner_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "pages_blocks_card_detail_block_locales_locale_parent_id_unique" ON "pages_blocks_card_detail_block_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_breadcrumbs_order_idx" ON "pages_breadcrumbs" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_breadcrumbs_parent_id_idx" ON "pages_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_breadcrumbs_locale_idx" ON "pages_breadcrumbs" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "pages_breadcrumbs_doc_idx" ON "pages_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_cards_block_sections_cards_order_idx" ON "_pages_v_blocks_cards_block_sections_cards" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_cards_block_sections_cards_parent_id_idx" ON "_pages_v_blocks_cards_block_sections_cards" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_cards_block_sections_cards_image_idx" ON "_pages_v_blocks_cards_block_sections_cards" USING btree ("image_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "_pages_v_blocks_cards_block_sections_cards_locales_locale_parent_id_unique" ON "_pages_v_blocks_cards_block_sections_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_cards_block_sections_order_idx" ON "_pages_v_blocks_cards_block_sections" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_cards_block_sections_parent_id_idx" ON "_pages_v_blocks_cards_block_sections" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "_pages_v_blocks_cards_block_sections_locales_locale_parent_id_unique" ON "_pages_v_blocks_cards_block_sections_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_cards_block_order_idx" ON "_pages_v_blocks_cards_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_cards_block_parent_id_idx" ON "_pages_v_blocks_cards_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_cards_block_path_idx" ON "_pages_v_blocks_cards_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_card_detail_block_order_idx" ON "_pages_v_blocks_card_detail_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_card_detail_block_parent_id_idx" ON "_pages_v_blocks_card_detail_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_card_detail_block_path_idx" ON "_pages_v_blocks_card_detail_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_card_detail_block_banner_idx" ON "_pages_v_blocks_card_detail_block" USING btree ("banner_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "_pages_v_blocks_card_detail_block_locales_locale_parent_id_unique" ON "_pages_v_blocks_card_detail_block_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_breadcrumbs_order_idx" ON "_pages_v_version_breadcrumbs" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_breadcrumbs_parent_id_idx" ON "_pages_v_version_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_breadcrumbs_locale_idx" ON "_pages_v_version_breadcrumbs" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_breadcrumbs_doc_idx" ON "_pages_v_version_breadcrumbs" USING btree ("doc_id");
  DO $$ BEGIN
   ALTER TABLE "pages" ADD CONSTRAINT "pages_banner_id_media_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_banner_id_media_id_fk" FOREIGN KEY ("version_banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_parent_id_pages_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "pages_banner_idx" ON "pages" USING btree ("banner_id");
  CREATE INDEX IF NOT EXISTS "pages_parent_idx" ON "pages" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_version_banner_idx" ON "_pages_v" USING btree ("version_banner_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_version_parent_idx" ON "_pages_v" USING btree ("version_parent_id");
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "rich_text";
  ALTER TABLE "pages" DROP COLUMN IF EXISTS "title";
  ALTER TABLE "pages" DROP COLUMN IF EXISTS "hero_rich_text";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "rich_text";
  ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_title";
  ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_hero_rich_text";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cards_block_sections_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cards_block_sections_cards_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cards_block_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cards_block_sections_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cards_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_card_detail_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_card_detail_block_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_breadcrumbs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cards_block_sections_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cards_block_sections_cards_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cards_block_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cards_block_sections_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cards_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_card_detail_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_card_detail_block_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_breadcrumbs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_cards_block_sections_cards" CASCADE;
  DROP TABLE "pages_blocks_cards_block_sections_cards_locales" CASCADE;
  DROP TABLE "pages_blocks_cards_block_sections" CASCADE;
  DROP TABLE "pages_blocks_cards_block_sections_locales" CASCADE;
  DROP TABLE "pages_blocks_cards_block" CASCADE;
  DROP TABLE "pages_blocks_card_detail_block" CASCADE;
  DROP TABLE "pages_blocks_card_detail_block_locales" CASCADE;
  DROP TABLE "pages_breadcrumbs" CASCADE;
  DROP TABLE "_pages_v_blocks_cards_block_sections_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_cards_block_sections_cards_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_cards_block_sections" CASCADE;
  DROP TABLE "_pages_v_blocks_cards_block_sections_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_cards_block" CASCADE;
  DROP TABLE "_pages_v_blocks_card_detail_block" CASCADE;
  DROP TABLE "_pages_v_blocks_card_detail_block_locales" CASCADE;
  DROP TABLE "_pages_v_version_breadcrumbs" CASCADE;
  ALTER TABLE "pages" DROP CONSTRAINT "pages_banner_id_media_id_fk";
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_parent_id_pages_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_banner_id_media_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_parent_id_pages_id_fk";
  
  DROP INDEX IF EXISTS "pages_banner_idx";
  DROP INDEX IF EXISTS "pages_parent_idx";
  DROP INDEX IF EXISTS "_pages_v_version_version_banner_idx";
  DROP INDEX IF EXISTS "_pages_v_version_version_parent_idx";
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "rich_text" jsonb;
  ALTER TABLE "pages" ADD COLUMN "title" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_rich_text" jsonb;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "rich_text" jsonb;
  ALTER TABLE "_pages_v" ADD COLUMN "version_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_rich_text" jsonb;
  ALTER TABLE "pages_blocks_content_columns_locales" DROP COLUMN IF EXISTS "rich_text";
  ALTER TABLE "pages" DROP COLUMN IF EXISTS "banner_id";
  ALTER TABLE "pages" DROP COLUMN IF EXISTS "parent_id";
  ALTER TABLE "pages_locales" DROP COLUMN IF EXISTS "title";
  ALTER TABLE "pages_locales" DROP COLUMN IF EXISTS "description";
  ALTER TABLE "pages_locales" DROP COLUMN IF EXISTS "hero_rich_text";
  ALTER TABLE "_pages_v_blocks_content_columns_locales" DROP COLUMN IF EXISTS "rich_text";
  ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_banner_id";
  ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_parent_id";
  ALTER TABLE "_pages_v_locales" DROP COLUMN IF EXISTS "version_title";
  ALTER TABLE "_pages_v_locales" DROP COLUMN IF EXISTS "version_description";
  ALTER TABLE "_pages_v_locales" DROP COLUMN IF EXISTS "version_hero_rich_text";
  DROP TYPE "public"."enum_pages_blocks_cards_block_sections_cards_link_type";
  DROP TYPE "public"."enum_pages_blocks_cards_block_sections_cards_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_cards_block_sections_cards_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_cards_block_sections_cards_link_appearance";`)
}
