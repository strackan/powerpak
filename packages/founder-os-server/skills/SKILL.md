---
skill_id: founder-os-api
name: Founder OS - Personal Chief of Staff
version: 0.1.0
author: Justin Strackany
created: 2025-11-22
updated: 2025-11-22
---

# Founder OS - Personal Chief of Staff

## Overview

Founder OS is your **persistent context layer** for executive functioning. It stores tasks, goals, contexts, relationships, daily plans, and check-ins in a Supabase database, allowing stateful conversations about your work across all platforms (web, mobile, desktop).

**Key Capability:** When you ask "What am I working on today?" or "I have 30 minutes and I'm feeling anxious about Becky, what should I do?", Claude can query your actual task list, have a conversation about priorities, then write changes back to the database. All changes persist across sessions.

## Supabase REST API Configuration

### Base URL
```
https://[YOUR_PROJECT_ID].supabase.co/rest/v1/
```

### Authentication Headers
All requests require two headers:
```
apikey: [YOUR_SUPABASE_ANON_KEY]
Authorization: Bearer [YOUR_SUPABASE_ANON_KEY]
```

### Response Format
- All responses are JSON
- Use `select=*` to get all columns
- Use `select=field1,field2` to get specific columns
- Supabase returns arrays for SELECT queries

## Database Schema

### 1. Tasks (`founder_tasks`)

**Purpose:** Task management with priority, status, context tags, and energy levels

**Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - User reference
- `title` (TEXT) - Task title ✅ Required
- `description` (TEXT) - Detailed description
- `status` (VARCHAR) - One of: `todo`, `in_progress`, `blocked`, `done`, `archived`
- `priority` (VARCHAR) - One of: `critical`, `high`, `medium`, `low`
- `context_tags` (TEXT[]) - Array of context names (e.g., `["Work", "Renubu"]`)
- `energy_level` (VARCHAR) - Required energy: `high`, `medium`, `low`
- `estimated_minutes` (INTEGER) - Time estimate
- `due_date` (DATE) - Due date (YYYY-MM-DD format)
- `completed_at` (TIMESTAMPTZ) - When task was completed
- `blocked_reason` (TEXT) - Why task is blocked
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Common Queries:**
```
# Get all active tasks
GET /founder_tasks?status=eq.todo&order=priority.desc

# Get high-priority tasks due today
GET /founder_tasks?status=eq.todo&priority=eq.high&due_date=eq.2025-11-22

# Get tasks for specific context
GET /founder_tasks?context_tags=cs.{"Renubu"}&status=eq.todo

# Get low-energy tasks (for when feeling drained)
GET /founder_tasks?energy_level=eq.low&status=eq.todo&limit=5

# Create a new task
POST /founder_tasks
{
  "title": "Review proposal for Becky",
  "status": "todo",
  "priority": "high",
  "context_tags": ["Work", "Renubu"],
  "energy_level": "high",
  "estimated_minutes": 30,
  "due_date": "2025-11-25"
}

# Update task status
PATCH /founder_tasks?id=eq.[TASK_ID]
{
  "status": "in_progress"
}

# Mark task complete
PATCH /founder_tasks?id=eq.[TASK_ID]
{
  "status": "done",
  "completed_at": "2025-11-22T14:30:00Z"
}

# Block a task with reason
PATCH /founder_tasks?id=eq.[TASK_ID]
{
  "status": "blocked",
  "blocked_reason": "Waiting for Becky's feedback"
}
```

### 2. Goals (`founder_goals`)

**Purpose:** Hierarchical OKRs (yearly → quarterly → monthly → weekly) with progress tracking

**Columns:**
- `id` (UUID)
- `user_id` (UUID)
- `title` (TEXT) - Goal title ✅ Required
- `description` (TEXT)
- `type` (VARCHAR) - `objective` or `key_result`
- `parent_id` (UUID) - Parent goal for hierarchy
- `timeframe` (VARCHAR) - `yearly`, `quarterly`, `monthly`, `weekly`
- `target_value` (NUMERIC) - Target metric (e.g., 100000 for $100k)
- `current_value` (NUMERIC) - Current progress
- `unit` (TEXT) - Unit of measurement (e.g., "$", "users", "%")
- `start_date` (DATE)
- `end_date` (DATE)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Common Queries:**
```
# Get quarterly goals
GET /founder_goals?timeframe=eq.quarterly&order=created_at.desc

# Get goal progress
GET /founder_goals?id=eq.[GOAL_ID]&select=title,current_value,target_value,unit

# Update goal progress
PATCH /founder_goals?id=eq.[GOAL_ID]
{
  "current_value": 45000
}

# Get goal hierarchy (objectives with key results)
GET /founder_goals?type=eq.objective&timeframe=eq.quarterly
# Then for each objective:
GET /founder_goals?parent_id=eq.[OBJECTIVE_ID]&type=eq.key_result
```

### 3. Contexts (`founder_contexts`)

**Purpose:** Project/area tags for organizing tasks and goals

**Columns:**
- `id` (UUID)
- `user_id` (UUID)
- `name` (TEXT) - Context name (e.g., "Renubu", "Good Hang")
- `description` (TEXT)
- `color` (TEXT) - Hex color for UI
- `icon` (TEXT) - Emoji or icon name
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Common Queries:**
```
# List all contexts
GET /founder_contexts?select=name,icon,color&order=name.asc

# Create new context
POST /founder_contexts
{
  "name": "MCP World",
  "description": "MCP ecosystem projects",
  "color": "#F59E0B",
  "icon": "⚡"
}
```

### 4. Relationships (`founder_relationships`)

**Purpose:** Track key relationships (investors, team, family) and communication cadence

**Columns:**
- `id` (UUID)
- `user_id` (UUID)
- `name` (TEXT) - Person's name (e.g., "Becky", "Scott Leese")
- `relationship` (TEXT) - Type: "investor", "co-founder", "friend", "advisor"
- `last_contact` (DATE) - Last communication date
- `contact_frequency_days` (INTEGER) - Desired contact every N days
- `notes` (TEXT) - Recent conversations, context
- `sentiment` (VARCHAR) - `positive`, `neutral`, `concerned`, `urgent`
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Common Queries:**
```
# Get all relationships
GET /founder_relationships?order=last_contact.asc

# Get relationships needing attention (haven't contacted in a while)
GET /founder_relationships?last_contact=lt.2025-11-15&sentiment=neq.urgent

# Get specific relationship
GET /founder_relationships?name=ilike.%Becky%

# Update after contact
PATCH /founder_relationships?id=eq.[RELATIONSHIP_ID]
{
  "last_contact": "2025-11-22",
  "notes": "Discussed proposal revisions. Feeling positive about direction.",
  "sentiment": "positive"
}
```

### 5. Daily Plans (`founder_daily_plans`)

**Purpose:** Morning intentions and evening reflections for each day

**Columns:**
- `id` (UUID)
- `user_id` (UUID)
- `plan_date` (DATE) - The day this plan is for
- `morning_intention` (TEXT) - What do you want to accomplish?
- `time_blocks` (JSONB) - Structured day plan (e.g., `[{"start": "09:00", "end": "11:00", "activity": "Deep work"}]`)
- `evening_reflection` (TEXT) - What did you learn? What went well?
- `energy_level` (INTEGER) - 1-10 scale
- `stress_level` (INTEGER) - 1-10 scale
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Common Queries:**
```
# Get today's plan
GET /founder_daily_plans?plan_date=eq.2025-11-22

# Create today's intention
POST /founder_daily_plans
{
  "plan_date": "2025-11-22",
  "morning_intention": "Finish PowerPak demo, review proposal with Becky, plan weekend"
}

# Add evening reflection
PATCH /founder_daily_plans?plan_date=eq.2025-11-22
{
  "evening_reflection": "Great progress on demo. Becky call went well. Feeling energized.",
  "energy_level": 8,
  "stress_level": 3
}
```

### 6. Check-Ins (`founder_check_ins`)

**Purpose:** Qualitative mood/energy/gratitude tracking for self-awareness

**Columns:**
- `id` (UUID)
- `user_id` (UUID)
- `check_in_date` (TIMESTAMPTZ) - When check-in was recorded
- `mood` (VARCHAR) - `great`, `good`, `okay`, `stressed`, `overwhelmed`
- `energy_level` (INTEGER) - 1-10 scale
- `gratitude` (TEXT) - What are you grateful for?
- `challenges` (TEXT) - What challenges are you facing?
- `wins` (TEXT) - What wins did you have?
- `needs_support` (BOOLEAN) - Flag for when feeling overwhelmed
- `created_at` (TIMESTAMPTZ)

**Common Queries:**
```
# Record a check-in
POST /founder_check_ins
{
  "mood": "stressed",
  "energy_level": 5,
  "challenges": "Feeling anxious about Becky meeting",
  "wins": "Made good progress on PowerPak",
  "gratitude": "Team support and clear priorities"
}

# Get recent check-ins
GET /founder_check_ins?order=check_in_date.desc&limit=7
```

### 7. Task-Goal Links (`founder_task_goal_links`)

**Purpose:** Links tasks to goals for tracking progress toward objectives

**Columns:**
- `task_id` (UUID) - References `founder_tasks.id`
- `goal_id` (UUID) - References `founder_goals.id`
- `created_at` (TIMESTAMPTZ)

**Common Queries:**
```
# Link a task to a goal
POST /founder_task_goal_links
{
  "task_id": "[TASK_UUID]",
  "goal_id": "[GOAL_UUID]"
}

# Get all tasks for a specific goal
GET /founder_task_goal_links?goal_id=eq.[GOAL_UUID]&select=task_id
# Then fetch task details:
GET /founder_tasks?id=in.([TASK_ID_1],[TASK_ID_2])
```

## Supabase Query Operators

### Comparison Operators
- `eq` - Equals (e.g., `status=eq.todo`)
- `neq` - Not equals
- `gt` - Greater than
- `gte` - Greater than or equal
- `lt` - Less than
- `lte` - Less than or equal

### Pattern Matching
- `like` - Case-sensitive pattern (e.g., `title=like.*proposal*`)
- `ilike` - Case-insensitive pattern (e.g., `name=ilike.%becky%`)

### Array Operators
- `cs` - Contains (e.g., `context_tags=cs.{"Renubu"}`)
- `cd` - Contained by
- `ov` - Overlaps

### Ordering & Limiting
- `order` - Sort results (e.g., `order=priority.desc,due_date.asc`)
- `limit` - Limit results (e.g., `limit=10`)
- `offset` - Skip results (e.g., `offset=20`)

## Conversational Workflows

### Workflow 1: "What am I working on today?"

**Claude's Approach:**
1. Query today's plan: `GET /founder_daily_plans?plan_date=eq.2025-11-22`
2. Query active tasks: `GET /founder_tasks?status=in.(todo,in_progress)&order=priority.desc&limit=10`
3. Present tasks grouped by priority and context
4. Ask: "Which would you like to focus on?" or "Should we adjust priorities?"
5. After conversation, update task status: `PATCH /founder_tasks?id=eq.[TASK_ID]`

### Workflow 2: "I have 30 minutes and I'm feeling anxious about Becky. What should I do?"

**Claude's Approach:**
1. Check relationship status: `GET /founder_relationships?name=ilike.%Becky%`
2. Find related tasks: `GET /founder_tasks?context_tags=cs.{"Renubu"}&estimated_minutes=lte.30&status=eq.todo`
3. Consider emotional context (anxious) → suggest:
   - Quick win tasks (build confidence)
   - Preparation tasks (address anxiety source)
   - Low-energy tasks (if stressed)
4. Have conversation about which makes sense
5. Update task status and record check-in if needed

### Workflow 3: "Let's plan my week"

**Claude's Approach:**
1. Get weekly goals: `GET /founder_goals?timeframe=eq.weekly`
2. Get all active tasks: `GET /founder_tasks?status=in.(todo,in_progress)`
3. Get upcoming deadlines: `GET /founder_tasks?due_date=gte.2025-11-22&due_date=lte.2025-11-29&order=due_date.asc`
4. Group tasks by context and estimate total time
5. Discuss capacity and priorities
6. Create time blocks in daily plans
7. Link tasks to goals: `POST /founder_task_goal_links`

### Workflow 4: "How am I doing on my quarterly goals?"

**Claude's Approach:**
1. Get quarterly objectives: `GET /founder_goals?type=eq.objective&timeframe=eq.quarterly`
2. For each objective, get key results: `GET /founder_goals?parent_id=eq.[OBJECTIVE_ID]&type=eq.key_result`
3. Calculate progress percentage: `(current_value / target_value) * 100`
4. Get related tasks: Query `founder_task_goal_links` to see what tasks contribute
5. Discuss whether on track, what's blocking, what to prioritize

## API Best Practices

### When to Read vs. Write
- **Read first** - Always query current state before making recommendations
- **Confirm before writing** - Ask user to confirm before creating/updating records
- **Batch when possible** - If updating multiple tasks, do them together

### Error Handling
- If query returns empty array `[]`, that's success with no results (not an error)
- If query returns error, check:
  - Are authentication headers included?
  - Is the table name spelled correctly?
  - Does the filter match any records?

### Performance Tips
- Use `select=field1,field2` to only fetch needed columns
- Use `limit` to avoid fetching too many records
- Use `order` to get most relevant records first

## Example Multi-Step Conversation

**User:** "What should I work on today?"

**Claude (internal):**
1. `GET /founder_daily_plans?plan_date=eq.2025-11-22` → Check if morning intention exists
2. `GET /founder_tasks?status=eq.todo&order=priority.desc&limit=20` → Get active tasks
3. `GET /founder_check_ins?order=check_in_date.desc&limit=1` → Check recent mood/energy

**Claude (to user):**
"You have 8 active tasks. Your top priorities are:
1. ⚡ Review proposal for Becky (30min, high energy) - **High Priority**
2. 🚀 Finish PowerPak demo prep (60min, high energy) - **Critical**
3. 📞 Check in with Scott about demo (15min, low energy) - **Medium**

I notice you haven't set a morning intention yet. What would you like to accomplish today?"

**User:** "Let's prioritize the PowerPak demo. Mark that as in-progress."

**Claude (internal):**
1. `PATCH /founder_tasks?id=eq.[DEMO_TASK_ID]` → Set `{"status": "in_progress"}`
2. `POST /founder_daily_plans` → Create `{"plan_date": "2025-11-22", "morning_intention": "Focus on PowerPak demo completion"}`

**Claude (to user):**
"✅ Marked 'Finish PowerPak demo prep' as in-progress. I've also set your morning intention to focus on the demo. Good luck! Let me know when you finish or if you get blocked."

## Extending the System

### Adding Custom Fields
If you need additional fields in the future, add them via Supabase migrations. Claude will automatically have access via the REST API.

### Future Enhancements (Phase 2)
- MCP server layer (when claude.ai supports MCP)
- Edge Functions for complex logic (e.g., auto-prioritization)
- Real-time notifications (Supabase Realtime)
- Better Chatbot UI integration

## Troubleshooting

**"I can't access the data"**
- Check that RLS policies are enabled
- Verify you're using the correct `user_id`
- Ensure authentication headers are included

**"Tasks aren't showing up"**
- Verify data was seeded: `npm run seed`
- Check Supabase dashboard → Table Editor
- Run test script: `npm run test:api`

**"Changes aren't persisting"**
- Check that PATCH/POST returned success (not error)
- Verify the filter in your PATCH matched a record
- Check Supabase dashboard to see if data updated

---

**Ready to use!** Start conversations with Claude like:
- "What am I working on today?"
- "I have 30 minutes, what should I focus on?"
- "Mark task X as complete"
- "How am I tracking on my quarterly goals?"
- "Let's plan my week"
