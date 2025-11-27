# Founder OS + Justin's Voice - Combined Workflow

## Using Both Systems Together

When you need to communicate about tasks/relationships in Justin's voice, combine both APIs:

### Example: Email to Investor in Your Voice

```
1. Query Founder OS for context
   GET /founder_relationships?name=ilike.%Becky%
   GET /founder_tasks?context_tags=cs.{"Renubu"}&status=in.(todo,in_progress)

2. Use Justin's Voice API with that context
   [Call Justin's Voice MCP server with context from step 1]
```

### Workflow: Check-in Message

**Step 1: Get relationship context**
```
GET https://dokaliwfnptcwhywjltp.supabase.co/rest/v1/founder_relationships?name=ilike.%Scott%
```

Returns:
```json
{
  "name": "Scott Leese",
  "relationship": "investor",
  "last_contact": "2025-11-15",
  "notes": "Excited about PowerPak demo. Wants to see MCP ecosystem vision.",
  "sentiment": "positive"
}
```

**Step 2: Get relevant tasks**
```
GET https://dokaliwfnptcwhywjltp.supabase.co/rest/v1/founder_tasks?context_tags=cs.{"PowerPak"}&status=eq.in_progress
```

Returns:
```json
[
  {
    "title": "Finish PowerPak demo",
    "status": "in_progress",
    "priority": "critical",
    "due_date": "2025-12-04"
  }
]
```

**Step 3: Call Justin's Voice with context**
```
[Use Justin's Voice MCP server]

Template: investor_update
Context:
  - Recipient: Scott Leese (investor)
  - Project: PowerPak demo
  - Status: In progress
  - Sentiment: Positive, excited
  - Due: Dec 4th
```

Generates:
```
Hey Scott,

Just wanted to give you a quick update on the PowerPak demo we discussed.
Making solid progress - the demo is in-progress and on track for Dec 4th.
The MCP ecosystem vision is coming together nicely.

Excited to show you what we've built.

Talk soon,
Justin
```

### Workflow: Daily Planning with Voice Output

**Step 1: Get today's plan**
```
GET /founder_daily_plans?plan_date=eq.2025-11-22
```

**Step 2: Get today's tasks**
```
GET /founder_tasks?status=in.(todo,in_progress)&due_date=lte.2025-11-22&order=priority.desc
```

**Step 3: Generate morning briefing in your voice**
```
[Use Justin's Voice]

Template: morning_briefing
Context: [Today's plan + top 3 tasks]
```

### Workflow: Relationship Nudge in Voice

**Step 1: Find relationships needing attention**
```
GET /founder_relationships?last_contact=lt.2025-11-15&order=last_contact.asc
```

**Step 2: Generate outreach message in your voice**
```
[Use Justin's Voice]

Template: relationship_nudge
Context: [Person info, last contact date, notes]
```

## Integration Patterns

### Pattern 1: Context-Aware Communication
1. Query Founder OS for task/relationship/goal data
2. Pass that data as context to Justin's Voice
3. Generate personalized, on-brand communication

### Pattern 2: Daily Automation
1. Morning: Query Founder OS for today's plan + tasks
2. Generate morning briefing in your voice
3. Evening: Query completed tasks, record reflection

### Pattern 3: Relationship Management
1. Query relationships table for people needing contact
2. Get relevant tasks/goals related to that person
3. Generate check-in message in your voice

## Future: Unified API (Phase 2)

When PowerPak MCP server adds this integration:

```
# Single API call
powerpak.send_message_in_voice({
  to: "Becky",
  about: "PowerPak demo",
  messageType: "investor_update"
})

# PowerPak handles:
# 1. Querying Founder OS for context
# 2. Calling Justin's Voice with that context
# 3. Returning generated message
```

## Current Best Practice

**Upload both Skills files to Claude:**
1. `founder-os-server/skills/SKILL.md` (Founder OS API)
2. `justin-voice-server/skills/SKILL.md` (Justin's Voice API)

**Then ask:**
- "Draft an email to Becky about the PowerPak demo in my voice"
- "Generate a morning briefing in my voice based on today's tasks"
- "Write a check-in message to Scott in my voice"

Claude will automatically:
1. Query Founder OS for context
2. Use Justin's Voice to generate in your style
3. Combine them into the final output
