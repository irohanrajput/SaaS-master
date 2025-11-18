-- Fix Competitor Cache Table ONLY - Safe version
-- Run this in Supabase SQL Editor

-- 1. Drop the existing foreign key constraint that references auth.users
ALTER TABLE public.competitor_cache 
DROP CONSTRAINT IF EXISTS fk_competitor_cache_user;

-- 2. Change user_id column type to TEXT to match users_table.id
ALTER TABLE public.competitor_cache 
ALTER COLUMN user_id TYPE TEXT;

-- 3. Add the correct foreign key constraint to users_table
ALTER TABLE public.competitor_cache 
ADD CONSTRAINT fk_competitor_cache_user 
FOREIGN KEY (user_id) REFERENCES public.users_table(id) ON DELETE CASCADE;

-- 4. Add indexes for fast competitor cache lookups (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_competitor_cache_lookup 
ON public.competitor_cache(user_id, user_domain, competitor_domain);

CREATE INDEX IF NOT EXISTS idx_competitor_cache_expires 
ON public.competitor_cache(expires_at);

-- 5. Add unique constraint to prevent duplicate entries (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_competitor_analysis' 
        AND table_name = 'competitor_cache'
    ) THEN
        ALTER TABLE public.competitor_cache 
        ADD CONSTRAINT unique_competitor_analysis 
        UNIQUE (user_id, user_domain, competitor_domain);
    END IF;
END $$;

-- 6. Clean up any expired competitor cache entries
DELETE FROM public.competitor_cache 
WHERE expires_at < now();

-- 7. Clean up entries with invalid user_ids (not in users_table)
DELETE FROM public.competitor_cache 
WHERE user_id NOT IN (SELECT id FROM public.users_table);

-- 8. Verify the fix worked
SELECT 
    'competitor_cache' as table_name,
    COUNT(*) as total_entries,
    COUNT(*) FILTER (WHERE expires_at > now()) as active_entries,
    COUNT(*) FILTER (WHERE expires_at <= now()) as expired_entries
FROM public.competitor_cache;