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
import * as migration_20250315_120000_add_checkin_indexes from './20250315_120000_add_checkin_indexes';
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
import * as migration_20250422_152826_add_mobile_event_banner_column from './20250422_152826_add_mobile_event_banner_column';
import * as migration_20250422_172014_create_logs_collection from './20250422_172014_create_logs_collection';
import * as migration_20250423_023720_add_ticket_given_time_and_ticket_given_by_to_checkin_record from './20250423_023720_add_ticket_given_time_and_ticket_given_by_to_checkin_record';
import * as migration_20250423_054455_add_configuration_show_banner_description from './20250423_054455_add_configuration_show_banner_description';
import * as migration_20250423_165748_add_discount_apply_scope_column_promotion from './20250423_165748_add_discount_apply_scope_column_promotion';
import * as migration_20250424_040651_change_column_admin_id_to_usher_number_checkin_records from './20250424_040651_change_column_admin_id_to_usher_number_checkin_records';
import * as migration_20250425_033543_add_indexing from './20250425_033543_add_indexing';
import * as migration_20250425_155521_drop_unique_ticket_checkin_records from './20250425_155521_drop_unique_ticket_checkin_records';
import * as migration_20250522_093549_add_note_created_by_columns_to_order_collection from './20250522_093549_add_note_created_by_columns_to_order_collection';
import * as migration_20250523_053715_add_custom_block_and_support_multi_language_page_collection from './20250523_053715_add_custom_block_and_support_multi_language_page_collection';
import * as migration_20250523_080251_add_children_navitem_header from './20250523_080251_add_children_navitem_header';
import * as migration_20250524_133051_add_authentication_user from './20250524_133051_add_authentication_user';
import * as migration_20250527_035818_add_seating_chart from './20250527_035818_add_seating_chart';
import * as migration_20250527_170646_add_category_order from './20250527_170646_add_category_order';
import * as migration_20250528_161621_add_marketing_tracking from './20250528_161621_add_marketing_tracking';
import * as migration_20250530_165258_support_multi_promotion_codes from './20250530_165258_support_multi_promotion_codes';
import * as migration_20250604_053644_add_columns_email from './20250604_053644_add_columns_email';
import * as migration_20250604_160223_add_seo_columns from './20250604_160223_add_seo_columns';
import * as migration_20250610_164256_add_affiliate_feature from './20250610_164256_add_affiliate_feature';
import * as migration_20250611_030117_add_session_id_affiliate_click_logs from './20250611_030117_add_session_id_affiliate_click_logs';
import * as migration_20250611_080103_add_affiliate_to_order_collection from './20250611_080103_add_affiliate_to_order_collection';
import * as migration_20250612_060257_add_promotions_to_affiliate_setting from './20250612_060257_add_promotions_to_affiliate_setting';
import * as migration_20250612_102521_update_affiliate_link from './20250612_102521_update_affiliate_link';
import * as migration_20250619_091356 from './20250619_091356';
import * as migration_20250624_164118_create_affiliate_ranks from './20250624_164118_create_affiliate_ranks';
import * as migration_20250626_015908_add_fields_affiliate_ranks from './20250626_015908_add_fields_affiliate_ranks';
import * as migration_20250626_162808_add_virtual_rank_name_label_field from './20250626_162808_add_virtual_rank_name_label_field';
import * as migration_20250627_083211_add_tax_and_fields_event_affiliate_user_rank from './20250627_083211_add_tax_and_fields_event_affiliate_user_rank';
import * as migration_20250627_084556_add_fields_to_affiliate_user_rank from './20250627_084556_add_fields_to_affiliate_user_rank';
import * as migration_20250701_083830_add_fields_to_affiliate_user_rank from './20250701_083830_add_fields_to_affiliate_user_rank';
import * as migration_20250702_060608_add_admin_session from './20250702_060608_add_admin_session';
import * as migration_20250702_131553_add_affiliate_status from './20250702_131553_add_affiliate_status';
import * as migration_20250703_154624_add_name_affiliate_links from './20250703_154624_add_name_affiliate_links';
import * as migration_20250706_140853_create_membership_collections from './20250706_140853_create_membership_collections';
import * as migration_20250709_051135_remove_default_user_affiliate_status from './20250709_051135_remove_default_user_affiliate_status';
import * as migration_20250709_051424_add_affiliate_link_slug from './20250709_051424_add_affiliate_link_slug';
import * as migration_20250713_044021_add_manual_column_to_checkin_records from './20250713_044021_add_manual_column_to_checkin_records';
import * as migration_20250714_080211_add_phone_number_index from './20250714_080211_add_phone_number_index';
import * as migration_20250715_013630_add_gift_ticket_fields from './20250715_013630_add_gift_ticket_fields';
import * as migration_20250715_140337_add_checkin_method_to_checkin_records from './20250715_140337_add_checkin_method_to_checkin_records';
import * as migration_20250716_013339_add_order_and_type_to_email_collection from './20250716_013339_add_order_and_type_to_email_collection';
import * as migration_20250719_070659_add_trigram_indexes_for_checkin_search from './20250719_070659_add_trigram_indexes_for_checkin_search';
import * as migration_20250726_032622_add_order_item_status from './20250726_032622_add_order_item_status';
import * as migration_20250805_133549_update_fields_affiliate from './20250805_133549_update_fields_affiliate';

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
    up: migration_20250315_120000_add_checkin_indexes.up,
    down: migration_20250315_120000_add_checkin_indexes.down,
    name: '20250315_120000_add_checkin_indexes',
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
    up: migration_20250422_152826_add_mobile_event_banner_column.up,
    down: migration_20250422_152826_add_mobile_event_banner_column.down,
    name: '20250422_152826_add_mobile_event_banner_column',
  },
  {
    up: migration_20250422_172014_create_logs_collection.up,
    down: migration_20250422_172014_create_logs_collection.down,
    name: '20250422_172014_create_logs_collection',
  },
  {
    up: migration_20250423_023720_add_ticket_given_time_and_ticket_given_by_to_checkin_record.up,
    down: migration_20250423_023720_add_ticket_given_time_and_ticket_given_by_to_checkin_record.down,
    name: '20250423_023720_add_ticket_given_time_and_ticket_given_by_to_checkin_record',
  },
  {
    up: migration_20250423_054455_add_configuration_show_banner_description.up,
    down: migration_20250423_054455_add_configuration_show_banner_description.down,
    name: '20250423_054455_add_configuration_show_banner_description',
  },
  {
    up: migration_20250423_165748_add_discount_apply_scope_column_promotion.up,
    down: migration_20250423_165748_add_discount_apply_scope_column_promotion.down,
    name: '20250423_165748_add_discount_apply_scope_column_promotion',
  },
  {
    up: migration_20250424_040651_change_column_admin_id_to_usher_number_checkin_records.up,
    down: migration_20250424_040651_change_column_admin_id_to_usher_number_checkin_records.down,
    name: '20250424_040651_change_column_admin_id_to_usher_number_checkin_records',
  },
  {
    up: migration_20250425_033543_add_indexing.up,
    down: migration_20250425_033543_add_indexing.down,
    name: '20250425_033543_add_indexing',
  },
  {
    up: migration_20250425_155521_drop_unique_ticket_checkin_records.up,
    down: migration_20250425_155521_drop_unique_ticket_checkin_records.down,
    name: '20250425_155521_drop_unique_ticket_checkin_records',
  },
  {
    up: migration_20250522_093549_add_note_created_by_columns_to_order_collection.up,
    down: migration_20250522_093549_add_note_created_by_columns_to_order_collection.down,
    name: '20250522_093549_add_note_created_by_columns_to_order_collection',
  },
  {
    up: migration_20250523_053715_add_custom_block_and_support_multi_language_page_collection.up,
    down: migration_20250523_053715_add_custom_block_and_support_multi_language_page_collection.down,
    name: '20250523_053715_add_custom_block_and_support_multi_language_page_collection',
  },
  {
    up: migration_20250523_080251_add_children_navitem_header.up,
    down: migration_20250523_080251_add_children_navitem_header.down,
    name: '20250523_080251_add_children_navitem_header',
  },
  {
    up: migration_20250524_133051_add_authentication_user.up,
    down: migration_20250524_133051_add_authentication_user.down,
    name: '20250524_133051_add_authentication_user',
  },
  {
    up: migration_20250527_035818_add_seating_chart.up,
    down: migration_20250527_035818_add_seating_chart.down,
    name: '20250527_035818_add_seating_chart',
  },
  {
    up: migration_20250527_170646_add_category_order.up,
    down: migration_20250527_170646_add_category_order.down,
    name: '20250527_170646_add_category_order',
  },
  {
    up: migration_20250528_161621_add_marketing_tracking.up,
    down: migration_20250528_161621_add_marketing_tracking.down,
    name: '20250528_161621_add_marketing_tracking',
  },
  {
    up: migration_20250530_165258_support_multi_promotion_codes.up,
    down: migration_20250530_165258_support_multi_promotion_codes.down,
    name: '20250530_165258_support_multi_promotion_codes',
  },
  {
    up: migration_20250604_053644_add_columns_email.up,
    down: migration_20250604_053644_add_columns_email.down,
    name: '20250604_053644_add_columns_email',
  },
  {
    up: migration_20250604_160223_add_seo_columns.up,
    down: migration_20250604_160223_add_seo_columns.down,
    name: '20250604_160223_add_seo_columns',
  },
  {
    up: migration_20250610_164256_add_affiliate_feature.up,
    down: migration_20250610_164256_add_affiliate_feature.down,
    name: '20250610_164256_add_affiliate_feature',
  },
  {
    up: migration_20250611_030117_add_session_id_affiliate_click_logs.up,
    down: migration_20250611_030117_add_session_id_affiliate_click_logs.down,
    name: '20250611_030117_add_session_id_affiliate_click_logs',
  },
  {
    up: migration_20250611_080103_add_affiliate_to_order_collection.up,
    down: migration_20250611_080103_add_affiliate_to_order_collection.down,
    name: '20250611_080103_add_affiliate_to_order_collection',
  },
  {
    up: migration_20250612_060257_add_promotions_to_affiliate_setting.up,
    down: migration_20250612_060257_add_promotions_to_affiliate_setting.down,
    name: '20250612_060257_add_promotions_to_affiliate_setting',
  },
  {
    up: migration_20250612_102521_update_affiliate_link.up,
    down: migration_20250612_102521_update_affiliate_link.down,
    name: '20250612_102521_update_affiliate_link',
  },
  {
    up: migration_20250619_091356.up,
    down: migration_20250619_091356.down,
    name: '20250619_091356',
  },
  {
    up: migration_20250624_164118_create_affiliate_ranks.up,
    down: migration_20250624_164118_create_affiliate_ranks.down,
    name: '20250624_164118_create_affiliate_ranks',
  },
  {
    up: migration_20250626_015908_add_fields_affiliate_ranks.up,
    down: migration_20250626_015908_add_fields_affiliate_ranks.down,
    name: '20250626_015908_add_fields_affiliate_ranks',
  },
  {
    up: migration_20250626_162808_add_virtual_rank_name_label_field.up,
    down: migration_20250626_162808_add_virtual_rank_name_label_field.down,
    name: '20250626_162808_add_virtual_rank_name_label_field',
  },
  {
    up: migration_20250627_083211_add_tax_and_fields_event_affiliate_user_rank.up,
    down: migration_20250627_083211_add_tax_and_fields_event_affiliate_user_rank.down,
    name: '20250627_083211_add_tax_and_fields_event_affiliate_user_rank',
  },
  {
    up: migration_20250627_084556_add_fields_to_affiliate_user_rank.up,
    down: migration_20250627_084556_add_fields_to_affiliate_user_rank.down,
    name: '20250627_084556_add_fields_to_affiliate_user_rank',
  },
  {
    up: migration_20250701_083830_add_fields_to_affiliate_user_rank.up,
    down: migration_20250701_083830_add_fields_to_affiliate_user_rank.down,
    name: '20250701_083830_add_fields_to_affiliate_user_rank',
  },
  {
    up: migration_20250702_060608_add_admin_session.up,
    down: migration_20250702_060608_add_admin_session.down,
    name: '20250702_060608_add_admin_session',
  },
  {
    up: migration_20250702_131553_add_affiliate_status.up,
    down: migration_20250702_131553_add_affiliate_status.down,
    name: '20250702_131553_add_affiliate_status',
  },
  {
    up: migration_20250703_154624_add_name_affiliate_links.up,
    down: migration_20250703_154624_add_name_affiliate_links.down,
    name: '20250703_154624_add_name_affiliate_links',
  },
  {
    up: migration_20250706_140853_create_membership_collections.up,
    down: migration_20250706_140853_create_membership_collections.down,
    name: '20250706_140853_create_membership_collections',
  },
  {
    up: migration_20250709_051135_remove_default_user_affiliate_status.up,
    down: migration_20250709_051135_remove_default_user_affiliate_status.down,
    name: '20250709_051135_remove_default_user_affiliate_status',
  },
  {
    up: migration_20250709_051424_add_affiliate_link_slug.up,
    down: migration_20250709_051424_add_affiliate_link_slug.down,
    name: '20250709_051424_add_affiliate_link_slug',
  },
  {
    up: migration_20250713_044021_add_manual_column_to_checkin_records.up,
    down: migration_20250713_044021_add_manual_column_to_checkin_records.down,
    name: '20250713_044021_add_manual_column_to_checkin_records',
  },
  {
    up: migration_20250714_080211_add_phone_number_index.up,
    down: migration_20250714_080211_add_phone_number_index.down,
    name: '20250714_080211_add_phone_number_index',
  },
  {
    up: migration_20250715_013630_add_gift_ticket_fields.up,
    down: migration_20250715_013630_add_gift_ticket_fields.down,
    name: '20250715_013630_add_gift_ticket_fields',
  },
  {
    up: migration_20250715_140337_add_checkin_method_to_checkin_records.up,
    down: migration_20250715_140337_add_checkin_method_to_checkin_records.down,
    name: '20250715_140337_add_checkin_method_to_checkin_records',
  },
  {
    up: migration_20250716_013339_add_order_and_type_to_email_collection.up,
    down: migration_20250716_013339_add_order_and_type_to_email_collection.down,
    name: '20250716_013339_add_order_and_type_to_email_collection',
  },
  {
    up: migration_20250719_070659_add_trigram_indexes_for_checkin_search.up,
    down: migration_20250719_070659_add_trigram_indexes_for_checkin_search.down,
    name: '20250719_070659_add_trigram_indexes_for_checkin_search',
  },
  {
    up: migration_20250726_032622_add_order_item_status.up,
    down: migration_20250726_032622_add_order_item_status.down,
    name: '20250726_032622_add_order_item_status',
  },
  {
    up: migration_20250805_133549_update_fields_affiliate.up,
    down: migration_20250805_133549_update_fields_affiliate.down,
    name: '20250805_133549_update_fields_affiliate'
  },
];
