-- Migration: Add LinkedIn OAuth Support
-- Description: Ensures oauth_tokens table supports LinkedIn as a provider
-- Date: October 20, 2025

-- The oauth_tokens table should already support multiple providers via the 'provider' column
-- This migration adds any missing columns and ensures proper indexes

-- Add provider_user_id column if it doesn't exist (for storing LinkedIn user ID)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='oauth_tokens' AND column_name='provider_user_id'
  ) THEN
    ALTER TABLE oauth_tokens ADD COLUMN provider_user_id VARCHAR(255);
    RAISE NOTICE 'Added provider_user_id column';
  ELSE
    RAISE NOTICE 'provider_user_id column already exists';
  END IF;
END $$;

-- Add provider_user_name column if it doesn't exist (for storing LinkedIn display name)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='oauth_tokens' AND column_name='provider_user_name'
  ) THEN
    ALTER TABLE oauth_tokens ADD COLUMN provider_user_name VARCHAR(255);
    RAISE NOTICE 'Added provider_user_name column';
  ELSE
    RAISE NOTICE 'provider_user_name column already exists';
  END IF;
END $$;

-- Add provider_user_email column if it doesn't exist (for storing provider email)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='oauth_tokens' AND column_name='provider_user_email'
  ) THEN
    ALTER TABLE oauth_tokens ADD COLUMN provider_user_email VARCHAR(255);
    RAISE NOTICE 'Added provider_user_email column';
  ELSE
    RAISE NOTICE 'provider_user_email column already exists';
  END IF;
END $$;

-- Create index on provider column for faster lookups
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename='oauth_tokens' AND indexname='idx_oauth_tokens_provider'
  ) THEN
    CREATE INDEX idx_oauth_tokens_provider ON oauth_tokens(provider);
    RAISE NOTICE 'Created index on provider column';
  ELSE
    RAISE NOTICE 'Index on provider column already exists';
  END IF;
END $$;

-- Create composite index on email + provider for faster status checks
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename='oauth_tokens' AND indexname='idx_oauth_tokens_email_provider'
  ) THEN
    CREATE INDEX idx_oauth_tokens_email_provider ON oauth_tokens(email, provider);
    RAISE NOTICE 'Created composite index on email + provider';
  ELSE
    RAISE NOTICE 'Composite index on email + provider already exists';
  END IF;
END $$;

-- Verify the table structure
DO $$ 
BEGIN
  RAISE NOTICE '✅ LinkedIn OAuth support migration completed';
  RAISE NOTICE 'Supported providers: google, facebook, linkedin';
  RAISE NOTICE 'Table: oauth_tokens';
END $$;

-- Display current provider distribution
SELECT 
  provider,
  COUNT(*) as connection_count,
  COUNT(DISTINCT email) as unique_users
FROM oauth_tokens
WHERE provider IN ('google', 'facebook', 'linkedin')
GROUP BY provider
ORDER BY provider;

COMMENT ON TABLE oauth_tokens IS 'Stores OAuth tokens for multiple providers (Google, Facebook, LinkedIn)';
COMMENT ON COLUMN oauth_tokens.provider IS 'OAuth provider name: google, facebook, or linkedin';
COMMENT ON COLUMN oauth_tokens.provider_user_id IS 'Unique user ID from the OAuth provider';
COMMENT ON COLUMN oauth_tokens.provider_user_name IS 'Display name from the OAuth provider';
COMMENT ON COLUMN oauth_tokens.provider_user_email IS 'Email address from the OAuth provider';
