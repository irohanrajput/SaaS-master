-- Add full_result column to store complete analysis (both sites + comparison)
-- This makes cache hits truly instant by avoiding re-fetching your site data
-- Run this in Supabase SQL Editor

-- Add the new column
ALTER TABLE public.competitor_cache 
ADD COLUMN IF NOT EXISTS full_result jsonb;

-- Add index for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_competitor_cache_full_result 
ON public.competitor_cache USING GIN (full_result);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'competitor_cache' 
AND column_name = 'full_result';