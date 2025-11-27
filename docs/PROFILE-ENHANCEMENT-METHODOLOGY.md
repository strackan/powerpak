# Profile Enhancement Methodology
**Extracted from Justin's Voice Server & Founder OS**

## Overview

We have two levels of PowerPak profiles:
1. **Basic Profiles** (PowerPak Server) - SKILL.md + generic tools
2. **Advanced Systems** (Custom servers) - Specialized tools, templates, and workflows

This document captures the methodology to enhance any profile from Basic → Advanced.

---

## Justin's Voice Server: The Template

### Core Components

#### 1. **Template System** (30 templates)
- **Beginnings** (O1-O6): 6 ways to open content
- **Middles** (M1-M7): 7 ways to develop ideas
- **Endings** (E1-E6): 6 ways to close
- **Flavors** (F1-F10): 10 style elements
- **Transitions** (T1-T4): 4 connection patterns

**Key Insight**: Break down expertise into modular, combinable templates

#### 2. **Blend Recipes** (9 proven combinations)
- Pre-configured template combinations for specific contexts
- Examples:
  - THE AUTHENTIC FOUNDER = o1 + m1 + e2
  - THE HOT TAKE = o3 + m6 + e3

**Key Insight**: Capture "proven plays" as named recipes

#### 3. **Rules System** (23 writing rules)
- Formatting guidelines
- Voice consistency markers
- Vulnerability/authenticity principles

**Key Insight**: Explicit rules make implicit knowledge transferable

#### 4. **Scoring & Analysis**
- Voice Analysis: Score text 0-100 for "expert-ness"
- Smart Suggestions: Specific improvements to match style

**Key Insight**: Measurable feedback loop for quality

#### 5. **MCP Tools**
```typescript
// Generation tool
generate_content({ blendName, topic, context })
generate_content({ templateIds: {begin, middle, end}, topic })

// Analysis tool
analyze_voice({ text })
```

**Key Insight**: Tools that USE the system, not just expose data

---

## Founder OS: The Workflow System

### Core Components

#### 1. **Structured Data Layer** (Supabase)
- Tasks, Goals, Contexts
- Relationships, Daily Plans
- Check-ins, Status tracking

**Key Insight**: Persistence enables stateful conversations

#### 2. **Context System**
- Work contexts (Renubu, PowerPak, etc.)
- Personal contexts
- Energy levels, priorities

**Key Insight**: Context switching mirrors how executives think

#### 3. **Relationship Tracking**
- People database
- Interaction history
- Follow-up reminders

**Key Insight**: Executive function includes relationship management

#### 4. **Workflow Tools**
```typescript
// Task management
create_task({ title, contexts, priority, energy_level })
update_task_status({ task_id, status })

// Planning
create_daily_plan({ date, goals, contexts })
check_in({ reflections, wins, blockers })

// Relationships
track_interaction({ person, summary, follow_up })
```

**Key Insight**: Tools that execute workflows, not just display info

---

## Enhancement Levels: How to Apply This

### Level 1: Basic Profile (Current State)
**What you have:**
- SKILL.md with expertise content
- PowerPak Server with generic tools (ask_expert, hire, message, book_meeting)

**Good for:** Most experts (Maya Chen, Jordan Williams, Priya Sharma, etc.)

---

### Level 2: Template-Enhanced Profile
**Add:**
1. **Template System** (10-30 templates)
   - Extract signature frameworks
   - Break into modular pieces
   - Create combination recipes

2. **Generation Tool**
   - `generate_using_framework({ framework, context })`
   - Returns content in expert's style

**Example Application:**
- **Scott Leese**: MEDDIC templates, hiring frameworks, coaching formats
- **Gary Vaynerchuk**: Content pyramid templates, platform-specific formats
- **Jill Rowley**: Social selling templates, LinkedIn post formats

**Build Time**: 2-3 hours per expert (extract templates, build tool)

---

### Level 3: Workflow-Enhanced Profile
**Add:**
1. **Workflow Database** (Supabase or JSON)
   - Domain-specific data structures
   - Workflow state tracking
   - Historical data

2. **Workflow Tools**
   - Tools that execute processes
   - Status tracking
   - Multi-step workflows

**Example Applications:**
- **Scott Leese**: Sales pipeline management, rep coaching workflow
- **Priya Sharma**: Sales ops workflows, quota planning, territory design
- **Maya Chen**: Product prioritization (RICE), roadmap management

**Build Time**: 4-6 hours per expert (schema design, tools, testing)

---

### Level 4: Full System (Justin/Founder OS Level)
**Add:**
1. All of Level 2 + 3
2. **Analysis/Scoring Tools**
3. **Smart Suggestions**
4. **Learning/Improvement Loop**

**Best for:** Showcase profiles only (Justin, possibly Scott)

**Build Time**: 10-15 hours per expert

---

## Quick Enhancement Priority for Demo

### Tier 1: Do Now (High Impact, Low Effort)
**Scott Leese** → Level 2 (Template-Enhanced)
- Already has rich SKILL.md
- Extract MEDDIC, hiring, coaching templates
- Create `generate_sales_framework()` tool
- **Time**: 2 hours
- **Impact**: Shows template system scalability

### Tier 2: Phase 2 (Medium Impact, Medium Effort)
**Gary Vaynerchuk** → Level 2 (Template-Enhanced)
- Content pyramid templates
- Platform-specific post generation
- **Time**: 2-3 hours

**Priya Sharma** → Level 3 (Workflow-Enhanced)
- Sales ops workflows
- Quota calculator
- Territory designer
- **Time**: 4 hours

### Tier 3: Post-Demo (Lower Priority)
**Others** → Remain Level 1 (Basic) for now
- Show progression from basic → template → workflow → full system
- Demonstrates tiering naturally

---

## Extraction Methodology

### Step 1: Analyze SKILL.md
Look for:
- Repeated frameworks (becomes templates)
- Step-by-step processes (becomes workflows)
- Decision trees (becomes tools)
- Examples with structure (becomes recipes)

### Step 2: Identify Modular Pieces
**Questions to ask:**
- What are the 5-10 core "moves" this expert makes?
- Can these be combined in different ways?
- Are there "proven combinations" they use repeatedly?

### Step 3: Build Template System
```typescript
interface Template {
  id: string;          // "m1", "o3", etc.
  name: string;        // "Vulnerability Opening"
  description: string; // When and why to use
  structure: string;   // The actual template pattern
  examples: string[];  // Real examples from expert
}

interface BlendRecipe {
  name: string;              // "THE AUTHENTIC FOUNDER"
  context: string;           // When to use
  templates: {
    beginning?: string;      // "o1"
    middle?: string;         // "m1"
    ending?: string;         // "e2"
  };
  example: string;           // Full example using this blend
}
```

### Step 4: Build Generation Tool
```typescript
generate_content({
  blendName?: string,        // Or...
  templateIds?: {            // Specify individual templates
    beginning: string,
    middle: string,
    ending: string
  },
  topic: string,
  context?: string
}) => {
  content: string,
  templatesUsed: object,
  suggestions?: string[]
}
```

### Step 5: (Optional) Add Workflow Layer
```typescript
// Design domain-specific schema
interface SalesRep {
  name: string;
  pipeline_value: number;
  close_rate: number;
  activity_score: number;
}

// Build workflow tools
coach_rep({
  rep_id: string,
  performance_data: object
}) => {
  coaching_plan: object,
  talking_points: string[],
  metrics_to_track: string[]
}
```

---

## Demo Strategy: Show the Progression

### Act 1: Basic Profiles
**Show**: Maya Chen, Jordan Williams
- Simple SKILL + generic tools
- Good for foundational expertise

### Act 2: Template-Enhanced
**Show**: Scott Leese with templates
- 20 frameworks as modular templates
- Generate coaching plan using blend recipe
- Demonstrates: "This is how we scale expertise"

### Act 3: Advanced Systems
**Show**: Justin's Voice (30 templates) + Founder OS (workflows)
- Full template system with voice scoring
- Stateful workflows with context management
- Demonstrates: "Platinum tier gets THIS"

### The Pitch
"We can take ANY expert and extract their methodology into templates and workflows. Justin is the proof of concept. Scott is next. You could have 'Scott's Sales System' with 50 templates for every sales scenario."

---

## Files to Reference

### Justin's Voice Server
- `/packages/justin-voice-server/skills/SKILL.md` - Full template system
- `/packages/justin-voice-server/src/index.ts` - MCP implementation
- `/packages/justin-voice-server/skills/VOICE-GUIDELINES.md` - Rules system

### Founder OS
- `/packages/founder-os-server/skills/SKILL.md` - Workflow documentation
- `/packages/founder-os-server/supabase/migrations/` - Data schema
- `/packages/founder-os-server/src/tools/` - Workflow tool implementations

### PowerPak Server (Basic Implementation)
- `/packages/powerpak-server/src/index.ts` - Generic MCP server
- For comparison: what we START with vs. what we BUILD TO

---

## Next Steps for Demo

**Immediate (Today):**
1. ✅ Integrate justin-voice and founder-os
2. 🔄 Enhance Scott with template system (2 hours)
3. 🔄 Test all profiles load correctly

**Phase 2 (If Time):**
4. Enhance Gary Vaynerchuk (templates)
5. Enhance Priya Sharma (workflows)

**Phase 3 (Post-Demo):**
6. Document methodology further
7. Build "template extractor" tool
8. Scale to all profiles

---

**Key Takeaway**: We're not just building profiles. We're building a SYSTEM for extracting and scaling expertise. Justin is the proof. Scott is the replication. The rest show the market opportunity.
