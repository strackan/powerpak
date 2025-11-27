#!/usr/bin/env tsx
/**
 * Seed Founder OS database from Google Sheets export
 *
 * Usage:
 *   1. Export your Google Sheet as CSV
 *   2. Set GOOGLE_SHEETS_CSV_PATH in .env to the CSV file path
 *   3. Run: npm run seed
 *
 * This script will:
 * - Read tasks from CSV
 * - Create default contexts if they don't exist
 * - Import tasks into Supabase
 * - Link tasks to goals (if goal info is in CSV)
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables from .env
config()

// ============================================================================
// Configuration
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role to bypass RLS
const USER_ID = process.env.USER_ID!
const CSV_PATH = process.env.GOOGLE_SHEETS_CSV_PATH || './data/tasks-export.csv'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !USER_ID) {
  console.error('❌ Missing required environment variables:')
  console.error('   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, USER_ID')
  console.error('   Copy .env.example to .env and fill in your values')
  process.exit(1)
}

// Create Supabase client (using service role for admin access)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// ============================================================================
// CSV Parsing Helper
// ============================================================================

function parseCSV(csvContent: string): Record<string, string>[] {
  const lines = csvContent.trim().split('\n')
  if (lines.length < 2) {
    return []
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    rows.push(row)
  }

  return rows
}

// ============================================================================
// Seed Default Contexts
// ============================================================================

async function seedContexts() {
  console.log('\n📁 Seeding default contexts...')

  const defaultContexts = [
    { name: 'Work', description: 'General work tasks', color: '#3B82F6', icon: '💼' },
    { name: 'Renubu', description: 'Renubu project tasks', color: '#8B5CF6', icon: '🚀' },
    { name: 'Good Hang', description: 'Good Hang project tasks', color: '#10B981', icon: '🎯' },
    { name: 'PowerPak', description: 'PowerPak/MCP World tasks', color: '#F59E0B', icon: '⚡' },
    { name: 'Personal', description: 'Personal tasks and errands', color: '#EC4899', icon: '🏠' },
    { name: 'Family', description: 'Family time and responsibilities', color: '#EF4444', icon: '❤️' },
    { name: 'Learning', description: 'Learning and development', color: '#6366F1', icon: '📚' },
  ]

  for (const context of defaultContexts) {
    const { data: existing } = await supabase
      .from('founder_contexts')
      .select('id')
      .eq('user_id', USER_ID)
      .eq('name', context.name)
      .single()

    if (!existing) {
      const { error } = await supabase
        .from('founder_contexts')
        .insert({ ...context, user_id: USER_ID })

      if (error) {
        console.error(`   ❌ Failed to create context "${context.name}":`, error.message)
      } else {
        console.log(`   ✅ Created context: ${context.icon} ${context.name}`)
      }
    } else {
      console.log(`   ⏭️  Context already exists: ${context.icon} ${context.name}`)
    }
  }
}

// ============================================================================
// Seed Tasks from CSV
// ============================================================================

async function seedTasks() {
  console.log('\n📋 Seeding tasks from CSV...')

  // Check if CSV file exists
  if (!fs.existsSync(CSV_PATH)) {
    console.log(`   ⚠️  CSV file not found at: ${CSV_PATH}`)
    console.log('   ℹ️  To import tasks:')
    console.log('      1. Export your Google Sheet as CSV')
    console.log('      2. Save it to the path specified in GOOGLE_SHEETS_CSV_PATH')
    console.log('      3. Re-run this script')
    console.log('\n   Expected CSV columns:')
    console.log('      - title (required)')
    console.log('      - description (optional)')
    console.log('      - status (todo, in_progress, done, etc.)')
    console.log('      - priority (critical, high, medium, low)')
    console.log('      - contexts (comma-separated: "Work,Renubu")')
    console.log('      - energy_level (high, medium, low)')
    console.log('      - estimated_minutes (number)')
    console.log('      - due_date (YYYY-MM-DD)')
    return
  }

  // Read and parse CSV
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8')
  const rows = parseCSV(csvContent)

  console.log(`   Found ${rows.length} tasks in CSV`)

  let imported = 0
  let skipped = 0
  let failed = 0

  for (const row of rows) {
    if (!row.title || row.title.trim() === '') {
      skipped++
      continue
    }

    // Parse context tags (split by comma)
    const contextTags = row.contexts
      ? row.contexts.split(',').map(c => c.trim()).filter(Boolean)
      : []

    // Build task object
    const task = {
      user_id: USER_ID,
      title: row.title,
      description: row.description || null,
      status: row.status || 'todo',
      priority: row.priority || 'medium',
      context_tags: contextTags.length > 0 ? contextTags : null,
      energy_level: row.energy_level || null,
      estimated_minutes: row.estimated_minutes ? parseInt(row.estimated_minutes) : null,
      due_date: row.due_date || null,
    }

    // Insert task
    const { error } = await supabase
      .from('founder_tasks')
      .insert(task)

    if (error) {
      console.error(`   ❌ Failed to import task "${task.title}":`, error.message)
      failed++
    } else {
      imported++
      console.log(`   ✅ Imported: ${task.title}`)
    }
  }

  console.log(`\n   📊 Summary:`)
  console.log(`      ✅ Imported: ${imported}`)
  console.log(`      ⏭️  Skipped: ${skipped}`)
  console.log(`      ❌ Failed: ${failed}`)
}

// ============================================================================
// Seed Sample Goals
// ============================================================================

async function seedSampleGoals() {
  console.log('\n🎯 Seeding sample goals...')

  const sampleGoals = [
    {
      title: 'Launch PowerPak MVP',
      description: 'Ship PowerPak as infrastructure layer for MCP ecosystem',
      type: 'objective',
      timeframe: 'quarterly',
      start_date: '2025-11-01',
      end_date: '2026-01-31',
    },
    {
      title: 'Complete Scott Demo',
      description: 'Deliver successful demo to Scott Leese by December 4th',
      type: 'key_result',
      timeframe: 'monthly',
      target_value: 1,
      current_value: 0,
      unit: 'demo',
      start_date: '2025-11-22',
      end_date: '2025-12-04',
    },
  ]

  for (const goal of sampleGoals) {
    const { data: existing } = await supabase
      .from('founder_goals')
      .select('id')
      .eq('user_id', USER_ID)
      .eq('title', goal.title)
      .single()

    if (!existing) {
      const { error } = await supabase
        .from('founder_goals')
        .insert({ ...goal, user_id: USER_ID })

      if (error) {
        console.error(`   ❌ Failed to create goal "${goal.title}":`, error.message)
      } else {
        console.log(`   ✅ Created goal: ${goal.title}`)
      }
    } else {
      console.log(`   ⏭️  Goal already exists: ${goal.title}`)
    }
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('🌱 Founder OS Seed Script')
  console.log('========================\n')
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`)
  console.log(`👤 User ID: ${USER_ID}`)
  console.log(`📄 CSV Path: ${CSV_PATH}`)

  try {
    await seedContexts()
    await seedSampleGoals()
    await seedTasks()

    console.log('\n✅ Seeding complete!')
    console.log('\nNext steps:')
    console.log('  1. Visit your Supabase dashboard to verify data')
    console.log('  2. Run test script: npm run test:api')
    console.log('  3. Try a conversation with Claude using the Skills file')
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  }
}

main()
