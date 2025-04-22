import * as migration_20250311_133956_init_schemas from './20250311_133956_init_schemas';
import * as migration_20250312_005922_add_about_us_column from './20250312_005922_add_about_us_column';
import * as migration_20250312_064605_ignore_order_status_in_tickets_collection from './20250312_064605_ignore_order_status_in_tickets_collection';
import * as migration_20250312_112930_additional_new_collections from './20250312_112930_additional_new_collections';
import * as migration_20250312_170914_add_activities_collection from './20250312_170914_add_activities_collection';
import * as migration_20250312_181537_add_nav_items_column_footer from './20250312_181537_add_nav_items_column_footer';
import * as migration_20250312_190107_add_display_order_column_performer_collection_and_add_link_column_partner_collection from './20250312_190107_add_display_order_column_performer_collection_and_add_link_column_partner_collection';
import * as migration_20250313_035532_add_detailDescription_and_configuration_fields_event_table from './20250313_035532_add_detailDescription_and_configuration_fields_event_table';
import * as migration_20250313_085919_add_seat_field_to_order_item_and_ticket_collection from './20250313_085919_add_seat_field_to_order_item_and_ticket_collection';
import * as migration_20250313_093244_update_order_status_field_to_enum from './20250313_093244_update_order_status_field_to_enum';
import * as migration_20250314_025724_add_seat_holding_collection from './20250314_025724_add_seat_holding_collection';
import * as migration_20250314_124747_add_key_ticket_price_for_event_collectin from './20250314_124747_add_key_ticket_price_for_event_collectin';
import * as migration_20250314_624747_modify_schedule_date_varchar_to_date_type from './20250314_624747_modify_schedule_date_varchar_to_date_type';
import * as migration_20250315_151022_add_event_schedule_id_to_ticket_and_seat_holding_collection from './20250315_151022_add_event_schedule_id_to_ticket_and_seat_holding_collection';
import * as migration_20250318_082022_add_thumbnail_to_event_collection from './20250318_082022_add_thumbnail_to_event_collection';
import * as migration_20250319_092110_add_phone_number_to_user_collection from './20250319_092110_add_phone_number_to_user_collection';
import * as migration_20250319_140740_add_status_event_collection from './20250319_140740_add_status_event_collection';
import * as migration_20250319_193430_drop_not_null_columns_in_event_collection from './20250319_193430_drop_not_null_columns_in_event_collection';
import * as migration_20250320_035237_add_schedule_image_event_collection from './20250320_035237_add_schedule_image_event_collection';
import * as migration_20250320_043727_add_promotion_collection from './20250320_043727_add_promotion_collection';
import * as migration_20250320_045936_add_default_value_for_promotion_collection from './20250320_045936_add_default_value_for_promotion_collection';
import * as migration_20250321_012133_add_fields_to_handle_ticket_class from './20250321_012133_add_fields_to_handle_ticket_class';
import * as migration_20250321_054031_add_applied_ticket_class_promotion from './20250321_054031_add_applied_ticket_class_promotion';
import * as migration_20250322_090943_add_table_exports from './20250322_090943_add_table_exports';
import * as migration_20250322_164956_add_expire_at_column_to_order_and_payment_collections from './20250322_164956_add_expire_at_column_to_order_and_payment_collections';
import * as migration_20250323_112122_create_admin from './20250323_112122_create_admin';
import * as migration_20250323_112852_cleanup_users from './20250323_112852_cleanup_users';
import * as migration_20250324_081044_add_orders_to_tickets from './20250324_081044_add_orders_to_tickets';
import * as migration_20250325_045037_update_task_slug from './20250325_045037_update_task_slug';
import * as migration_20250327_015955_add_event_admin_role from './20250327_015955_add_event_admin_role';
import * as migration_20250402_085734_add_checkin_orders_table from './20250402_085734_add_checkin_orders_table';
import * as migration_20250403_034927_add_condition_to_promotion_collection from './20250403_034927_add_condition_to_promotion_collection';
import * as migration_20250409_081019_add_localization_event_collection from './20250409_081019_add_localization_event_collection';
import * as migration_20250410_162213_updateLocalization from './20250410_162213_updateLocalization';
import * as migration_20250411_061402_update_checkin_records_table from './20250411_061402_update_checkin_records_table';
import * as migration_20250414_155659_create_email_collection from './20250414_155659_create_email_collection';
import * as migration_20250417_035104_adding_column_indexes_collections from './20250417_035104_adding_column_indexes_collections';
import * as migration_20250418_075402_add_deleteAt_to_checkin_record from './20250418_075402_add_deleteAt_to_checkin_record';
import * as migration_20250421_075432_add_localization_performer_name from './20250421_075432_add_localization_performer_name';
import * as migration_20250422_051335_add_seat_and_event_date_to_checkin_record from './20250422_051335_add_seat_and_event_date_to_checkin_record';
import * as migration_20250422_172014_create_logs_collection from './20250422_172014_create_logs_collection';

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
    name: '20250313_035532_add_detailDescription_and_configuration_fields_event_table',
  },
  {
    up: migration_20250313_085919_add_seat_field_to_order_item_and_ticket_collection.up,
    down: migration_20250313_085919_add_seat_field_to_order_item_and_ticket_collection.down,
    name: '20250313_085919_add_seat_field_to_order_item_and_ticket_collection',
  },
  {
    up: migration_20250313_093244_update_order_status_field_to_enum.up,
    down: migration_20250313_093244_update_order_status_field_to_enum.down,
    name: '20250313_093244_update_order_status_field_to_enum',
  },
  {
    up: migration_20250314_025724_add_seat_holding_collection.up,
    down: migration_20250314_025724_add_seat_holding_collection.down,
    name: '20250314_025724_add_seat_holding_collection',
  },
  {
    up: migration_20250314_124747_add_key_ticket_price_for_event_collectin.up,
    down: migration_20250314_124747_add_key_ticket_price_for_event_collectin.down,
    name: '20250314_124747_add_key_ticket_price_for_event_collectin',
  },
  {
    up: migration_20250314_624747_modify_schedule_date_varchar_to_date_type.up,
    down: migration_20250314_624747_modify_schedule_date_varchar_to_date_type.down,
    name: '20250314_624747_modify_schedule_date_varchar_to_date_type',
  },
  {
    up: migration_20250315_151022_add_event_schedule_id_to_ticket_and_seat_holding_collection.up,
    down: migration_20250315_151022_add_event_schedule_id_to_ticket_and_seat_holding_collection.down,
    name: '20250315_151022_add_event_schedule_id_to_ticket_and_seat_holding_collection',
  },
  {
    up: migration_20250318_082022_add_thumbnail_to_event_collection.up,
    down: migration_20250318_082022_add_thumbnail_to_event_collection.down,
    name: '20250318_082022_add_thumbnail_to_event_collection',
  },
  {
    up: migration_20250319_092110_add_phone_number_to_user_collection.up,
    down: migration_20250319_092110_add_phone_number_to_user_collection.down,
    name: '20250319_092110_add_phone_number_to_user_collection',
  },
  {
    up: migration_20250319_140740_add_status_event_collection.up,
    down: migration_20250319_140740_add_status_event_collection.down,
    name: '20250319_140740_add_status_event_collection',
  },
  {
    up: migration_20250319_193430_drop_not_null_columns_in_event_collection.up,
    down: migration_20250319_193430_drop_not_null_columns_in_event_collection.down,
    name: '20250319_193430_drop_not_null_columns_in_event_collection',
  },
  {
    up: migration_20250320_035237_add_schedule_image_event_collection.up,
    down: migration_20250320_035237_add_schedule_image_event_collection.down,
    name: '20250320_035237_add_schedule_image_event_collection',
  },
  {
    up: migration_20250320_043727_add_promotion_collection.up,
    down: migration_20250320_043727_add_promotion_collection.down,
    name: '20250320_043727_add_promotion_collection',
  },
  {
    up: migration_20250320_045936_add_default_value_for_promotion_collection.up,
    down: migration_20250320_045936_add_default_value_for_promotion_collection.down,
    name: '20250320_045936_add_default_value_for_promotion_collection',
  },
  {
    up: migration_20250321_012133_add_fields_to_handle_ticket_class.up,
    down: migration_20250321_012133_add_fields_to_handle_ticket_class.down,
    name: '20250321_012133_add_fields_to_handle_ticket_class',
  },
  {
    up: migration_20250321_054031_add_applied_ticket_class_promotion.up,
    down: migration_20250321_054031_add_applied_ticket_class_promotion.down,
    name: '20250321_054031_add_applied_ticket_class_promotion',
  },
  {
    up: migration_20250322_090943_add_table_exports.up,
    down: migration_20250322_090943_add_table_exports.down,
    name: '20250322_090943_add_table_exports',
  },
  {
    up: migration_20250322_164956_add_expire_at_column_to_order_and_payment_collections.up,
    down: migration_20250322_164956_add_expire_at_column_to_order_and_payment_collections.down,
    name: '20250322_164956_add_expire_at_column_to_order_and_payment_collections',
  },
  {
    up: migration_20250323_112122_create_admin.up,
    down: migration_20250323_112122_create_admin.down,
    name: '20250323_112122_create_admin',
  },
  {
    up: migration_20250323_112852_cleanup_users.up,
    down: migration_20250323_112852_cleanup_users.down,
    name: '20250323_112852_cleanup_users',
  },
  {
    up: migration_20250324_081044_add_orders_to_tickets.up,
    down: migration_20250324_081044_add_orders_to_tickets.down,
    name: '20250324_081044_add_orders_to_tickets',
  },
  {
    up: migration_20250325_045037_update_task_slug.up,
    down: migration_20250325_045037_update_task_slug.down,
    name: '20250325_045037_update_task_slug',
  },
  {
    up: migration_20250327_015955_add_event_admin_role.up,
    down: migration_20250327_015955_add_event_admin_role.down,
    name: '20250327_015955_add_event_admin_role',
  },
  {
    up: migration_20250402_085734_add_checkin_orders_table.up,
    down: migration_20250402_085734_add_checkin_orders_table.down,
    name: '20250402_085734_add_checkin_orders_table',
  },
  {
    up: migration_20250403_034927_add_condition_to_promotion_collection.up,
    down: migration_20250403_034927_add_condition_to_promotion_collection.down,
    name: '20250403_034927_add_condition_to_promotion_collection',
  },
  {
    up: migration_20250409_081019_add_localization_event_collection.up,
    down: migration_20250409_081019_add_localization_event_collection.down,
    name: '20250409_081019_add_localization_event_collection',
  },
  {
    up: migration_20250410_162213_updateLocalization.up,
    down: migration_20250410_162213_updateLocalization.down,
    name: '20250410_162213_updateLocalization',
  },
  {
    up: migration_20250411_061402_update_checkin_records_table.up,
    down: migration_20250411_061402_update_checkin_records_table.down,
    name: '20250411_061402_update_checkin_records_table',
  },
  {
    up: migration_20250414_155659_create_email_collection.up,
    down: migration_20250414_155659_create_email_collection.down,
    name: '20250414_155659_create_email_collection',
  },
  {
    up: migration_20250417_035104_adding_column_indexes_collections.up,
    down: migration_20250417_035104_adding_column_indexes_collections.down,
    name: '20250417_035104_adding_column_indexes_collections',
  },
  {
    up: migration_20250418_075402_add_deleteAt_to_checkin_record.up,
    down: migration_20250418_075402_add_deleteAt_to_checkin_record.down,
    name: '20250418_075402_add_deleteAt_to_checkin_record',
  },
  {
    up: migration_20250421_075432_add_localization_performer_name.up,
    down: migration_20250421_075432_add_localization_performer_name.down,
    name: '20250421_075432_add_localization_performer_name',
  },
  {
    up: migration_20250422_051335_add_seat_and_event_date_to_checkin_record.up,
    down: migration_20250422_051335_add_seat_and_event_date_to_checkin_record.down,
    name: '20250422_051335_add_seat_and_event_date_to_checkin_record',
  },
  {
    up: migration_20250422_172014_create_logs_collection.up,
    down: migration_20250422_172014_create_logs_collection.down,
    name: '20250422_172014_create_logs_collection'
  },
];
