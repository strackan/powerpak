-- Move Founder OS tables from custom schema to public schema
-- Run this in Supabase SQL Editor

-- First, let's check which schema the tables are in
-- Run this query to see your current schema:
-- SELECT table_schema, table_name FROM information_schema.tables WHERE table_name LIKE 'founder_%';

-- Replace 'your_custom_schema' with your actual schema name (e.g., 'founder_os')
-- If you're not sure, run the query above first to find it

-- ============================================================================
-- STEP 1: Move tables to public schema
-- ============================================================================

-- Option A: If tables are in a custom schema like 'founder_os'
-- Uncomment and replace 'founder_os' with your actual schema name:

/*
ALTER TABLE founder_os.founder_contexts SET SCHEMA public;
ALTER TABLE founder_os.founder_goals SET SCHEMA public;
ALTER TABLE founder_os.founder_tasks SET SCHEMA public;
ALTER TABLE founder_os.founder_task_goal_links SET SCHEMA public;
ALTER TABLE founder_os.founder_daily_plans SET SCHEMA public;
ALTER TABLE founder_os.founder_relationships SET SCHEMA public;
ALTER TABLE founder_os.founder_check_ins SET SCHEMA public;
*/

-- ============================================================================
-- STEP 2: Verify tables are now in public schema
-- ============================================================================

-- Run this to confirm all tables are in public:
SELECT schemaname, tablename
FROM pg_tables
WHERE tablename LIKE 'founder_%'
ORDER BY tablename;

-- You should see all 7 tables with schemaname = 'public'

-- ============================================================================
-- STEP 3: Verify RLS is still enabled
-- ============================================================================

-- Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename LIKE 'founder_%';

-- All should show rowsecurity = true

-- ============================================================================
-- STEP 4: Test a query
-- ============================================================================

-- This should work now:
SELECT COUNT(*) FROM public.founder_tasks;
