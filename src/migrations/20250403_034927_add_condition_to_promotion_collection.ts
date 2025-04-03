import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "promotions" ADD COLUMN "conditions_is_apply_condition" boolean;
  ALTER TABLE "promotions" ADD COLUMN "conditions_min_tickets" numeric;
  ALTER TABLE "promotions" ADD COLUMN "is_private" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "promotions" DROP COLUMN IF EXISTS "conditions_is_apply_condition";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "conditions_min_tickets";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "is_private";`)
}
