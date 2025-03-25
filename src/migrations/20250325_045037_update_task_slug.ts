import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // First ensure all existing values match the enum values
  await db.execute(sql`
    UPDATE payload_jobs 
    SET task_slug = 
      CASE 
        WHEN task_slug = 'inline' THEN 'inline'::enum_payload_jobs_task_slug
        WHEN task_slug = 'schedulePublish' THEN 'schedulePublish'::enum_payload_jobs_task_slug
        ELSE NULL 
      END;
  `)

  // Then convert the column type to enum
  await db.execute(sql`
    ALTER TABLE payload_jobs 
    ALTER COLUMN task_slug TYPE enum_payload_jobs_task_slug 
    USING task_slug::enum_payload_jobs_task_slug;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Convert the column back to text type
  await db.execute(sql`
    ALTER TABLE payload_jobs 
    ALTER COLUMN task_slug TYPE text;
  `)
}
