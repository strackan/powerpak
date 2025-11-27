# Founder OS Setup - Project: dokaliwfnptcwhywjltp

**Your Supabase Project:** https://dokaliwfnptcwhywjltp.supabase.co

## Step 1: Get Service Role Key (1 minute)

1. Go to: https://supabase.com/dashboard/project/dokaliwfnptcwhywjltp/settings/api
2. Scroll to **Project API keys**
3. Copy the **service_role** key (starts with `eyJ...`)
4. Update `.env` file:
   ```bash
   # Replace TODO_GET_FROM_SETTINGS_API with your service_role key
   SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...
   ```

## Step 2: Create User Account (1 minute)

1. Go to: https://supabase.com/dashboard/project/dokaliwfnptcwhywjltp/auth/users
2. Click **Add User** → **Create new user**
3. Fill in:
   - **Email:** your-email@guyforthat.com (or whatever you prefer)
   - **Password:** Create a secure password
   - **Auto Confirm User:** ✅ Check this box
4. Click **Create User**
5. **Copy the UUID** from the users table (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
6. Update `.env` file:
   ```bash
   # Replace TODO_CREATE_USER_FIRST with the UUID you copied
   USER_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
   ```

## Step 3: Run Database Migration (2 minutes)

1. Go to: https://supabase.com/dashboard/project/dokaliwfnptcwhywjltp/sql/new
2. Open the file: `supabase/migrations/20251122_initial_schema.sql`
3. **Copy the entire contents** (all ~400 lines)
4. **Paste into the SQL Editor**
5. Click **Run** (bottom right corner)
6. You should see: ✅ **"Success. No rows returned"**

## Step 4: Verify Tables Were Created

1. Go to: https://supabase.com/dashboard/project/dokaliwfnptcwhywjltp/editor
2. Click on the **Tables** icon (left sidebar)
3. You should see 7 new tables:
   - ✅ founder_check_ins
   - ✅ founder_contexts
   - ✅ founder_daily_plans
   - ✅ founder_goals
   - ✅ founder_relationships
   - ✅ founder_task_goal_links
   - ✅ founder_tasks

## Step 5: Install Dependencies & Seed Data

```bash
cd packages/founder-os-server

# Install dependencies (if not already done)
npm install

# Seed default contexts and sample goals
npm run seed
```

Expected output:
```
📁 Seeding default contexts...
   ✅ Created context: 💼 Work
   ✅ Created context: 🚀 Renubu
   ✅ Created context: 🎯 Good Hang
   ✅ Created context: ⚡ PowerPak
   ✅ Created context: 🏠 Personal
   ✅ Created context: ❤️ Family
   ✅ Created context: 📚 Learning

🎯 Seeding sample goals...
   ✅ Created goal: Launch PowerPak MVP
   ✅ Created goal: Complete Scott Demo

✅ Seeding complete!
```

## Step 6: Test API Connection

```bash
npm run test:api
```

Expected output:
```
✅ founder_tasks: 0 rows
✅ founder_goals: 2 rows
✅ founder_contexts: 7 rows
✅ founder_relationships: 0 rows
✅ founder_daily_plans: 0 rows
✅ founder_check_ins: 0 rows
✅ founder_task_goal_links: 0 rows

🎉 All tests passed! Supabase is ready for Claude.
```

## Step 7: Test with curl (Optional Verification)

```bash
# Test reading contexts
curl "https://dokaliwfnptcwhywjltp.supabase.co/rest/v1/founder_contexts?select=*" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRva2FsaXdmbnB0Y3doeXdqbHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0MDI0MTksImV4cCI6MjA0Nzk3ODQxOX0.xLq75c9s0W9OJe7WNiJ29Q_8RVwbz2f" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRva2FsaXdmbnB0Y3doeXdqbHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0MDI0MTksImV4cCI6MjA0Nzk3ODQxOX0.xLq75c9s0W9OJe7WNiJ29Q_8RVwbz2f"
```

You should see JSON array with 7 contexts (Work, Renubu, etc.)

## Step 8: Start Using with Claude!

Now you can have conversations with Claude. Upload the `skills/SKILL.md` file or paste this example:

**Example First Conversation:**

```
Hi Claude, I'm using Founder OS to track my tasks and goals. Here's the API info:

Base URL: https://dokaliwfnptcwhywjltp.supabase.co/rest/v1/
API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRva2FsaXdmbnB0Y3doeXdqbHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0MDI0MTksImV4cCI6MjA0Nzk3ODQxOX0.xLq75c9s0W9OJe7WNiJ29Q_8RVwbz2f

Tables:
- founder_tasks (id, title, description, status, priority, context_tags, energy_level, due_date)
- founder_goals (id, title, description, type, timeframe, target_value, current_value)
- founder_contexts (id, name, description, color, icon)

Authentication: Use API key in both "apikey" and "Authorization: Bearer" headers

What am I working on today?
```

Or upload the full `skills/SKILL.md` file for complete API documentation.

---

## Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/dokaliwfnptcwhywjltp
- **SQL Editor:** https://supabase.com/dashboard/project/dokaliwfnptcwhywjltp/sql
- **Table Editor:** https://supabase.com/dashboard/project/dokaliwfnptcwhywjltp/editor
- **API Settings:** https://supabase.com/dashboard/project/dokaliwfnptcwhywjltp/settings/api
- **Users:** https://supabase.com/dashboard/project/dokaliwfnptcwhywjltp/auth/users

---

## Troubleshooting

### "Could not find the table 'public.founder_tasks' in the schema cache"

This means the migration didn't run. Go back to Step 3 and run the migration SQL.

### "Row level security policy violated"

You need to create a user and update the USER_ID in `.env`. See Step 2.

### "Permission denied"

Make sure you're using the **anon key** (not service role key) in your curl commands and Claude conversations. The anon key respects RLS policies.

### Tables are in wrong schema

If you see tables in a custom schema instead of `public`, run:

```sql
-- Find current schema
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_name LIKE 'founder_%';

-- If they're in a custom schema, move them to public
-- Replace 'your_schema' with actual schema name:
ALTER TABLE your_schema.founder_contexts SET SCHEMA public;
ALTER TABLE your_schema.founder_goals SET SCHEMA public;
ALTER TABLE your_schema.founder_tasks SET SCHEMA public;
ALTER TABLE your_schema.founder_task_goal_links SET SCHEMA public;
ALTER TABLE your_schema.founder_daily_plans SET SCHEMA public;
ALTER TABLE your_schema.founder_relationships SET SCHEMA public;
ALTER TABLE your_schema.founder_check_ins SET SCHEMA public;
```

---

**Total Setup Time: ~10 minutes**

You're all set! Start having conversations with Claude about your tasks and goals. 🚀
