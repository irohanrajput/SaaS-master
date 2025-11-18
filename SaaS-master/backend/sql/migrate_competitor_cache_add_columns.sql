-- Migration: Add full competitor analysis caching fields
-- Safe to run multiple times in Supabase SQL editor

-- 1) Ensure composite uniqueness (if your base table missed it)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'competitor_cache_unique'
  ) THEN
    ALTER TABLE public.competitor_cache
    ADD CONSTRAINT competitor_cache_unique UNIQUE (user_id, user_domain, competitor_domain);
  END IF;
END $$;

-- 2) Add new JSONB columns for additional cached data
ALTER TABLE public.competitor_cache
  ADD COLUMN IF NOT EXISTS google_ads_data jsonb,
  ADD COLUMN IF NOT EXISTS meta_ads_data jsonb,
  ADD COLUMN IF NOT EXISTS instagram_data jsonb,
  ADD COLUMN IF NOT EXISTS facebook_data jsonb,
  ADD COLUMN IF NOT EXISTS traffic_data jsonb,
  ADD COLUMN IF NOT EXISTS content_changes_data jsonb,
  ADD COLUMN IF NOT EXISTS content_updates_data jsonb;

-- 3) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_competitor_cache_user_pair
  ON public.competitor_cache (user_id, user_domain, competitor_domain);

CREATE INDEX IF NOT EXISTS idx_competitor_cache_expires_at
  ON public.competitor_cache (expires_at);

-- 4) Optional: jsonb GIN indexes if you will query inside these columns (commented)
-- CREATE INDEX IF NOT EXISTS idx_competitor_cache_google_ads_gin ON public.competitor_cache USING GIN (google_ads_data);
-- CREATE INDEX IF NOT EXISTS idx_competitor_cache_meta_ads_gin   ON public.competitor_cache USING GIN (meta_ads_data);
-- CREATE INDEX IF NOT EXISTS idx_competitor_cache_instagram_gin  ON public.competitor_cache USING GIN (instagram_data);
-- CREATE INDEX IF NOT EXISTS idx_competitor_cache_facebook_gin   ON public.competitor_cache USING GIN (facebook_data);
-- CREATE INDEX IF NOT EXISTS idx_competitor_cache_traffic_gin    ON public.competitor_cache USING GIN (traffic_data);
-- CREATE INDEX IF NOT EXISTS idx_competitor_cache_changes_gin    ON public.competitor_cache USING GIN (content_changes_data);
-- CREATE INDEX IF NOT EXISTS idx_competitor_cache_updates_gin    ON public.competitor_cache USING GIN (content_updates_data);