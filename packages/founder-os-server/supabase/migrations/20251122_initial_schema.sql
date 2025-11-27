-- Founder OS Schema
-- Personal Chief of Staff data layer for executive functioning
-- Created: 2025-11-22

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CONTEXTS TABLE
-- Project/area tags for organizing tasks and goals (e.g., Renubu, Good Hang, Family)
-- ============================================================================
CREATE TABLE founder_contexts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT, -- Hex color for UI (e.g., #FF5733)
  icon TEXT, -- Emoji or icon name (e.g., 🚀 or rocket)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups by user
CREATE INDEX idx_founder_contexts_user_id ON founder_contexts(user_id);

-- ============================================================================
-- GOALS TABLE
-- Hierarchical OKRs (yearly → quarterly → monthly → weekly)
-- ============================================================================
CREATE TABLE founder_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type VARCHAR(20) CHECK (type IN ('objective', 'key_result')),
  parent_id UUID REFERENCES founder_goals(id) ON DELETE SET NULL, -- For hierarchical goals
  timeframe VARCHAR(20) CHECK (timeframe IN ('yearly', 'quarterly', 'monthly', 'weekly')),
  target_value NUMERIC, -- e.g., 100000 for $100k revenue
  current_value NUMERIC DEFAULT 0, -- e.g., 45000 for current progress
  unit TEXT, -- e.g., '$', 'users', 'meetings', '%'
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX idx_founder_goals_user_id ON founder_goals(user_id);
CREATE INDEX idx_founder_goals_timeframe ON founder_goals(timeframe);
CREATE INDEX idx_founder_goals_parent_id ON founder_goals(parent_id);

-- ============================================================================
-- TASKS TABLE
-- Task management with priority, status, context tags, and energy levels
-- ============================================================================
CREATE TABLE founder_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'blocked', 'done', 'archived')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  context_tags TEXT[], -- Array of context names (e.g., ['work', 'renubu', 'urgent'])
  energy_level VARCHAR(20) CHECK (energy_level IN ('high', 'medium', 'low')), -- Required energy to complete
  estimated_minutes INTEGER, -- Estimated time to complete
  due_date DATE,
  completed_at TIMESTAMPTZ,
  blocked_reason TEXT, -- Why is this task blocked?
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_founder_tasks_user_id ON founder_tasks(user_id);
CREATE INDEX idx_founder_tasks_status ON founder_tasks(status);
CREATE INDEX idx_founder_tasks_priority ON founder_tasks(priority);
CREATE INDEX idx_founder_tasks_due_date ON founder_tasks(due_date);
CREATE INDEX idx_founder_tasks_context_tags ON founder_tasks USING GIN(context_tags);

-- ============================================================================
-- TASK-GOAL LINKS (Junction Table)
-- Links tasks to goals for tracking progress toward objectives
-- ============================================================================
CREATE TABLE founder_task_goal_links (
  task_id UUID NOT NULL REFERENCES founder_tasks(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES founder_goals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (task_id, goal_id)
);

-- Indexes for bidirectional queries
CREATE INDEX idx_task_goal_links_task_id ON founder_task_goal_links(task_id);
CREATE INDEX idx_task_goal_links_goal_id ON founder_task_goal_links(goal_id);

-- ============================================================================
-- DAILY PLANS TABLE
-- Morning intentions and evening reflections for each day
-- ============================================================================
CREATE TABLE founder_daily_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  morning_intention TEXT, -- What do you want to accomplish today?
  time_blocks JSONB, -- Structured day plan (e.g., [{"start": "09:00", "end": "11:00", "activity": "Deep work on proposal"}])
  evening_reflection TEXT, -- What did you learn? What went well?
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10), -- How energized did you feel? (1-10)
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10), -- How stressed did you feel? (1-10)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, plan_date) -- One plan per user per day
);

-- Indexes for date-based lookups
CREATE INDEX idx_founder_daily_plans_user_id ON founder_daily_plans(user_id);
CREATE INDEX idx_founder_daily_plans_plan_date ON founder_daily_plans(plan_date);

-- ============================================================================
-- RELATIONSHIPS TABLE
-- Track key relationships (investors, team, family) and communication cadence
-- ============================================================================
CREATE TABLE founder_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Becky", "Scott Leese"
  relationship TEXT, -- e.g., "investor", "co-founder", "friend", "advisor"
  last_contact DATE, -- When did you last connect?
  contact_frequency_days INTEGER, -- Desired contact every N days
  notes TEXT, -- Recent conversations, concerns, context
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'concerned', 'urgent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lookups and sorting
CREATE INDEX idx_founder_relationships_user_id ON founder_relationships(user_id);
CREATE INDEX idx_founder_relationships_last_contact ON founder_relationships(last_contact);

-- ============================================================================
-- CHECK-INS TABLE
-- Qualitative mood/energy/gratitude tracking for self-awareness
-- ============================================================================
CREATE TABLE founder_check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mood VARCHAR(20) CHECK (mood IN ('great', 'good', 'okay', 'stressed', 'overwhelmed')),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10), -- 1-10 scale
  gratitude TEXT, -- What are you grateful for?
  challenges TEXT, -- What challenges are you facing?
  wins TEXT, -- What wins did you have?
  needs_support BOOLEAN DEFAULT FALSE, -- Flag for when feeling overwhelmed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for temporal queries
CREATE INDEX idx_founder_check_ins_user_id ON founder_check_ins(user_id);
CREATE INDEX idx_founder_check_ins_check_in_date ON founder_check_ins(check_in_date);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- Ensure users can only access their own data
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE founder_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_task_goal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_check_ins ENABLE ROW LEVEL SECURITY;

-- Contexts policies
CREATE POLICY "Users can view own contexts" ON founder_contexts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contexts" ON founder_contexts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contexts" ON founder_contexts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contexts" ON founder_contexts FOR DELETE USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON founder_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON founder_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON founder_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON founder_goals FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON founder_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON founder_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON founder_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON founder_tasks FOR DELETE USING (auth.uid() = user_id);

-- Task-goal links policies (based on task ownership)
CREATE POLICY "Users can view own task-goal links" ON founder_task_goal_links FOR SELECT
  USING (EXISTS (SELECT 1 FROM founder_tasks WHERE id = task_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own task-goal links" ON founder_task_goal_links FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM founder_tasks WHERE id = task_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own task-goal links" ON founder_task_goal_links FOR DELETE
  USING (EXISTS (SELECT 1 FROM founder_tasks WHERE id = task_id AND user_id = auth.uid()));

-- Daily plans policies
CREATE POLICY "Users can view own daily plans" ON founder_daily_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily plans" ON founder_daily_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily plans" ON founder_daily_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily plans" ON founder_daily_plans FOR DELETE USING (auth.uid() = user_id);

-- Relationships policies
CREATE POLICY "Users can view own relationships" ON founder_relationships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own relationships" ON founder_relationships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own relationships" ON founder_relationships FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own relationships" ON founder_relationships FOR DELETE USING (auth.uid() = user_id);

-- Check-ins policies
CREATE POLICY "Users can view own check-ins" ON founder_check_ins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own check-ins" ON founder_check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own check-ins" ON founder_check_ins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own check-ins" ON founder_check_ins FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_founder_contexts_updated_at BEFORE UPDATE ON founder_contexts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_founder_goals_updated_at BEFORE UPDATE ON founder_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_founder_tasks_updated_at BEFORE UPDATE ON founder_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_founder_daily_plans_updated_at BEFORE UPDATE ON founder_daily_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_founder_relationships_updated_at BEFORE UPDATE ON founder_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE founder_contexts IS 'Project/area tags for organizing tasks and goals';
COMMENT ON TABLE founder_goals IS 'Hierarchical OKRs with progress tracking';
COMMENT ON TABLE founder_tasks IS 'Task management with context, priority, and energy levels';
COMMENT ON TABLE founder_task_goal_links IS 'Links tasks to goals for progress tracking';
COMMENT ON TABLE founder_daily_plans IS 'Daily intentions and reflections';
COMMENT ON TABLE founder_relationships IS 'Key relationship tracking with communication cadence';
COMMENT ON TABLE founder_check_ins IS 'Qualitative mood and energy tracking';
