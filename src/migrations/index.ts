import * as migration_20250311_133956_init_schemas from './20250311_133956_init_schemas';
import * as migration_20250312_005922_add_about_us_column from './20250312_005922_add_about_us_column';

export const migrations = [
  {
    up: migration_20250311_133956_init_schemas.up,
    down: migration_20250311_133956_init_schemas.down,
    name: '20250311_133956_init_schemas',
  },
  {
    up: migration_20250312_005922_add_about_us_column.up,
    down: migration_20250312_005922_add_about_us_column.down,
    name: '20250312_005922_add_about_us_column'
  },
];
