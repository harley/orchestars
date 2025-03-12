import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const result = await db.execute(sql`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'app_information' AND column_name = 'about_us';
  `)

  if ((result as any).length === 0) {
    await db.execute(sql`
      ALTER TABLE "app_information" ADD COLUMN "about_us" jsonb;
    `)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "app_information" DROP COLUMN IF EXISTS "about_us";`)
}
