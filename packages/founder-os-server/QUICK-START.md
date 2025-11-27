# Founder OS - Quick Start Guide

**⏱️ Total Setup Time: ~10 minutes**

## Step-by-Step Setup

### 1. Create Supabase Project (2 minutes)
1. Go to [supabase.com](https://supabase.com) → Sign up/Login
2. Click **New Project**
3. Name: `founder-os-prod` (or whatever you prefer)
4. Password: *create a strong password*
5. Region: Choose closest to you
6. Click **Create new project**
7. ⏳ Wait for provisioning (~2 min)

### 2. Get API Credentials (1 minute)
1. Go to **Settings** (⚙️ icon) → **API**
2. Copy these 3 values:
   ```
   ✅ Project URL: https://xxxxx.supabase.co
   ✅ anon public key: eyJhbG...
   ✅ service_role key: eyJhbG...
   ```

### 3. Create User Account (1 minute)
1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Email: your-email@example.com
4. Password: *create password*
5. Click **Create User**
6. **Copy the UUID** from the users table (e.g., `a1b2c3d4-...`)

### 4. Configure Environment (1 minute)
```bash
cd packages/founder-os-server
cp .env.example .env
```

Edit `.env`:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
USER_ID=a1b2c3d4-...  # UUID from step 3
```

### 5. Run Database Migration (2 minutes)
1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New query**
3. Open `supabase/migrations/20251122_initial_schema.sql`
4. **Copy entire file** and paste into SQL Editor
5. Click **Run** (bottom right)
6. ✅ Should see: "Success. No rows returned"

Verify tables created:
1. Go to **Table Editor**
2. You should see 7 tables:
   - founder_tasks
   - founder_goals
   - founder_contexts
   - founder_relationships
   - founder_daily_plans
   - founder_check_ins
   - founder_task_goal_links

### 6. Install Dependencies & Seed Data (2 minutes)
```bash
# Install dependencies
npm install

# Seed default contexts and sample goals
npm run seed
```

Expected output:
```
📁 Seeding default contexts...
   ✅ Created context: 💼 Work
   ✅ Created context: 🚀 Renubu
   ...
🎯 Seeding sample goals...
   ✅ Created goal: Launch PowerPak MVP
   ...
✅ Seeding complete!
```

### 7. Test Connection (1 minute)
```bash
npm run test:api
```

Expected output:
```
✅ founder_tasks: 0 rows
✅ founder_goals: 2 rows
✅ founder_contexts: 7 rows
...
🎉 All tests passed! Supabase is ready for Claude.
```

### 8. Start Using with Claude! (30 seconds)

**Upload the Skills file to Claude:**
1. In any Claude conversation (web, mobile, or desktop)
2. Attach file: `packages/founder-os-server/skills/SKILL.md`
3. Say: "What am I working on today?"

**Or reference it inline:**
```
I'm using Founder OS to track my tasks. Here's the API documentation:
[paste relevant sections from SKILL.md]

What am I working on today?
```

---

## Your First Conversation

**You:** "What am I working on today?"

**Claude:**
```
Let me check your task list...
[Queries: GET /founder_tasks?status=eq.todo&order=priority.desc]

You currently have 0 active tasks. Would you like to:
1. Create your first task
2. Import tasks from Google Sheets
3. Set up your goals first

What would you prefer?
```

**You:** "Let's create a task: Finish PowerPak demo by Dec 4th, high priority"

**Claude:**
```
I'll create that task for you.
[POST /founder_tasks with your details]

✅ Created task: "Finish PowerPak demo"
   Priority: High
   Due: 2025-12-04
   Status: Todo

Would you like to link this to a goal or add any context tags?
```

---

## Importing Your Existing Tasks

### From Google Sheets:
1. Export your sheet as CSV
2. Format columns: `title,description,status,priority,contexts,energy_level,estimated_minutes,due_date`
3. Save to `./data/tasks-export.csv`
4. Update `.env`: `GOOGLE_SHEETS_CSV_PATH=./data/tasks-export.csv`
5. Run: `npm run seed`

### Manually via Supabase Dashboard:
1. Go to **Table Editor** → **founder_tasks**
2. Click **Insert row**
3. Fill in fields
4. Click **Save**

---

## Common Commands

```bash
# Seed fresh data
npm run seed

# Test API connection
npm run test:api

# View logs in Supabase
# Dashboard → Logs → API Logs
```

---

## Troubleshooting

### "Migration failed: relation already exists"
Tables already created. Either:
- Use existing tables, or
- Drop tables in SQL Editor: `DROP TABLE IF EXISTS founder_tasks CASCADE;`
- Re-run migration

### "No data showing in test"
- Run seed script: `npm run seed`
- Check USER_ID matches auth.users table
- Verify RLS policies are enabled

### "Claude can't access data"
- Check Skills file is uploaded/pasted
- Verify API credentials in Skills file match your Supabase project
- Test manually with curl (see examples in README.md)

---

## Next Steps

1. ✅ Create your first tasks via conversation
2. ✅ Set up quarterly goals
3. ✅ Add your key relationships (investors, team, etc.)
4. ✅ Record a daily check-in
5. 🚀 Use daily to plan, prioritize, and reflect!

---

**Ready to become a more organized founder? Start chatting with Claude!** 🎯
