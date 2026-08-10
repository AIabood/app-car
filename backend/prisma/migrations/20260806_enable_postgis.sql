-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
-- Add geography(Point,4326) column to trip_points, speed_cameras, community_reports, favorites
ALTER TABLE IF EXISTS trip_points
ADD COLUMN IF NOT EXISTS location geography(Point, 4326);
ALTER TABLE IF EXISTS speed_cameras
ADD COLUMN IF NOT EXISTS location geography(Point, 4326);
ALTER TABLE IF EXISTS community_reports
ADD COLUMN IF NOT EXISTS location geography(Point, 4326);
ALTER TABLE IF EXISTS favorites
ADD COLUMN IF NOT EXISTS location geography(Point, 4326);
-- Backfill location from longitude/latitude
UPDATE trip_points
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE longitude IS NOT NULL
    AND latitude IS NOT NULL;
UPDATE speed_cameras
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE longitude IS NOT NULL
    AND latitude IS NOT NULL;
UPDATE community_reports
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE longitude IS NOT NULL
    AND latitude IS NOT NULL;
UPDATE favorites
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE longitude IS NOT NULL
    AND latitude IS NOT NULL;
-- Create GiST indexes for fast geo queries
CREATE INDEX IF NOT EXISTS idx_trip_points_location ON trip_points USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_speed_cameras_location ON speed_cameras USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_community_reports_location ON community_reports USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_favorites_location ON favorites USING GIST(location);
-- Notes:
-- After verifying data, you can drop the old latitude/longitude columns if desired.
-- Run this script as a DB superuser or a role with CREATE EXTENSION privileges.