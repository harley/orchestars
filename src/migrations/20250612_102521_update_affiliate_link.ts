import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "affiliate_links" ADD COLUMN "affiliate_promotion_id" integer;
  ALTER TABLE "affiliate_links" ADD COLUMN "utm_params_source" varchar;
  ALTER TABLE "affiliate_links" ADD COLUMN "utm_params_medium" varchar;
  ALTER TABLE "affiliate_links" ADD COLUMN "utm_params_campaign" varchar;
  ALTER TABLE "affiliate_links" ADD COLUMN "utm_params_term" varchar;
  ALTER TABLE "affiliate_links" ADD COLUMN "utm_params_content" varchar;
  DO $$ BEGIN
   ALTER TABLE "affiliate_links" ADD CONSTRAINT "affiliate_links_affiliate_promotion_id_promotions_id_fk" FOREIGN KEY ("affiliate_promotion_id") REFERENCES "public"."promotions"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "affiliate_links_affiliate_promotion_idx" ON "affiliate_links" USING btree ("affiliate_promotion_id");
  ALTER TABLE "affiliate_links" DROP COLUMN IF EXISTS "utm_params";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "affiliate_links" DROP CONSTRAINT "affiliate_links_affiliate_promotion_id_promotions_id_fk";
  
  DROP INDEX IF EXISTS "affiliate_links_affiliate_promotion_idx";
  ALTER TABLE "affiliate_links" ADD COLUMN "utm_params" jsonb;
  ALTER TABLE "affiliate_links" DROP COLUMN IF EXISTS "affiliate_promotion_id";
  ALTER TABLE "affiliate_links" DROP COLUMN IF EXISTS "utm_params_source";
  ALTER TABLE "affiliate_links" DROP COLUMN IF EXISTS "utm_params_medium";
  ALTER TABLE "affiliate_links" DROP COLUMN IF EXISTS "utm_params_campaign";
  ALTER TABLE "affiliate_links" DROP COLUMN IF EXISTS "utm_params_term";
  ALTER TABLE "affiliate_links" DROP COLUMN IF EXISTS "utm_params_content";`)
}
