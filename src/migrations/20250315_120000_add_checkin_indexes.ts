import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    -- Optimized partial index for QR code lookups (booked tickets only) 
    CREATE INDEX CONCURRENTLY IF NOT EXISTS tickets_qr_scan_optimized_idx 
    ON tickets (ticket_code) 
    WHERE status = 'booked';

    -- Optimized partial index for checkin duplicate detection
    CREATE INDEX CONCURRENTLY IF NOT EXISTS checkin_records_duplicate_check_idx 
    ON checkin_records (ticket_code) 
    WHERE deleted_at IS NULL;

    -- Composite index for manual checkin by seat (case-insensitive)
    CREATE INDEX CONCURRENTLY IF NOT EXISTS tickets_seat_manual_checkin_idx 
    ON tickets (UPPER(seat), event_id, event_schedule_id) 
    WHERE status = 'booked';

    -- Index for checkin history queries by admin (performance critical)
    CREATE INDEX CONCURRENTLY IF NOT EXISTS checkin_records_admin_history_idx 
    ON checkin_records (checked_in_by_id, check_in_time DESC) 
    WHERE deleted_at IS NULL;

    -- Covering index for ticket validation (includes all scan data)
    CREATE INDEX CONCURRENTLY IF NOT EXISTS tickets_scan_covering_idx 
    ON tickets (ticket_code, status, event_id, user_id, event_schedule_id, attendee_name, seat) 
    WHERE status = 'booked';
  `)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    DROP INDEX CONCURRENTLY IF EXISTS tickets_qr_scan_optimized_idx;
    DROP INDEX CONCURRENTLY IF EXISTS checkin_records_duplicate_check_idx;
    DROP INDEX CONCURRENTLY IF EXISTS tickets_seat_manual_checkin_idx;
    DROP INDEX CONCURRENTLY IF EXISTS checkin_records_admin_history_idx;
    DROP INDEX CONCURRENTLY IF EXISTS tickets_scan_covering_idx;
  `)
} 