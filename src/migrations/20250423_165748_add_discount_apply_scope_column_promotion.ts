import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_promotions_discount_apply_scope" AS ENUM('total_order_value', 'per_order_item');
  ALTER TABLE "promotions" ADD COLUMN "discount_apply_scope" "enum_promotions_discount_apply_scope" DEFAULT 'total_order_value';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "promotions" DROP COLUMN IF EXISTS "discount_apply_scope";
  DROP TYPE "public"."enum_promotions_discount_apply_scope";`)
}
