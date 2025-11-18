-- Migration: Create social_connections table
-- Description: Store social media connections (Facebook OAuth, LinkedIn URLs)
-- Date: October 21, 2025

-- Create social_connections table
CREATE TABLE IF NOT EXISTS social_connections (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('facebook', 'linkedin', 'instagram', 'twitter')),
  
  -- For LinkedIn (scraper-based)
  company_url TEXT,
  company_name VARCHAR(255),
  
  -- For Facebook/others (OAuth-based) - links to oauth_tokens table
  oauth_connected BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one entry per user per platform
  UNIQUE(email, platform)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_social_connections_email ON social_connections(email);
CREATE INDEX IF NOT EXISTS idx_social_connections_platform ON social_connections(platform);
CREATE INDEX IF NOT EXISTS idx_social_connections_email_platform ON social_connections(email, platform);

-- Add comments
COMMENT ON TABLE social_connections IS 'Stores social media connections for users';
COMMENT ON COLUMN social_connections.platform IS 'Social platform: facebook, linkedin, instagram, twitter';
COMMENT ON COLUMN social_connections.company_url IS 'LinkedIn company page URL (for scraper)';
COMMENT ON COLUMN social_connections.company_name IS 'LinkedIn company name extracted from URL';
COMMENT ON COLUMN social_connections.oauth_connected IS 'True if platform uses OAuth (Facebook)';

-- Display current connections
SELECT 
  platform,
  COUNT(*) as total_connections,
  COUNT(DISTINCT email) as unique_users,
  SUM(CASE WHEN oauth_connected THEN 1 ELSE 0 END) as oauth_connections,
  SUM(CASE WHEN company_url IS NOT NULL THEN 1 ELSE 0 END) as scraper_connections
FROM social_connections
GROUP BY platform
ORDER BY platform;

-- Example queries:
-- Get user's LinkedIn company URL:
-- SELECT company_url FROM social_connections WHERE email='user@example.com' AND platform='linkedin';

-- Save LinkedIn company URL:
-- INSERT INTO social_connections (email, platform, company_url, company_name)
-- VALUES ('user@example.com', 'linkedin', 'https://linkedin.com/company/example', 'Example Company')
-- ON CONFLICT (email, platform) 
-- DO UPDATE SET company_url = EXCLUDED.company_url, company_name = EXCLUDED.company_name, updated_at = NOW();

-- Check if Facebook is connected (via OAuth):
-- SELECT oauth_connected FROM social_connections 
-- WHERE email='user@example.com' AND platform='facebook';
