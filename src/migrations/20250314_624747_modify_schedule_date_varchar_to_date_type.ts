import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

const TABLE_NAME = 'events_schedules' // Replace with your actual table name
const COLUMN_NAME = 'date'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  console.log(`Checking if table '${TABLE_NAME}' and column '${COLUMN_NAME}' exist...`)

  // Check if table exists
  const tableExists = await db.execute(sql`
    SELECT to_regclass(${TABLE_NAME}) IS NOT NULL AS exists;
  `)

  const fields = tableExists?.fields

  if (!fields?.length) {
    return
  }

  const columnType = await db.execute(sql`
    SELECT data_type FROM information_schema.columns
    WHERE table_name = ${TABLE_NAME}  AND column_name = ${COLUMN_NAME};
  `)

  const dataType = (columnType.rows?.[0]?.data_type as string) || ''

  if (dataType.toLowerCase() === 'character varying') {
    await db.execute(sql`
    ALTER TABLE "events_schedules"
    ALTER COLUMN "date"
    TYPE TIMESTAMP(3)
    USING "date"::TIMESTAMP(3);
  `)

    console.log(`Successfully updated 'date' column to TIMESTAMP(3) in '${TABLE_NAME}'.`)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  console.log(`Reverting 'date' column type back to TEXT...`)

  await db.execute(sql`
    ALTER TABLE "events_schedules" ALTER COLUMN "date" SET DATA TYPE varchar;
  `)

  console.log(`Successfully reverted 'date' column to TEXT.`)
}
