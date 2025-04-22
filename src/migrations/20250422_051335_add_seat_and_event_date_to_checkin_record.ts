import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "checkin_records" ADD COLUMN "seat" varchar;
    ALTER TABLE "checkin_records" ADD COLUMN "event_date" varchar;
  `);

  await db.execute(sql`
    UPDATE "checkin_records" cr
    SET
      "seat" = t."seat"
    FROM "tickets" t
    WHERE cr.ticket_id = t.id
      AND cr.seat IS NULL
      AND t."seat" IS NOT NULL;
  `);

  // Now that existing records have been updated, make the 'seat' column NOT NULL
  await db.execute(sql`
    ALTER TABLE "checkin_records" ALTER COLUMN "seat" SET NOT NULL;
  `);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "checkin_records" DROP COLUMN IF EXISTS "seat";
    ALTER TABLE "checkin_records" DROP COLUMN IF EXISTS "event_date";
  `);
}