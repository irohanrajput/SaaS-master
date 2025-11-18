-- Fix Competitor Cache Table for Proper Caching
-- Run this in Supabase SQL Editor

-- 1. First, let's check if we have any existing data and back it up
-- (Optional: You can skip this if you don't have important cached data)

-- 2. Drop the existing foreign key constraint that references auth.users
ALTER TABLE public.competitor_cache 
DROP CONSTRAINT IF EXISTS fk_competitor_cache_user;

-- 3. Change user_id column type to TEXT to match users_table.id
ALTER TABLE public.competitor_cache 
ALTER COLUMN user_id TYPE TEXT;

-- 4. Add the correct foreign key constraint to users_table
ALTER TABLE public.competitor_cache 
ADD CONSTRAINT fk_competitor_cache_user 
FOREIGN KEY (user_id) REFERENCES public.users_table(id) ON DELETE CASCADE;

-- 5. Add indexes for fast lookups (this is crucial for performance)
CREATE INDEX IF NOT EXISTS idx_competitor_cache_user_domains 
ON public.competitor_cache(user_id, user_domain, competitor_domain);

CREATE INDEX IF NOT EXISTS idx_competitor_cache_expires_at 
ON public.competitor_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_competitor_cache_updated_at 
ON public.competitor_cache(updated_at DESC);

-- 6. Add a unique constraint to prevent duplicate cache entries
ALTER TABLE public.competitor_cache 
ADD CONSTRAINT unique_competitor_cache 
UNIQUE (user_id, user_domain, competitor_domain);

-- 7. Update the table to ensure proper defaults and constraints
ALTER TABLE public.competitor_cache 
ALTER COLUMN created_at SET DEFAULT now(),
ALTER COLUMN updated_at SET DEFAULT now();

-- 8. Add a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_competitor_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_competitor_cache_updated_at ON public.competitor_cache;
CREATE TRIGGER trigger_competitor_cache_updated_at
    BEFORE UPDATE ON public.competitor_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_competitor_cache_updated_at();

-- 10. Clean up any expired cache entries
DELETE FROM public.competitor_cache 
WHERE expires_at < now();

-- 11. Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'competitor_cache' 
AND table_schema = 'public'
ORDER BY ordinal_position;