-- Migrate existing speed camera rows into the new road_devices table.
-- This assumes road_devices already exists from Prisma schema sync.
INSERT INTO road_devices (
        id,
        device_type,
        name,
        location,
        speed_limit,
        direction,
        is_active,
        source,
        created_at,
        updated_at
    )
SELECT id,
    'camera',
    name,
    location,
    speed_limit,
    NULL,
    is_active,
    source,
    created_at,
    updated_at
FROM speed_cameras sc
WHERE NOT EXISTS (
        SELECT 1
        FROM road_devices rd
        WHERE rd.id = sc.id
    );
-- Add GiST index for road_devices location
CREATE INDEX IF NOT EXISTS idx_road_devices_location ON road_devices USING GIST(location);