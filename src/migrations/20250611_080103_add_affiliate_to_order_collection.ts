import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" ADD COLUMN "affiliate_affiliate_link_id" integer;
  ALTER TABLE "orders" ADD COLUMN "affiliate_affiliate_code" varchar;
  ALTER TABLE "orders" ADD COLUMN "affiliate_affiliate_user_id" integer;
  DO $$ BEGIN
   ALTER TABLE "orders" ADD CONSTRAINT "orders_affiliate_affiliate_link_id_affiliate_links_id_fk" FOREIGN KEY ("affiliate_affiliate_link_id") REFERENCES "public"."affiliate_links"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "orders" ADD CONSTRAINT "orders_affiliate_affiliate_user_id_users_id_fk" FOREIGN KEY ("affiliate_affiliate_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "orders_affiliate_affiliate_affiliate_link_idx" ON "orders" USING btree ("affiliate_affiliate_link_id");
  CREATE INDEX IF NOT EXISTS "orders_affiliate_affiliate_affiliate_code_idx" ON "orders" USING btree ("affiliate_affiliate_code");
  CREATE INDEX IF NOT EXISTS "orders_affiliate_affiliate_affiliate_user_idx" ON "orders" USING btree ("affiliate_affiliate_user_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" DROP CONSTRAINT "orders_affiliate_affiliate_link_id_affiliate_links_id_fk";
  
  ALTER TABLE "orders" DROP CONSTRAINT "orders_affiliate_affiliate_user_id_users_id_fk";
  
  DROP INDEX IF EXISTS "orders_affiliate_affiliate_affiliate_link_idx";
  DROP INDEX IF EXISTS "orders_affiliate_affiliate_affiliate_code_idx";
  DROP INDEX IF EXISTS "orders_affiliate_affiliate_affiliate_user_idx";
  ALTER TABLE "orders" DROP COLUMN IF EXISTS "affiliate_affiliate_link_id";
  ALTER TABLE "orders" DROP COLUMN IF EXISTS "affiliate_affiliate_code";
  ALTER TABLE "orders" DROP COLUMN IF EXISTS "affiliate_affiliate_user_id";`)
}
