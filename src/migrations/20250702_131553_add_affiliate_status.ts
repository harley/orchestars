import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_affiliate_status" AS ENUM('pending', 'approved', 'rejected');
  ALTER TABLE "users" ADD COLUMN "affiliate_status" "enum_users_affiliate_status" DEFAULT 'pending';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP COLUMN "affiliate_status";
  DROP TYPE "public"."enum_users_affiliate_status";`)
}
