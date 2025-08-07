import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_event_affiliate_user_ranks_status" ADD VALUE 'completed';
  ALTER TABLE "event_affiliate_user_ranks" DROP COLUMN "is_completed";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "event_affiliate_user_ranks" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "event_affiliate_user_ranks" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_event_affiliate_user_ranks_status";
  CREATE TYPE "public"."enum_event_affiliate_user_ranks_status" AS ENUM('draft', 'active', 'disabled');
  ALTER TABLE "event_affiliate_user_ranks" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."enum_event_affiliate_user_ranks_status";
  ALTER TABLE "event_affiliate_user_ranks" ALTER COLUMN "status" SET DATA TYPE "public"."enum_event_affiliate_user_ranks_status" USING "status"::"public"."enum_event_affiliate_user_ranks_status";
  ALTER TABLE "event_affiliate_user_ranks" ADD COLUMN "is_completed" boolean DEFAULT false;`)
}
