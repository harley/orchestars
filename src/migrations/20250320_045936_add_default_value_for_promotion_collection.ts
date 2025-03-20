import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "promotions" ALTER COLUMN "per_user_limit" SET DEFAULT 1;
  ALTER TABLE "promotions" ALTER COLUMN "per_user_limit" SET NOT NULL;
  ALTER TABLE "user_promotion_redemptions" ALTER COLUMN "status" SET DEFAULT 'pending';
  ALTER TABLE "user_promotion_redemptions" ALTER COLUMN "status" SET NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "promotions" ALTER COLUMN "per_user_limit" DROP DEFAULT;
  ALTER TABLE "promotions" ALTER COLUMN "per_user_limit" DROP NOT NULL;
  ALTER TABLE "user_promotion_redemptions" ALTER COLUMN "status" DROP DEFAULT;
  ALTER TABLE "user_promotion_redemptions" ALTER COLUMN "status" DROP NOT NULL;`)
}
