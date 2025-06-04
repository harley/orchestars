import { BasePayload } from 'payload'
import { subMinutes } from 'date-fns'
import { PAYMENT_STATUS } from '../constants'
import { ORDER_STATUS } from '@/collections/Orders/constants'
import { TICKET_STATUS } from '@/collections/Tickets/constants'

// Add debounce tracking
let lastRunTime = 0
const DEBOUNCE_INTERVAL = 10000 // 10s

export const updatePaymentStatus = async ({ payload }: { payload: BasePayload }) => {
  try {
    const now = Date.now()

    if (now - lastRunTime < DEBOUNCE_INTERVAL) {
      return
    }
    lastRunTime = now
    const last30minutes = subMinutes(new Date(), 30).toISOString()
    console.log(
      'Running update payment status: processing payments that expired after 30 minutes will be updated to cancel',
    )

    await payload.db.drizzle.execute(`
        DO $$ 
        DECLARE 
        error_occurred BOOLEAN := FALSE;
        BEGIN
        BEGIN
            -- Create a temporary table to store expired order IDs, auto-drop on commit
            CREATE TEMP TABLE temp_expired_orders ON COMMIT DROP AS
            SELECT order_id 
            FROM payments
            WHERE status = '${PAYMENT_STATUS.processing.value}' 
            AND expire_at < '${last30minutes}';


            -- Update payments table
            UPDATE payments
            SET 
            status = '${PAYMENT_STATUS.canceled.value}',
            updated_at = NOW()
            WHERE order_id IN (SELECT order_id FROM temp_expired_orders);

            -- Update orders table
            UPDATE orders
            SET 
            status = '${ORDER_STATUS.canceled.value}',
            updated_at = NOW()
            WHERE id IN (SELECT order_id FROM temp_expired_orders);

            -- Update tickets table
            UPDATE tickets
            SET 
            status = '${TICKET_STATUS.cancelled.value}',
            updated_at = NOW()
            WHERE order_id IN (SELECT order_id FROM temp_expired_orders);

            -- Log success message
            RAISE NOTICE 'Transaction completed successfully: payments, orders, and tickets updated.';

        EXCEPTION
            WHEN OTHERS THEN
            error_occurred := TRUE;
            RAISE NOTICE 'Transaction failed: %, rolling back changes.', SQLERRM;
            ROLLBACK; -- Rollback the entire transaction
        END;

        -- If there was an error, raise an exception to notify
        IF error_occurred THEN
            RAISE EXCEPTION 'Rollback executed due to an error.';
        END IF;

        END $$;

      `)
  } catch (error) {
    console.log('Error while updating payment status', error)
  }
}
