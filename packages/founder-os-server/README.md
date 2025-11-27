# Founder OS - Personal Chief of Staff

**Conversational context layer for executive functioning**

Founder OS provides a persistent database for tasks, goals, contexts, relationships, daily plans, and check-ins. It enables stateful conversations with Claude about your work across all platforms (web, mobile, desktop).

## Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for project to provision (~2 minutes)
4. Go to **Project Settings** → **API**
5. Copy these values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

### 2. Configure Environment Variables

```bash
cd packages/founder-os-server
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJ...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...
USER_ID=your-user-uuid-here
```

**To get your USER_ID:**
1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User** → Create a test user (use your email)
3. Copy the UUID from the users table

### 3. Run Database Migrations

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to **SQL Editor** in Supabase Dashboard
2. Create a new query
3. Copy and paste the contents of `supabase/migrations/20251122_initial_schema.sql`
4. Click **Run**
5. Verify tables appear in **Table Editor**

**Option B: Via Supabase CLI**
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Seed Sample Data

**Option 1: Use default seed data**
```bash
npm run seed
```

This will create:
- Default contexts (Work, Renubu, Good Hang, etc.)
- Sample goals (PowerPak MVP, Scott Demo)
- Sample tasks (if you provide a CSV)

**Option 2: Import from Google Sheets**
1. Export your Google Sheet as CSV
2. Save to `./data/tasks-export.csv` (or update path in `.env`)
3. Run seed script:
```bash
npm run seed
```

**CSV Format:**
```csv
title,description,status,priority,contexts,energy_level,estimated_minutes,due_date
Review proposal,Check Becky's feedback,todo,high,"Work,Renubu",high,30,2025-11-25
Finish demo,Complete PowerPak demo,in_progress,critical,"PowerPak",high,60,2025-12-04
```

### 6. Test API Access

```bash
npm run test:api
```

You should see:
```
✅ founder_tasks: 5 rows
✅ founder_goals: 2 rows
✅ founder_contexts: 7 rows
...
🎉 All tests passed! Supabase is ready for Claude.
```

### 7. Use with Claude

The Skills file at `skills/SKILL.md` teaches Claude how to query your data.

**In any Claude conversation:**
1. Upload or reference the Skills file
2. Ask: "What am I working on today?"
3. Claude will query your Supabase database and have a conversation with you
4. All changes persist across sessions

**Example conversation:**
```
You: What should I work on today?

Claude: [Queries database]
You have 8 active tasks. Your top priorities are:
1. ⚡ Review proposal for Becky (30min) - High Priority
2. 🚀 Finish PowerPak demo (60min) - Critical
3. 📞 Check in with Scott (15min) - Medium

What would you like to focus on?

You: Let's do the demo prep. Mark it as in-progress.

Claude: [Updates database]
✅ Marked 'Finish PowerPak demo' as in-progress. Good luck!
```

## Architecture

### Current Implementation (Phase 1)
```
┌─────────────────────────────────────────┐
│  Claude (Web/Mobile/Desktop)            │
│  - Reads skills/SKILL.md                │
│  - Uses web_fetch to query Supabase     │
└─────────────────┬───────────────────────┘
                  │
                  │ HTTPS REST API
                  │
┌─────────────────▼───────────────────────┐
│  Supabase                               │
│  - Postgres Database (7 tables)         │
│  - Auto-generated REST API              │
│  - Row-Level Security (RLS)             │
│  - Authentication                        │
└─────────────────────────────────────────┘
```

### Future Implementation (Phase 2)
- MCP server layer (when claude.ai supports MCP)
- Edge Functions for complex logic
- Better Chatbot UI integration
- PowerPak server integration

## Database Schema

### Tables
1. **founder_tasks** - Task management with priority, status, context tags
2. **founder_goals** - Hierarchical OKRs (yearly → quarterly → monthly → weekly)
3. **founder_contexts** - Project/area tags (Renubu, Good Hang, etc.)
4. **founder_relationships** - People tracker (investors, team, family)
5. **founder_daily_plans** - Morning intentions + evening reflections
6. **founder_check_ins** - Qualitative mood/energy/gratitude tracking
7. **founder_task_goal_links** - Junction table linking tasks to goals

### Security
All tables have Row-Level Security (RLS) enabled:
- Users can only access their own data
- API keys can be safely shared with Claude
- Multi-user support is built-in

## API Examples

### Get Today's Tasks
```bash
curl "https://your-project.supabase.co/rest/v1/founder_tasks?status=eq.todo&order=priority.desc" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Create a Task
```bash
curl -X POST "https://your-project.supabase.co/rest/v1/founder_tasks" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review proposal",
    "status": "todo",
    "priority": "high",
    "context_tags": ["Work", "Renubu"],
    "estimated_minutes": 30
  }'
```

### Update Task Status
```bash
curl -X PATCH "https://your-project.supabase.co/rest/v1/founder_tasks?id=eq.TASK_UUID" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status": "done", "completed_at": "2025-11-22T14:30:00Z"}'
```

## Conversational Workflows

### "What am I working on today?"
Claude queries tasks and daily plan, presents priorities, helps you choose focus.

### "I have 30 minutes, what should I do?"
Claude filters by estimated time, considers energy level and context, suggests options.

### "How am I tracking on quarterly goals?"
Claude fetches goals with progress metrics, calculates percentages, identifies blockers.

### "Let's plan my week"
Claude reviews upcoming tasks, deadlines, and goals, helps allocate time.

## Troubleshooting

### "Migration failed"
- Check that you copied the entire SQL file
- Verify you're in the SQL Editor (not another tab)
- Check for error messages in Supabase Dashboard

### "RLS policies blocking access"
- Verify USER_ID in `.env` matches a real user in auth.users table
- Check that you created a user in Authentication tab
- Confirm anon key has correct permissions

### "No data showing up"
- Run `npm run seed` to create sample data
- Check Table Editor in Supabase Dashboard
- Run `npm run test:api` to verify connection

### "Claude can't access the API"
- Verify Skills file is uploaded/referenced in conversation
- Check that SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Try the curl examples above to test manually

## Development

### Project Structure
```
packages/founder-os-server/
├── supabase/
│   └── migrations/           # SQL schema definitions
│       └── 20251122_initial_schema.sql
├── scripts/
│   ├── seed-from-sheets.ts  # Import data from CSV
│   └── test-api.ts          # Verify Supabase connection
├── skills/
│   └── SKILL.md             # API documentation for Claude
├── .env.example             # Environment variable template
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Fields

1. Create a new migration file:
```sql
-- supabase/migrations/20251123_add_task_category.sql
ALTER TABLE founder_tasks ADD COLUMN category TEXT;
```

2. Run migration in Supabase SQL Editor

3. Update Skills file to document new field

4. Claude automatically has access via REST API

### Extending Schema

Want to add new tables? Follow this pattern:

```sql
CREATE TABLE founder_new_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- your fields here
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE founder_new_table ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own records" ON founder_new_table FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own records" ON founder_new_table FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own records" ON founder_new_table FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own records" ON founder_new_table FOR DELETE USING (auth.uid() = user_id);

-- Add auto-update trigger
CREATE TRIGGER update_founder_new_table_updated_at BEFORE UPDATE ON founder_new_table
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Support

- **Supabase Docs:** https://supabase.com/docs
- **Supabase REST API:** https://supabase.com/docs/guides/api
- **Issues:** Open an issue in the MCP-World repo

## Roadmap

- [x] Phase 1: Schema + Supabase REST API + Skills File
- [ ] Phase 2: MCP Server (when claude.ai supports MCP)
- [ ] Phase 3: Edge Functions (day planning, recommendations)
- [ ] Phase 4: Better Chatbot UI integration
- [ ] Phase 5: Mobile app (React Native)

## License

Part of the MCP-World project
