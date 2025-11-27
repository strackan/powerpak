#!/usr/bin/env tsx
/**
 * Test Supabase API access
 *
 * This script verifies that:
 * 1. Supabase connection works
 * 2. Authentication is configured correctly
 * 3. RLS policies allow access to your data
 * 4. All tables are accessible
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env
config()

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!
const USER_ID = process.env.USER_ID!

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   SUPABASE_URL, SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testConnection() {
  console.log('🔌 Testing Supabase connection...\n')
  console.log(`📍 URL: ${SUPABASE_URL}`)
  console.log(`🔑 Using: Anon Key (simulating Claude API access)\n`)

  const tables = [
    'founder_tasks',
    'founder_goals',
    'founder_contexts',
    'founder_relationships',
    'founder_daily_plans',
    'founder_check_ins',
    'founder_task_goal_links',
  ]

  let passed = 0
  let failed = 0

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: false })
        .limit(5)

      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
        failed++
      } else {
        console.log(`✅ ${table}: ${count ?? 0} rows (showing ${data?.length ?? 0})`)
        if (data && data.length > 0) {
          console.log(`   Sample: ${JSON.stringify(data[0], null, 2).substring(0, 100)}...`)
        }
        passed++
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err}`)
      failed++
    }
    console.log('')
  }

  console.log('========================')
  console.log(`✅ Passed: ${passed}/${tables.length}`)
  console.log(`❌ Failed: ${failed}/${tables.length}`)

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Supabase is ready for Claude.')
    console.log('\nExample query Claude can make:')
    console.log(`GET ${SUPABASE_URL}/rest/v1/founder_tasks?select=*&status=eq.todo&order=priority.desc`)
    console.log('Headers:')
    console.log(`  apikey: ${SUPABASE_ANON_KEY.substring(0, 20)}...`)
    console.log(`  Authorization: Bearer ${SUPABASE_ANON_KEY.substring(0, 20)}...`)
  } else {
    console.log('\n⚠️  Some tests failed. Check your Supabase setup:')
    console.log('  1. Verify migrations ran successfully')
    console.log('  2. Check RLS policies are enabled')
    console.log('  3. Ensure anon key has correct permissions')
  }
}

testConnection()
