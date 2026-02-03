-- DROP Channel Manager Tables

DROP TABLE IF EXISTS channel_sync_logs;
DROP TABLE IF EXISTS channel_rates;
DROP TABLE IF EXISTS channel_mappings;
DROP TABLE IF EXISTS channels;
DROP TABLE IF EXISTS channel_bookings; -- IF exists

-- Remove any related functions/triggers if created (none explicitly created in previous steps besides generic ones)
