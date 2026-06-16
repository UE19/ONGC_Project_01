-- Add is_active to assets (all existing rows = active)
ALTER TABLE assets ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
UPDATE assets SET is_active = TRUE WHERE is_active IS NULL;

-- Verify
SELECT asset_id, asset_name, location, region, is_active FROM assets;
