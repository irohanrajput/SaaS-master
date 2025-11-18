-- Add User Site Cache Table for Better Performance
-- This table will cache the user's own site data to avoid re-fetching
-- Run this in Supabase SQL Editor

-- Create user_site_cache table
CREATE TABLE IF NOT EXISTS public.user_site_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  domain text NOT NULL,
  lighthouse_data jsonb,
  pagespeed_data jsonb,
  technical_seo_data jsonb,
  puppeteer_data jsonb,
  backlinks_data jsonb,
  google_ads_data jsonb,
  meta_ads_data jsonb,
  instagram_data jsonb,
  facebook_data jsonb,
  traffic_data jsonb,
  content_changes_data jsonb,
  content_updates_data jsonb,
  analytics_data jsonb,
  search_console_data jsonb,
  analysis_status character varying DEFAULT 'completed'::character varying,
  error_details text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  CONSTRAINT user_site_cache_pkey PRIMARY KEY (id),
  CONSTRAINT fk_user_site_cache_user FOREIGN KEY (user_id) REFERENCES public.users_table(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_site_cache UNIQUE (user_id, domain)
);

-- Add indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_site_cache_user_domain 
ON public.user_site_cache(user_id, domain);

CREATE INDEX IF NOT EXISTS idx_user_site_cache_expires_at 
ON public.user_site_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_site_cache_updated_at 
ON public.user_site_cache(updated_at DESC);

-- Add trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_user_site_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_user_site_cache_updated_at
    BEFORE UPDATE ON public.user_site_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_user_site_cache_updated_at();

-- Enable Row Level Security (RLS) for security
ALTER TABLE public.user_site_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS policy so users can only access their own cached data
CREATE POLICY "Users can access their own site cache" ON public.user_site_cache
    FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- Grant necessary permissions
GRANT ALL ON public.user_site_cache TO authenticated;
GRANT ALL ON public.user_site_cache TO service_role;