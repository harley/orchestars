import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "performers_locales" ADD COLUMN "name" varchar NOT NULL;
  ALTER TABLE "performers" DROP COLUMN IF EXISTS "name";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "performers" ADD COLUMN "name" varchar NOT NULL;
  ALTER TABLE "performers_locales" DROP COLUMN IF EXISTS "name";`)
}
