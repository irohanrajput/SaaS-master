-- Create competitor intelligence cache table with separate columns for better readability
CREATE TABLE IF NOT EXISTS competitor_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_domain VARCHAR(255) NOT NULL,
  competitor_domain VARCHAR(255) NOT NULL,
  
  -- Analysis data separated by service
  lighthouse_data JSONB,
  pagespeed_data JSONB,
  technical_seo_data JSONB,
  puppeteer_data JSONB,
  backlinks_data JSONB,
  
  -- Additional metadata
  analysis_status VARCHAR(50) DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'partial'
  error_details TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Create unique constraint on user_id, user_domain, and competitor_domain
  CONSTRAINT unique_user_competitor UNIQUE (user_id, user_domain, competitor_domain),
  
  -- Foreign key to users table
  CONSTRAINT fk_competitor_cache_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_competitor_cache_user_id ON competitor_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_competitor_cache_user_domain ON competitor_cache(user_domain);
CREATE INDEX IF NOT EXISTS idx_competitor_cache_competitor_domain ON competitor_cache(competitor_domain);
CREATE INDEX IF NOT EXISTS idx_competitor_cache_expires_at ON competitor_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_competitor_cache_composite ON competitor_cache(user_id, user_domain, competitor_domain);
CREATE INDEX IF NOT EXISTS idx_competitor_cache_status ON competitor_cache(analysis_status);

-- Add comments
COMMENT ON TABLE competitor_cache IS 'Cache table for competitor intelligence data with separated analysis services for better readability and query performance';
COMMENT ON COLUMN competitor_cache.user_id IS 'User who initiated the competitor analysis';
COMMENT ON COLUMN competitor_cache.user_domain IS 'Users own domain for comparison';
COMMENT ON COLUMN competitor_cache.competitor_domain IS 'Competitor domain being analyzed';
COMMENT ON COLUMN competitor_cache.lighthouse_data IS 'JSONB containing Lighthouse audit results (performance, SEO, accessibility scores)';
COMMENT ON COLUMN competitor_cache.pagespeed_data IS 'JSONB containing PageSpeed Insights metrics (mobile & desktop scores, CrUX data)';
COMMENT ON COLUMN competitor_cache.technical_seo_data IS 'JSONB containing technical SEO checks (robots.txt, sitemap, structured data, meta tags, SSL)';
COMMENT ON COLUMN competitor_cache.puppeteer_data IS 'JSONB containing Puppeteer analysis (content analysis, technology stack, security headers)';
COMMENT ON COLUMN competitor_cache.backlinks_data IS 'JSONB containing SE Ranking backlinks summary (total backlinks, referring domains, IPs, subnets)';
COMMENT ON COLUMN competitor_cache.analysis_status IS 'Status of the analysis: pending, completed, failed, or partial';
COMMENT ON COLUMN competitor_cache.error_details IS 'Error messages if analysis failed or partially completed';
COMMENT ON COLUMN competitor_cache.expires_at IS 'Cache expiration timestamp (typically 7 days for competitor data)';
