import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" ADD COLUMN "note" varchar;
  ALTER TABLE "orders" ADD COLUMN "created_by_admin_id" integer;
  DO $$ BEGIN
   ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_admin_id_admins_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "orders_created_by_admin_idx" ON "orders" USING btree ("created_by_admin_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" DROP CONSTRAINT "orders_created_by_admin_id_admins_id_fk";
  
  DROP INDEX IF EXISTS "orders_created_by_admin_idx";
  ALTER TABLE "orders" DROP COLUMN IF EXISTS "note";
  ALTER TABLE "orders" DROP COLUMN IF EXISTS "created_by_admin_id";`)
}
