-- Migration: Add Facebook OAuth support to oauth_tokens table
-- Description: Extends oauth_tokens table to support multiple OAuth providers (Google, Facebook, LinkedIn, etc.)
-- Date: 2025-10-20

-- 1. Add columns for provider-specific data if they don't exist
ALTER TABLE oauth_tokens 
ADD COLUMN IF NOT EXISTS provider_user_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS provider_user_name VARCHAR(255);

-- 2. Add index on provider for faster queries
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_provider 
ON oauth_tokens(provider);

-- 3. Add composite index on user_email and provider for faster lookups
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_provider 
ON oauth_tokens(user_email, provider);

-- 4. Update provider column to support multiple providers (if needed)
-- This ensures the column can store 'google', 'facebook', 'linkedin', etc.
ALTER TABLE oauth_tokens 
ALTER COLUMN provider TYPE VARCHAR(50);

-- 5. Add check constraint to ensure valid providers
ALTER TABLE oauth_tokens 
DROP CONSTRAINT IF EXISTS chk_oauth_provider;

ALTER TABLE oauth_tokens 
ADD CONSTRAINT chk_oauth_provider 
CHECK (provider IN ('google', 'facebook', 'linkedin', 'twitter', 'instagram'));

-- 6. Add comments for documentation
COMMENT ON COLUMN oauth_tokens.provider IS 'OAuth provider name: google, facebook, linkedin, twitter, instagram';
COMMENT ON COLUMN oauth_tokens.provider_user_id IS 'User ID from the OAuth provider (e.g., Facebook User ID)';
COMMENT ON COLUMN oauth_tokens.provider_user_name IS 'User name from the OAuth provider';

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'oauth_tokens'
ORDER BY ordinal_position;
