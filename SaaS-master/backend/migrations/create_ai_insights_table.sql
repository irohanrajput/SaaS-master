-- Migration: AI Insights Table Schema
-- Date: 2025-11-07
-- Description: Create ai_insights table for storing AI-generated business recommendations

-- Create ai_insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  
  -- AI-generated insights
  insights JSONB NOT NULL,
  
  -- Snapshot of metrics used for generation
  metrics_snapshot JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_email ON ai_insights(user_email);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON ai_insights(created_at DESC);

-- Enable Row Level Security
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY ai_insights_user_select ON ai_insights
  FOR SELECT
  USING (auth.uid() = user_id OR user_email = auth.email());

CREATE POLICY ai_insights_user_insert ON ai_insights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_email = auth.email());

CREATE POLICY ai_insights_user_delete ON ai_insights
  FOR DELETE
  USING (auth.uid() = user_id OR user_email = auth.email());

-- Add comments
COMMENT ON TABLE ai_insights IS 'Stores AI-generated business insights and recommendations';
COMMENT ON COLUMN ai_insights.insights IS 'AI-generated recommendations in JSON format';
COMMENT ON COLUMN ai_insights.metrics_snapshot IS 'Snapshot of metrics used to generate insights';

-- Migration complete
