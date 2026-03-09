-- Up Migration: Initial schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  firebase_uid VARCHAR(128) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  investment_style VARCHAR(20) NOT NULL DEFAULT 'long_term'
    CHECK (investment_style IN ('short_term', 'swing', 'long_term', 'dividend')),
  risk_tolerance VARCHAR(20) NOT NULL DEFAULT 'balanced'
    CHECK (risk_tolerance IN ('conservative', 'balanced', 'aggressive')),
  experience_level VARCHAR(20) NOT NULL DEFAULT 'beginner'
    CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  interested_sectors TEXT[] NOT NULL DEFAULT '{}',
  watch_themes TEXT[] NOT NULL DEFAULT '{}',
  preference_model JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Watchlists
CREATE TABLE watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE watchlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  watchlist_id UUID NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  market VARCHAR(5) NOT NULL CHECK (market IN ('US', 'JP')),
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (watchlist_id, symbol)
);

-- Daily Research
CREATE TABLE daily_research (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  research_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  agent_statuses JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, research_date)
);

-- News Results
CREATE TABLE news_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  research_id UUID NOT NULL REFERENCES daily_research(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  source_url TEXT NOT NULL,
  related_symbols TEXT[] NOT NULL DEFAULT '{}',
  impact_level VARCHAR(10) NOT NULL CHECK (impact_level IN ('high', 'medium', 'low')),
  relevance_score REAL NOT NULL DEFAULT 0.0,
  published_at TIMESTAMPTZ NOT NULL
);

-- Stock Results
CREATE TABLE stock_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  research_id UUID NOT NULL REFERENCES daily_research(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  closing_price REAL NOT NULL,
  change_percent REAL NOT NULL,
  trend VARCHAR(10) NOT NULL CHECK (trend IN ('bullish', 'bearish', 'neutral')),
  indicators JSONB NOT NULL DEFAULT '{}',
  price_history JSONB NOT NULL DEFAULT '[]',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sentiment Results
CREATE TABLE sentiment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  research_id UUID NOT NULL REFERENCES daily_research(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  sentiment_score REAL NOT NULL,
  sentiment_label VARCHAR(20) NOT NULL
    CHECK (sentiment_label IN ('very_bearish', 'bearish', 'neutral', 'bullish', 'very_bullish')),
  divergence_signal TEXT,
  market_overall_sentiment REAL NOT NULL,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Risk Assessment
CREATE TABLE risk_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  research_id UUID NOT NULL UNIQUE REFERENCES daily_research(id) ON DELETE CASCADE,
  overall_risk_score REAL NOT NULL,
  sector_concentration JSONB NOT NULL DEFAULT '[]',
  volatility_ranks JSONB NOT NULL DEFAULT '[]',
  risk_tolerance_alignment VARCHAR(20) NOT NULL
    CHECK (risk_tolerance_alignment IN ('aligned', 'over_risk', 'under_risk')),
  warnings TEXT[] NOT NULL DEFAULT '{}',
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Personalized Reports
CREATE TABLE personalized_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  research_id UUID NOT NULL UNIQUE REFERENCES daily_research(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  risk_notes TEXT NOT NULL,
  tone VARCHAR(20) NOT NULL CHECK (tone IN ('beginner_friendly', 'technical', 'concise')),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Investment Suggestions
CREATE TABLE investment_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES personalized_reports(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  action VARCHAR(10) NOT NULL CHECK (action IN ('buy', 'hold', 'skip')),
  confidence REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  reasoning TEXT NOT NULL,
  referenced_news_ids UUID[] NOT NULL DEFAULT '{}',
  sentiment_basis TEXT NOT NULL,
  risk_basis TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Feedback
CREATE TABLE user_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  suggestion_id UUID NOT NULL REFERENCES investment_suggestions(id) ON DELETE CASCADE,
  helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, suggestion_id)
);

-- Indexes
CREATE INDEX idx_daily_research_user_date ON daily_research(user_id, research_date DESC);
CREATE INDEX idx_news_results_research ON news_results(research_id);
CREATE INDEX idx_stock_results_research ON stock_results(research_id);
CREATE INDEX idx_sentiment_results_research ON sentiment_results(research_id);
CREATE INDEX idx_investment_suggestions_report ON investment_suggestions(report_id);
CREATE INDEX idx_user_feedback_user ON user_feedback(user_id);
