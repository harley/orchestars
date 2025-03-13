import * as migration_20250311_133956_init_schemas from './20250311_133956_init_schemas';
import * as migration_20250312_005922_add_about_us_column from './20250312_005922_add_about_us_column';
import * as migration_20250312_064605_ignore_order_status_in_tickets_collection from './20250312_064605_ignore_order_status_in_tickets_collection';
import * as migration_20250312_112930_additional_new_collections from './20250312_112930_additional_new_collections';
import * as migration_20250312_170914_add_activities_collection from './20250312_170914_add_activities_collection';
import * as migration_20250312_181537_add_nav_items_column_footer from './20250312_181537_add_nav_items_column_footer';
import * as migration_20250312_190107_add_display_order_column_performer_collection_and_add_link_column_partner_collection from './20250312_190107_add_display_order_column_performer_collection_and_add_link_column_partner_collection';
import * as migration_20250313_035532_add_detailDescription_and_configuration_fields_event_table from './20250313_035532_add_detailDescription_and_configuration_fields_event_table';

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
    name: '20250312_064605_ignore_order_status_in_tickets_collection',
  },
  {
    up: migration_20250312_112930_additional_new_collections.up,
    down: migration_20250312_112930_additional_new_collections.down,
    name: '20250312_112930_additional_new_collections',
  },
  {
    up: migration_20250312_170914_add_activities_collection.up,
    down: migration_20250312_170914_add_activities_collection.down,
    name: '20250312_170914_add_activities_collection',
  },
  {
    up: migration_20250312_181537_add_nav_items_column_footer.up,
    down: migration_20250312_181537_add_nav_items_column_footer.down,
    name: '20250312_181537_add_nav_items_column_footer',
  },
  {
    up: migration_20250312_190107_add_display_order_column_performer_collection_and_add_link_column_partner_collection.up,
    down: migration_20250312_190107_add_display_order_column_performer_collection_and_add_link_column_partner_collection.down,
    name: '20250312_190107_add_display_order_column_performer_collection_and_add_link_column_partner_collection',
  },
  {
    up: migration_20250313_035532_add_detailDescription_and_configuration_fields_event_table.up,
    down: migration_20250313_035532_add_detailDescription_and_configuration_fields_event_table.down,
    name: '20250313_035532_add_detailDescription_and_configuration_fields_event_table'
  },
];
