-- User Business Information Table
-- Stores user's business details, social media handles, and competitor information

CREATE TABLE IF NOT EXISTS public.user_business_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  
  -- User's Business Information
  business_name varchar(255),
  business_domain varchar(255) NOT NULL,
  business_description text,
  business_industry varchar(100),
  
  -- User's Social Media Handles (Facebook & Instagram only)
  facebook_handle varchar(255),
  instagram_handle varchar(255),
  
  -- Competitor Information (JSON array)
  -- Each competitor: { name, domain, facebook, instagram, notes }
  competitors jsonb DEFAULT '[]'::jsonb,
  
  -- Setup Status
  setup_completed boolean DEFAULT false,
  onboarding_step integer DEFAULT 0,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Constraints
  CONSTRAINT user_business_info_user_email_key UNIQUE (user_email),
  CONSTRAINT user_business_info_user_email_fkey FOREIGN KEY (user_email) 
    REFERENCES public.users_table(email) ON DELETE CASCADE
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_business_info_email ON public.user_business_info(user_email);
CREATE INDEX IF NOT EXISTS idx_user_business_info_domain ON public.user_business_info(business_domain);

-- Comments for documentation
COMMENT ON TABLE public.user_business_info IS 'Stores user business information and competitor data for intelligence features';
COMMENT ON COLUMN public.user_business_info.competitors IS 'JSON array of competitor objects with domain and social handles';
COMMENT ON COLUMN public.user_business_info.setup_completed IS 'Whether user has completed the business info setup wizard';
