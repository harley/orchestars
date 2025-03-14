import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_orders_status') THEN
        CREATE TYPE "public"."enum_orders_status" AS ENUM ('processing', 'canceled', 'completed', 'failed');
      END IF;
    END $$;

    ALTER TABLE "orders" 
    ALTER COLUMN "status" TYPE enum_orders_status 
    USING status::enum_orders_status;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE orders 
  ALTER COLUMN status TYPE TEXT;
  DROP TYPE IF EXISTS "public"."enum_orders_status";`)
}
