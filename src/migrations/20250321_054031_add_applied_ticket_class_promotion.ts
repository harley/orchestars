import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "promotions_applied_ticket_classes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ticket_class" varchar NOT NULL
  );
  
  DO $$ BEGIN
   ALTER TABLE "promotions_applied_ticket_classes" ADD CONSTRAINT "promotions_applied_ticket_classes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "promotions_applied_ticket_classes_order_idx" ON "promotions_applied_ticket_classes" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "promotions_applied_ticket_classes_parent_id_idx" ON "promotions_applied_ticket_classes" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "promotions_applied_ticket_classes" CASCADE;`)
}
