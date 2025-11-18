-- Migration: Reports Table Schema
-- Date: 2025-11-07
-- Description: Create reports table for storing generated reports (dashboard, competitor, social, SEO)

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  
  -- Report metadata
  report_type TEXT NOT NULL CHECK (report_type IN ('dashboard', 'competitor', 'social', 'seo', 'overall')),
  report_title TEXT NOT NULL,
  report_period_start TIMESTAMP WITH TIME ZONE,
  report_period_end TIMESTAMP WITH TIME ZONE,
  
  -- Report data (JSONB for flexible structure)
  report_data JSONB NOT NULL,
  
  -- Metrics summary (for quick filtering/sorting)
  metrics_summary JSONB DEFAULT '{}'::jsonb,
  
  -- File information (if PDF was generated)
  pdf_url TEXT,
  pdf_generated_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT DEFAULT 'generated' CHECK (status IN ('generating', 'generated', 'failed', 'expired')),
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days'),
  
  -- Metadata
  file_size INTEGER, -- in bytes
  page_count INTEGER
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_email ON reports(user_email);
CREATE INDEX IF NOT EXISTS idx_reports_report_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_expires_at ON reports(expires_at);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_reports_user_type_date 
ON reports(user_id, report_type, created_at DESC);

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own reports
CREATE POLICY reports_user_select ON reports
  FOR SELECT
  USING (auth.uid() = user_id OR user_email = auth.email());

-- RLS Policy: Users can insert their own reports
CREATE POLICY reports_user_insert ON reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_email = auth.email());

-- RLS Policy: Users can update their own reports
CREATE POLICY reports_user_update ON reports
  FOR UPDATE
  USING (auth.uid() = user_id OR user_email = auth.email());

-- RLS Policy: Users can delete their own reports
CREATE POLICY reports_user_delete ON reports
  FOR DELETE
  USING (auth.uid() = user_id OR user_email = auth.email());

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER trigger_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_reports_updated_at();

-- Function to clean up expired reports (can be called by a scheduled job)
CREATE OR REPLACE FUNCTION cleanup_expired_reports()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM reports
  WHERE expires_at < NOW() AND status = 'generated';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE reports IS 'Stores generated reports for users (dashboard, competitor, social media, SEO)';
COMMENT ON COLUMN reports.report_type IS 'Type of report: dashboard, competitor, social, seo, or overall';
COMMENT ON COLUMN reports.report_data IS 'Complete report data in JSON format';
COMMENT ON COLUMN reports.metrics_summary IS 'Key metrics summary for quick access and filtering';
COMMENT ON COLUMN reports.pdf_url IS 'URL to generated PDF file (if applicable)';
COMMENT ON COLUMN reports.expires_at IS 'Report expiration date (default 90 days)';

-- Migration complete
