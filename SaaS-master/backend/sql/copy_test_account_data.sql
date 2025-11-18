-- Copy All Cached Data from Main Account to Test Account
-- Main Account ID: 3356f634-bf7e-4cbf-9000-ca23f678a6f8
-- Test Account ID: 8354554e-b321-4306-acd9-47fb5be55475

-- ============================================
-- IMPORTANT: Run this in your Supabase SQL Editor
-- ============================================

-- 1. Copy Search Console Cache
INSERT INTO public.search_console_cache (
  user_id,
  site_url,
  domain,
  total_clicks,
  total_impressions,
  average_ctr,
  average_position,
  organic_traffic,
  top_queries,
  top_pages,
  daily_data,
  backlinks,
  lighthouse,
  date_range_start,
  date_range_end,
  pagespeed_data,
  technical_seo_data,
  puppeteer_data,
  created_at,
  updated_at,
  last_fetched_at
)
SELECT 
  '8354554e-b321-4306-acd9-47fb5be55475' as user_id,
  site_url,
  domain,
  total_clicks,
  total_impressions,
  average_ctr,
  average_position,
  organic_traffic,
  top_queries,
  top_pages,
  daily_data,
  backlinks,
  lighthouse,
  date_range_start,
  date_range_end,
  pagespeed_data,
  technical_seo_data,
  puppeteer_data,
  NOW() as created_at,
  NOW() as updated_at,
  NOW() as last_fetched_at
FROM public.search_console_cache
WHERE user_id = '3356f634-bf7e-4cbf-9000-ca23f678a6f8'
ON CONFLICT (user_id) DO UPDATE SET
  site_url = EXCLUDED.site_url,
  domain = EXCLUDED.domain,
  total_clicks = EXCLUDED.total_clicks,
  total_impressions = EXCLUDED.total_impressions,
  average_ctr = EXCLUDED.average_ctr,
  average_position = EXCLUDED.average_position,
  organic_traffic = EXCLUDED.organic_traffic,
  top_queries = EXCLUDED.top_queries,
  top_pages = EXCLUDED.top_pages,
  daily_data = EXCLUDED.daily_data,
  backlinks = EXCLUDED.backlinks,
  lighthouse = EXCLUDED.lighthouse,
  date_range_start = EXCLUDED.date_range_start,
  date_range_end = EXCLUDED.date_range_end,
  pagespeed_data = EXCLUDED.pagespeed_data,
  technical_seo_data = EXCLUDED.technical_seo_data,
  puppeteer_data = EXCLUDED.puppeteer_data,
  updated_at = NOW(),
  last_fetched_at = NOW();

-- 2. Copy Google Analytics Cache
INSERT INTO public.google_analytics_cache (
  user_id,
  property_id,
  active_users,
  sessions,
  bounce_rate,
  avg_session_duration,
  page_views,
  conversions,
  revenue,
  total_social_sessions,
  total_social_users,
  total_social_conversions,
  social_conversion_rate,
  social_traffic_percentage,
  top_social_sources,
  created_at,
  updated_at,
  last_fetched_at
)
SELECT 
  '8354554e-b321-4306-acd9-47fb5be55475' as user_id,
  property_id,
  active_users,
  sessions,
  bounce_rate,
  avg_session_duration,
  page_views,
  conversions,
  revenue,
  total_social_sessions,
  total_social_users,
  total_social_conversions,
  social_conversion_rate,
  social_traffic_percentage,
  top_social_sources,
  NOW() as created_at,
  NOW() as updated_at,
  NOW() as last_fetched_at
FROM public.google_analytics_cache
WHERE user_id = '3356f634-bf7e-4cbf-9000-ca23f678a6f8'
ON CONFLICT (user_id) DO UPDATE SET
  property_id = EXCLUDED.property_id,
  active_users = EXCLUDED.active_users,
  sessions = EXCLUDED.sessions,
  bounce_rate = EXCLUDED.bounce_rate,
  avg_session_duration = EXCLUDED.avg_session_duration,
  page_views = EXCLUDED.page_views,
  conversions = EXCLUDED.conversions,
  revenue = EXCLUDED.revenue,
  total_social_sessions = EXCLUDED.total_social_sessions,
  total_social_users = EXCLUDED.total_social_users,
  total_social_conversions = EXCLUDED.total_social_conversions,
  social_conversion_rate = EXCLUDED.social_conversion_rate,
  social_traffic_percentage = EXCLUDED.social_traffic_percentage,
  top_social_sources = EXCLUDED.top_social_sources,
  updated_at = NOW(),
  last_fetched_at = NOW();

-- 3. Copy Lighthouse Cache
INSERT INTO public.lighthouse_cache (
  user_id,
  domain,
  lighthouse_data,
  created_at,
  updated_at,
  last_fetched_at
)
SELECT 
  '8354554e-b321-4306-acd9-47fb5be55475' as user_id,
  domain,
  lighthouse_data,
  NOW() as created_at,
  NOW() as updated_at,
  NOW() as last_fetched_at
FROM public.lighthouse_cache
WHERE user_id = '3356f634-bf7e-4cbf-9000-ca23f678a6f8';

-- 4. Copy Social Media Cache
INSERT INTO public.social_media_cache (
  user_email,
  platform,
  account_id,
  account_name,
  username,
  profile_url,
  engagement_data,
  follower_count,
  follower_growth,
  top_posts,
  reputation_data,
  period,
  data_available,
  error_message,
  created_at,
  updated_at,
  last_fetched_at,
  expires_at
)
SELECT 
  (SELECT email FROM public.users_table WHERE id = '8354554e-b321-4306-acd9-47fb5be55475') as user_email,
  platform,
  account_id,
  account_name,
  username,
  profile_url,
  engagement_data,
  follower_count,
  follower_growth,
  top_posts,
  reputation_data,
  period,
  data_available,
  error_message,
  NOW() as created_at,
  NOW() as updated_at,
  NOW() as last_fetched_at,
  NOW() + INTERVAL '7 days' as expires_at
FROM public.social_media_cache
WHERE user_email = (SELECT email FROM public.users_table WHERE id = '3356f634-bf7e-4cbf-9000-ca23f678a6f8');

-- 5. Copy OAuth Tokens (so they can connect social media)
INSERT INTO public.oauth_tokens (
  user_email,
  provider,
  access_token,
  refresh_token,
  expires_at,
  scope,
  provider_user_id,
  provider_user_name,
  provider_user_email,
  created_at,
  updated_at
)
SELECT 
  (SELECT email FROM public.users_table WHERE id = '8354554e-b321-4306-acd9-47fb5be55475') as user_email,
  provider,
  access_token,
  refresh_token,
  expires_at,
  scope,
  provider_user_id,
  provider_user_name,
  provider_user_email,
  NOW() as created_at,
  NOW() as updated_at
FROM public.oauth_tokens
WHERE user_email = (SELECT email FROM public.users_table WHERE id = '3356f634-bf7e-4cbf-9000-ca23f678a6f8');

-- 6. Copy Social Connections V2
INSERT INTO public.social_connections_v2 (
  user_email,
  platform,
  is_connected,
  connection_status,
  provider_user_id,
  provider_username,
  provider_email,
  account_name,
  profile_url,
  scopes_granted,
  token_expires_at,
  last_token_refresh,
  platform_metadata,
  created_at,
  updated_at,
  connected_at
)
SELECT 
  (SELECT email FROM public.users_table WHERE id = '8354554e-b321-4306-acd9-47fb5be55475') as user_email,
  platform,
  is_connected,
  connection_status,
  provider_user_id,
  provider_username,
  provider_email,
  account_name,
  profile_url,
  scopes_granted,
  token_expires_at,
  last_token_refresh,
  platform_metadata,
  NOW() as created_at,
  NOW() as updated_at,
  NOW() as connected_at
FROM public.social_connections_v2
WHERE user_email = (SELECT email FROM public.users_table WHERE id = '3356f634-bf7e-4cbf-9000-ca23f678a6f8');

-- 7. Copy Competitor Cache (with updated expires_at)
INSERT INTO public.competitor_cache (
  user_id,
  user_domain,
  competitor_domain,
  lighthouse_data,
  pagespeed_data,
  technical_seo_data,
  puppeteer_data,
  backlinks_data,
  analysis_status,
  error_details,
  google_ads_data,
  meta_ads_data,
  instagram_data,
  facebook_data,
  traffic_data,
  content_changes_data,
  content_updates_data,
  full_result,
  created_at,
  updated_at,
  expires_at
)
SELECT 
  '8354554e-b321-4306-acd9-47fb5be55475' as user_id,
  user_domain,
  competitor_domain,
  lighthouse_data,
  pagespeed_data,
  technical_seo_data,
  puppeteer_data,
  backlinks_data,
  analysis_status,
  error_details,
  google_ads_data,
  meta_ads_data,
  instagram_data,
  facebook_data,
  traffic_data,
  content_changes_data,
  content_updates_data,
  full_result,
  NOW() as created_at,
  NOW() as updated_at,
  NOW() + INTERVAL '7 days' as expires_at
FROM public.competitor_cache
WHERE user_id = '3356f634-bf7e-4cbf-9000-ca23f678a6f8';

-- 8. Copy User Business Info
INSERT INTO public.user_business_info (
  user_email,
  business_name,
  business_domain,
  business_description,
  business_industry,
  facebook_handle,
  instagram_handle,
  competitors,
  setup_completed,
  onboarding_step,
  created_at,
  updated_at
)
SELECT 
  (SELECT email FROM public.users_table WHERE id = '8354554e-b321-4306-acd9-47fb5be55475') as user_email,
  business_name,
  business_domain,
  business_description,
  business_industry,
  facebook_handle,
  instagram_handle,
  competitors,
  setup_completed,
  onboarding_step,
  NOW() as created_at,
  NOW() as updated_at
FROM public.user_business_info
WHERE user_email = (SELECT email FROM public.users_table WHERE id = '3356f634-bf7e-4cbf-9000-ca23f678a6f8')
ON CONFLICT (user_email) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  business_domain = EXCLUDED.business_domain,
  business_description = EXCLUDED.business_description,
  business_industry = EXCLUDED.business_industry,
  facebook_handle = EXCLUDED.facebook_handle,
  instagram_handle = EXCLUDED.instagram_handle,
  competitors = EXCLUDED.competitors,
  setup_completed = EXCLUDED.setup_completed,
  onboarding_step = EXCLUDED.onboarding_step,
  updated_at = NOW();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check copied data counts
SELECT 
  'Search Console Cache' as table_name,
  COUNT(*) as records
FROM public.search_console_cache
WHERE user_id = '8354554e-b321-4306-acd9-47fb5be55475'

UNION ALL

SELECT 
  'Google Analytics Cache' as table_name,
  COUNT(*) as records
FROM public.google_analytics_cache
WHERE user_id = '8354554e-b321-4306-acd9-47fb5be55475'

UNION ALL

SELECT 
  'Lighthouse Cache' as table_name,
  COUNT(*) as records
FROM public.lighthouse_cache
WHERE user_id = '8354554e-b321-4306-acd9-47fb5be55475'

UNION ALL

SELECT 
  'Social Media Cache' as table_name,
  COUNT(*) as records
FROM public.social_media_cache
WHERE user_email = (SELECT email FROM public.users_table WHERE id = '8354554e-b321-4306-acd9-47fb5be55475')

UNION ALL

SELECT 
  'OAuth Tokens' as table_name,
  COUNT(*) as records
FROM public.oauth_tokens
WHERE user_email = (SELECT email FROM public.users_table WHERE id = '8354554e-b321-4306-acd9-47fb5be55475')

UNION ALL

SELECT 
  'Social Connections V2' as table_name,
  COUNT(*) as records
FROM public.social_connections_v2
WHERE user_email = (SELECT email FROM public.users_table WHERE id = '8354554e-b321-4306-acd9-47fb5be55475')

UNION ALL

SELECT 
  'Competitor Cache' as table_name,
  COUNT(*) as records
FROM public.competitor_cache
WHERE user_id = '8354554e-b321-4306-acd9-47fb5be55475'

UNION ALL

SELECT 
  'User Business Info' as table_name,
  COUNT(*) as records
FROM public.user_business_info
WHERE user_email = (SELECT email FROM public.users_table WHERE id = '8354554e-b321-4306-acd9-47fb5be55475');

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ All cached data copied successfully! Your friend can now login to the test account and see all metrics.' as message;
