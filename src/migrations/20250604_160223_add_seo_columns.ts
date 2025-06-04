import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "header" ADD COLUMN "seo_image_id" integer;
  ALTER TABLE "header_locales" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "header_locales" ADD COLUMN "seo_description" varchar;
  DO $$ BEGIN
   ALTER TABLE "header" ADD CONSTRAINT "header_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "header_seo_seo_image_idx" ON "header" USING btree ("seo_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "header" DROP CONSTRAINT "header_seo_image_id_media_id_fk";
  
  DROP INDEX IF EXISTS "header_seo_seo_image_idx";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "seo_image_id";
  ALTER TABLE "header_locales" DROP COLUMN IF EXISTS "seo_title";
  ALTER TABLE "header_locales" DROP COLUMN IF EXISTS "seo_description";`)
}
