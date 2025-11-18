-- ============================================
-- SOCIAL MEDIA CACHING SYSTEM
-- ============================================
-- This schema provides comprehensive caching for Facebook, Instagram, and LinkedIn
-- metrics to improve performance and reduce API calls

-- ============================================
-- 1. SOCIAL MEDIA METRICS CACHE TABLE
-- ============================================
-- Main cache table for storing social media metrics
CREATE TABLE IF NOT EXISTS public.social_media_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  platform character varying NOT NULL CHECK (platform IN ('facebook', 'instagram', 'linkedin')),
  
  -- Account Information
  account_id character varying,
  account_name character varying,
  username character varying,
  profile_url text,
  
  -- Engagement Metrics
  engagement_data jsonb DEFAULT '{}'::jsonb,
  -- Structure: {
  --   likes: number,
  --   comments: number,
  --   shares: number,
  --   saves: number,
  --   engagementRate: number,
  --   reach: number,
  --   impressions: number,
  --   profileViews: number
  -- }
  
  -- Follower Data
  follower_count integer DEFAULT 0,
  follower_growth jsonb DEFAULT '[]'::jsonb,
  -- Structure: [{date: string, followers: number, gained: number, lost: number, net: number}]
  
  -- Top Posts
  top_posts jsonb DEFAULT '[]'::jsonb,
  -- Structure: [{id, format, reach, likes, comments, shares, caption, url, timestamp}]
  
  -- Reputation Benchmark
  reputation_data jsonb DEFAULT '{}'::jsonb,
  -- Structure: {score: number, avgEngagementRate: number, sentiment: string}
  
  -- Cache Metadata
  period character varying DEFAULT 'month',
  data_available boolean DEFAULT true,
  error_message text,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_fetched_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  
  -- Constraints
  CONSTRAINT social_media_cache_pkey PRIMARY KEY (id),
  CONSTRAINT social_media_cache_unique_user_platform UNIQUE (user_email, platform, period)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_social_media_cache_user_platform 
  ON public.social_media_cache(user_email, platform);

CREATE INDEX IF NOT EXISTS idx_social_media_cache_expires 
  ON public.social_media_cache(expires_at);

-- ============================================
-- 2. SOCIAL CONNECTION STATUS TABLE
-- ============================================
-- Enhanced social connections table with better OAuth tracking
CREATE TABLE IF NOT EXISTS public.social_connections_v2 (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  platform character varying NOT NULL CHECK (platform IN ('facebook', 'instagram', 'linkedin', 'twitter')),
  
  -- Connection Status
  is_connected boolean DEFAULT false,
  connection_status character varying DEFAULT 'disconnected' CHECK (
    connection_status IN ('connected', 'disconnected', 'expired', 'error')
  ),
  
  -- Account Information
  provider_user_id character varying,
  provider_username character varying,
  provider_email character varying,
  account_name character varying,
  profile_url text,
  
  -- OAuth Metadata
  scopes_granted text[],
  token_expires_at timestamp with time zone,
  last_token_refresh timestamp with time zone,
  
  -- Platform-specific data
  platform_metadata jsonb DEFAULT '{}'::jsonb,
  -- For Facebook: {pageId, pageName, pageAccessToken}
  -- For Instagram: {businessAccountId, connectedPageId}
  -- For LinkedIn: {companyUrl, companyName, organizationId}
  
  -- Error tracking
  last_error text,
  error_count integer DEFAULT 0,
  last_error_at timestamp with time zone,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  connected_at timestamp with time zone,
  disconnected_at timestamp with time zone,
  
  -- Constraints
  CONSTRAINT social_connections_v2_pkey PRIMARY KEY (id),
  CONSTRAINT social_connections_v2_unique_user_platform UNIQUE (user_email, platform)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_social_connections_v2_user_email 
  ON public.social_connections_v2(user_email);

CREATE INDEX IF NOT EXISTS idx_social_connections_v2_platform 
  ON public.social_connections_v2(platform);

CREATE INDEX IF NOT EXISTS idx_social_connections_v2_status 
  ON public.social_connections_v2(user_email, platform, is_connected);

-- ============================================
-- 3. SOCIAL MEDIA API RATE LIMITS TABLE
-- ============================================
-- Track API rate limits to prevent hitting limits
CREATE TABLE IF NOT EXISTS public.social_media_rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  platform character varying NOT NULL,
  endpoint character varying NOT NULL,
  
  -- Rate Limit Tracking
  requests_made integer DEFAULT 0,
  requests_limit integer DEFAULT 200,
  window_start timestamp with time zone DEFAULT now(),
  window_end timestamp with time zone,
  window_duration_minutes integer DEFAULT 60,
  
  -- Status
  is_limited boolean DEFAULT false,
  limit_reset_at timestamp with time zone,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Constraints
  CONSTRAINT social_media_rate_limits_pkey PRIMARY KEY (id),
  CONSTRAINT social_media_rate_limits_unique UNIQUE (user_email, platform, endpoint, window_start)
);

-- Index for rate limit checks
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_platform 
  ON public.social_media_rate_limits(user_email, platform, endpoint);

-- ============================================
-- 4. SOCIAL MEDIA FETCH HISTORY TABLE
-- ============================================
-- Track fetch history for analytics and debugging
CREATE TABLE IF NOT EXISTS public.social_media_fetch_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  platform character varying NOT NULL,
  
  -- Fetch Details
  fetch_type character varying NOT NULL, -- 'metrics', 'posts', 'followers', 'engagement'
  fetch_status character varying NOT NULL CHECK (
    fetch_status IN ('success', 'failed', 'partial', 'cached')
  ),
  
  -- Performance Metrics
  duration_ms integer,
  data_size_bytes integer,
  records_fetched integer DEFAULT 0,
  
  -- Cache Info
  cache_hit boolean DEFAULT false,
  cache_age_minutes integer,
  
  -- Error Info
  error_message text,
  error_code character varying,
  
  -- Timestamps
  fetched_at timestamp with time zone DEFAULT now(),
  
  -- Constraints
  CONSTRAINT social_media_fetch_history_pkey PRIMARY KEY (id)
);

-- Index for history queries
CREATE INDEX IF NOT EXISTS idx_fetch_history_user_platform 
  ON public.social_media_fetch_history(user_email, platform, fetched_at DESC);

CREATE INDEX IF NOT EXISTS idx_fetch_history_status 
  ON public.social_media_fetch_history(fetch_status, fetched_at DESC);

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_social_cache()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.social_media_cache
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get cache status for a user
CREATE OR REPLACE FUNCTION get_user_social_cache_status(p_user_email text)
RETURNS TABLE (
  platform character varying,
  is_cached boolean,
  cache_age_minutes integer,
  expires_in_minutes integer,
  last_fetched timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    smc.platform,
    (smc.expires_at > now()) as is_cached,
    EXTRACT(EPOCH FROM (now() - smc.last_fetched_at))::integer / 60 as cache_age_minutes,
    EXTRACT(EPOCH FROM (smc.expires_at - now()))::integer / 60 as expires_in_minutes,
    smc.last_fetched_at
  FROM public.social_media_cache smc
  WHERE smc.user_email = p_user_email
  ORDER BY smc.platform;
END;
$$ LANGUAGE plpgsql;

-- Function to update connection status
CREATE OR REPLACE FUNCTION update_social_connection_status(
  p_user_email text,
  p_platform character varying,
  p_is_connected boolean,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.social_connections_v2 (
    user_email,
    platform,
    is_connected,
    connection_status,
    platform_metadata,
    connected_at,
    updated_at
  )
  VALUES (
    p_user_email,
    p_platform,
    p_is_connected,
    CASE WHEN p_is_connected THEN 'connected' ELSE 'disconnected' END,
    p_metadata,
    CASE WHEN p_is_connected THEN now() ELSE NULL END,
    now()
  )
  ON CONFLICT (user_email, platform)
  DO UPDATE SET
    is_connected = p_is_connected,
    connection_status = CASE WHEN p_is_connected THEN 'connected' ELSE 'disconnected' END,
    platform_metadata = COALESCE(p_metadata, social_connections_v2.platform_metadata),
    connected_at = CASE WHEN p_is_connected THEN now() ELSE social_connections_v2.connected_at END,
    disconnected_at = CASE WHEN NOT p_is_connected THEN now() ELSE NULL END,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. AUTOMATIC CLEANUP JOB (Optional - requires pg_cron extension)
-- ============================================
-- Uncomment if you have pg_cron extension enabled
-- SELECT cron.schedule(
--   'cleanup-social-cache',
--   '0 */6 * * *', -- Every 6 hours
--   'SELECT cleanup_expired_social_cache();'
-- );

-- ============================================
-- 7. GRANT PERMISSIONS (Adjust as needed)
-- ============================================
-- Grant permissions to your application role
-- GRANT ALL ON public.social_media_cache TO your_app_role;
-- GRANT ALL ON public.social_connections_v2 TO your_app_role;
-- GRANT ALL ON public.social_media_rate_limits TO your_app_role;
-- GRANT ALL ON public.social_media_fetch_history TO your_app_role;

-- ============================================
-- 8. SAMPLE QUERIES
-- ============================================

-- Get all cached data for a user
-- SELECT * FROM public.social_media_cache 
-- WHERE user_email = 'user@example.com' 
-- AND expires_at > now();

-- Get connection status for all platforms
-- SELECT * FROM public.social_connections_v2 
-- WHERE user_email = 'user@example.com';

-- Get cache status
-- SELECT * FROM get_user_social_cache_status('user@example.com');

-- Check rate limits
-- SELECT * FROM public.social_media_rate_limits 
-- WHERE user_email = 'user@example.com' 
-- AND is_limited = true;

-- Get fetch history
-- SELECT * FROM public.social_media_fetch_history 
-- WHERE user_email = 'user@example.com' 
-- ORDER BY fetched_at DESC 
-- LIMIT 20;

-- ============================================
-- MIGRATION NOTES
-- ============================================
-- 1. This schema is designed to work alongside your existing oauth_tokens table
-- 2. The social_connections_v2 table is a new version with better tracking
-- 3. You can migrate data from social_connections to social_connections_v2 if needed
-- 4. Cache expiration is set per-entry, recommended: 30 minutes for metrics
-- 5. Consider setting up automated cleanup with pg_cron or a scheduled job
