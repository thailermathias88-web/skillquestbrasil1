-- Add social_links column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Comment on column
COMMENT ON COLUMN user_profiles.social_links IS 'Stores user social media links (instagram, facebook, linkedin)';
