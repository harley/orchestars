import * as migration_20250311_133956_init_schemas from './20250311_133956_init_schemas';

export const migrations = [
  {
    up: migration_20250311_133956_init_schemas.up,
    down: migration_20250311_133956_init_schemas.down,
    name: '20250311_133956_init_schemas'
  },
];
