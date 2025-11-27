-- Quick Fix: Move Founder OS tables to public schema
--
-- INSTRUCTIONS:
-- 1. Find your custom schema name by running this first:
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_name LIKE 'founder_%';

-- 2. Replace 'CUSTOM_SCHEMA_NAME' below with your actual schema name
-- 3. Run each ALTER TABLE command

-- ============================================================================
-- MOVE TABLES TO PUBLIC SCHEMA
-- ============================================================================

-- Replace CUSTOM_SCHEMA_NAME with your actual schema (e.g., founder_os)
DO $$
DECLARE
  custom_schema TEXT := 'CUSTOM_SCHEMA_NAME'; -- CHANGE THIS!
BEGIN
  EXECUTE format('ALTER TABLE %I.founder_contexts SET SCHEMA public', custom_schema);
  EXECUTE format('ALTER TABLE %I.founder_goals SET SCHEMA public', custom_schema);
  EXECUTE format('ALTER TABLE %I.founder_tasks SET SCHEMA public', custom_schema);
  EXECUTE format('ALTER TABLE %I.founder_task_goal_links SET SCHEMA public', custom_schema);
  EXECUTE format('ALTER TABLE %I.founder_daily_plans SET SCHEMA public', custom_schema);
  EXECUTE format('ALTER TABLE %I.founder_relationships SET SCHEMA public', custom_schema);
  EXECUTE format('ALTER TABLE %I.founder_check_ins SET SCHEMA public', custom_schema);

  RAISE NOTICE 'Successfully moved all tables to public schema';
END $$;

-- ============================================================================
-- VERIFY MIGRATION
-- ============================================================================

-- Check all tables are now in public
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename LIKE 'founder_%'
ORDER BY tablename;

-- Should show:
-- schemaname | tablename                  | rls_enabled
-- -----------|----------------------------|-------------
-- public     | founder_check_ins          | t
-- public     | founder_contexts           | t
-- public     | founder_daily_plans        | t
-- public     | founder_goals              | t
-- public     | founder_relationships      | t
-- public     | founder_task_goal_links    | t
-- public     | founder_tasks              | t

-- ============================================================================
-- TEST QUERY
-- ============================================================================

-- This should work without errors:
SELECT COUNT(*) as total_tasks FROM founder_tasks;
SELECT COUNT(*) as total_goals FROM founder_goals;
SELECT COUNT(*) as total_contexts FROM founder_contexts;
