import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "affiliate_settings_promotions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"promotion_id" integer NOT NULL
  );
  
  DO $$ BEGIN
   ALTER TABLE "affiliate_settings_promotions" ADD CONSTRAINT "affiliate_settings_promotions_promotion_id_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "affiliate_settings_promotions" ADD CONSTRAINT "affiliate_settings_promotions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."affiliate_settings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "affiliate_settings_promotions_order_idx" ON "affiliate_settings_promotions" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "affiliate_settings_promotions_parent_id_idx" ON "affiliate_settings_promotions" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "affiliate_settings_promotions_promotion_idx" ON "affiliate_settings_promotions" USING btree ("promotion_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "affiliate_settings_promotions" CASCADE;`)
}
