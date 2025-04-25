import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE INDEX IF NOT EXISTS "checkin_records_seat_idx" ON "checkin_records" USING btree ("seat");
  CREATE INDEX IF NOT EXISTS "checkin_records_ticket_code_idx" ON "checkin_records" USING btree ("ticket_code");
  CREATE INDEX IF NOT EXISTS "checkin_records_event_schedule_id_idx" ON "checkin_records" USING btree ("event_schedule_id");
  CREATE INDEX IF NOT EXISTS "ticketCode_seat_idx" ON "checkin_records" USING btree ("ticket_code","seat");
  CREATE INDEX IF NOT EXISTS "event_eventScheduleId_idx" ON "checkin_records" USING btree ("event_id","event_schedule_id");
  CREATE INDEX IF NOT EXISTS "ticketCode_seat_eventScheduleId_idx" ON "checkin_records" USING btree ("ticket_code","seat","event_schedule_id");
  CREATE INDEX IF NOT EXISTS "ticketCode_eventScheduleId_event_idx" ON "checkin_records" USING btree ("ticket_code","event_schedule_id","event_id");
  CREATE INDEX IF NOT EXISTS "ticketCode_seat_eventScheduleId_event_idx" ON "checkin_records" USING btree ("ticket_code","seat","event_schedule_id","event_id");
  CREATE INDEX IF NOT EXISTS "ticketCode_seat_event_eventScheduleId_status_idx" ON "tickets" USING btree ("ticket_code","seat","event_id","event_schedule_id","status");
  CREATE INDEX IF NOT EXISTS "ticketCode_event_eventScheduleId_status_idx" ON "tickets" USING btree ("ticket_code","event_id","event_schedule_id","status");
  CREATE INDEX IF NOT EXISTS "seat_event_eventScheduleId_status_idx" ON "tickets" USING btree ("seat","event_id","event_schedule_id","status");
  CREATE INDEX IF NOT EXISTS "event_eventScheduleId_1_idx" ON "tickets" USING btree ("event_id","event_schedule_id");
  CREATE INDEX IF NOT EXISTS "ticketCode_status_idx" ON "tickets" USING btree ("ticket_code","status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "checkin_records_seat_idx";
  DROP INDEX IF EXISTS "checkin_records_ticket_code_idx";
  DROP INDEX IF EXISTS "checkin_records_event_schedule_id_idx";
  DROP INDEX IF EXISTS "ticketCode_seat_idx";
  DROP INDEX IF EXISTS "event_eventScheduleId_idx";
  DROP INDEX IF EXISTS "ticketCode_seat_eventScheduleId_idx";
  DROP INDEX IF EXISTS "ticketCode_eventScheduleId_event_idx";
  DROP INDEX IF EXISTS "ticketCode_seat_eventScheduleId_event_idx";
  DROP INDEX IF EXISTS "ticketCode_seat_event_eventScheduleId_status_idx";
  DROP INDEX IF EXISTS "ticketCode_event_eventScheduleId_status_idx";
  DROP INDEX IF EXISTS "seat_event_eventScheduleId_status_idx";
  DROP INDEX IF EXISTS "event_eventScheduleId_1_idx";
  DROP INDEX IF EXISTS "ticketCode_status_idx";`)
}
