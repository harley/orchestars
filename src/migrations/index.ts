import * as migration_20250311_133956_init_schemas from './20250311_133956_init_schemas';
import * as migration_20250312_005922_add_about_us_column from './20250312_005922_add_about_us_column';
import * as migration_20250312_064605_ignore_order_status_in_tickets_collection from './20250312_064605_ignore_order_status_in_tickets_collection';

export const migrations = [
  {
    up: migration_20250311_133956_init_schemas.up,
    down: migration_20250311_133956_init_schemas.down,
    name: '20250311_133956_init_schemas',
  },
  {
    up: migration_20250312_005922_add_about_us_column.up,
    down: migration_20250312_005922_add_about_us_column.down,
    name: '20250312_005922_add_about_us_column',
  },
  {
    up: migration_20250312_064605_ignore_order_status_in_tickets_collection.up,
    down: migration_20250312_064605_ignore_order_status_in_tickets_collection.down,
    name: '20250312_064605_ignore_order_status_in_tickets_collection'
  },
];
