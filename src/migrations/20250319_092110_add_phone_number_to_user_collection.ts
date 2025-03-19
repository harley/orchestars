import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "users_phone_numbers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"phone" varchar,
  	"created_at" timestamp(3) with time zone,
  	"is_using" boolean
  );
  
  ALTER TABLE "users" ADD COLUMN "phone_number" varchar;
  DO $$ BEGIN
   ALTER TABLE "users_phone_numbers" ADD CONSTRAINT "users_phone_numbers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "users_phone_numbers_order_idx" ON "users_phone_numbers" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "users_phone_numbers_parent_id_idx" ON "users_phone_numbers" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_phone_numbers" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_phone_numbers" CASCADE;
  ALTER TABLE "users" DROP COLUMN IF EXISTS "phone_number";`)
}
