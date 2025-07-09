import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "affiliate_links" ADD COLUMN "slug" varchar;
  CREATE INDEX "affiliate_links_slug_idx" ON "affiliate_links" USING btree ("slug");
  CREATE INDEX "slug_status_idx" ON "affiliate_links" USING btree ("slug","status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "affiliate_links_slug_idx";
  DROP INDEX "slug_status_idx";
  ALTER TABLE "affiliate_links" DROP COLUMN "slug";`)
}
