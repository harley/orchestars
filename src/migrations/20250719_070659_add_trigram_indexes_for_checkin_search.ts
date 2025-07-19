import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_users_email_gin ON users USING gin(email gin_trgm_ops);
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_users_phone_number_gin ON users USING gin(phone_number gin_trgm_ops);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS idx_users_email_gin;
  `)

  await db.execute(sql`
    DROP INDEX IF EXISTS idx_users_phone_number_gin;
  `)

  // The pg_trgm extension is not dropped automatically in case it is used elsewhere.
} 