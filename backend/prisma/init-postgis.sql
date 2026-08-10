-- Smart Driving Assistant - Database initialization
-- Run this in pgAdmin Query Tool or psql after creating sda_db

CREATE EXTENSION IF NOT EXISTS postgis;

-- Optional: add geometry columns for spatial queries (after first Prisma migrate)
-- ALTER TABLE speed_cameras ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);
-- ALTER TABLE community_reports ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);
-- ALTER TABLE favorites ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);

-- Example spatial index (run after adding geometry columns):
-- CREATE INDEX IF NOT EXISTS idx_speed_cameras_location ON speed_cameras USING GIST (location);

-- Example: find cameras within 2km (run after seed data):
-- SELECT id, name,
--   ST_Distance(
--     location::geography,
--     ST_SetSRID(ST_MakePoint(35.9106, 31.9539), 4326)::geography
--   ) AS distance_m
-- FROM speed_cameras
-- WHERE ST_DWithin(
--   location::geography,
--   ST_SetSRID(ST_MakePoint(35.9106, 31.9539), 4326)::geography,
--   2000
-- )
-- ORDER BY distance_m;
