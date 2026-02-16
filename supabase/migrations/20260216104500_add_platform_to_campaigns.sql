-- Add platform column to campaigns table
ALTER TABLE campaigns 
ADD COLUMN platform text;

-- Optional: Add check constraint to ensure valid values if strict validation is desired at DB level
-- ALTER TABLE campaigns 
-- ADD CONSTRAINT check_platform CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitch', 'ugc', 'facebook', 'other'));
