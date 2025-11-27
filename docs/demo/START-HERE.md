# START HERE - Immediate Execution Plan

**Status:** Ready to build  
**Build Time:** 2 days (10 hours of Claude Code)  
**Perfect Time:** 8 days  
**Demo Date:** December 4, 2025

---

## ANSWER THESE 5 QUESTIONS (10 minutes)

### 1. Dating Layer
**Keep it as Act 2 centerpiece?**
- [ ] YES - Dating leads the demo (bigger impact)
- [ ] NO - Just professional use case

### 2. Profile Count
**How many profiles to build?**
- [ ] 8-10 (focused, high quality)
- [ ] 15-20 (shows scale, network effects)

### 3. Company Examples
**How many company PowerPaks?**
- [ ] 1 (Just Renubu)
- [ ] 2-3 (Renubu + competitors/partners)

### 4. Network Graph
**Interactive or pre-recorded?**
- [ ] INTERACTIVE (live demo, riskier)
- [ ] RECORDED (animation, safer)

### 5. Demo Format
**Primary delivery method?**
- [ ] LIVE (with recorded backup)
- [ ] RECORDED (with live Q&A after)

---

## WHAT YOU HAVE (Skills Architecture)

```
skills/
├── platinum/
│   ├── justin-strackany/SKILL.md (~15KB)
│   └── scott-leese/SKILL.md (~18KB)
├── premium/
│   ├── gary-vaynerchuk/SKILL.md (~17KB)
│   ├── jill-rowley/SKILL.md (~15KB)
│   └── andrew-ng/SKILL.md (~14KB)
├── regular/
│   ├── maya-chen/SKILL.md (~9KB)
│   ├── jordan-williams/SKILL.md (~10KB)
│   ├── priya-sharma/SKILL.md (~9KB)
│   └── marcus-thompson/SKILL.md (~9KB)
└── spotlight/
    └── david-martinez/
        ├── SKILL-BASIC.md (~8KB)
        └── SKILL-PREMIUM.md (~25KB)
```

**Status:** ✅ Content exists, needs search/discovery layer

---

## WHAT YOU'RE BUILDING (Search/Discovery Layer)

```
PowerPak Demo (NEW):
├── profiles/
│   ├── professional/ (8-20 JSONs)
│   ├── dating/ (5 JSONs)
│   └── schema.ts
├── companies/
│   ├── renubu.json
│   ├── [2-3 more].json
│   └── schema.ts
├── network/
│   ├── graph.json (Neo4j or simple JSON)
│   ├── correlations.json
│   └── paths.json
└── packages/
    ├── search-service/
    ├── company-service/
    ├── network-service/
    └── demo-ui/ (Next.js)
```

**Goal:** Make Skills searchable, combinable, discoverable

---

## DAY 1 PLAN (Build Everything Core)

### Morning (9am-12pm): Decisions + Profile Build

**Your Task (1 hour):**
1. Answer the 5 questions above
2. List 15-20 profile names you want
   - 8 professional (Justin, Scott, Grace, + 5 more)
   - 5 dating (diverse personalities, locations, ages)
   - 2-4 hiring candidates (DevOps, designer, etc.)

**Claude Code Task (2 hours):**
- Generate TypeScript schemas
- Create all profile JSONs with rich attributes
- Build search service with multi-attribute filtering
- Connect to existing Skills files

### Afternoon (12pm-3pm): Company + Network

**Your Task (30 min):**
- Decide on 2-3 company examples (besides Renubu)
- Define Renubu's 4 tiers (public, tools, customer, team)

**Claude Code Task (2.5 hours):**
- Build company schema + data
- Create Neo4j or JSON graph
- Build correlation matrix
- Implement network service

### Evening (3pm-8pm): Frontend + Testing

**Your Task (1 hour):**
- Test search queries
- Review UI mockups
- Provide feedback

**Claude Code Task (4 hours):**
- Build Next.js demo UI
- Search interface
- Profile cards
- Company page viewer
- Network graph (D3.js)
- Skills content integration

**End of Day 1:** Full system working, rough but functional

---

## DAY 2 PLAN (Advanced Features + Polish)

### Morning (9am-12pm): Tools + Permissions

**Claude Code Task (3 hours):**
- Permission system (tier-based access)
- HIRE/MESSAGE/BOOK tools (mocked but realistic)
- Dating-specific features (compatibility, distance)
- Calendar integration (mocked availability)

### Afternoon (12pm-6pm): Demo Automation + Backup

**Claude Code Task (3 hours):**
- Demo script runner (keyboard shortcuts)
- Pre-scripted query flows
- Video recording system
- Offline mode
- Fast-forward mode

**Your Task (3 hours):**
- Full demo run-through
- Test every feature
- Find bugs
- Iterate with Claude Code

**End of Day 2:** Everything works, needs content refinement

---

## DAYS 3-10 PLAN (Perfect It)

### Days 3-4: Content
- Pull real LinkedIn data for professional profiles
- Write believable dating profiles
- Refine company descriptions
- Test Skills combinations

### Days 5-6: Narrative
- Script 7-act demo word-for-word
- Time each scene
- Record backup video
- Practice delivery

### Days 7-8: Testing
- Stress test everything
- Find edge cases
- UI polish pass
- Performance optimization

### Day 9: Dress Rehearsal
- Full 30-min run with Ruth watching
- Final adjustments
- Record final backup

### Day 10: Buffer
- Deploy to demo machine
- Final verification
- Rest

---

## CLAUDE CODE PROMPTS (Copy-Paste Ready)

### Prompt 1: Profile Schema + Search

```
Build PowerPak profile search system:

REQUIREMENTS:
1. TypeScript types for searchable profiles
   - Professional attributes (expertise, location, military, etc.)
   - Personal attributes (personality, interests, dating preferences)
   - Availability (hireable, dateable, rate)
   - Links to Skills files

2. Search service that can handle queries like:
   - "Find experts with military experience who coach MEDDIC"
   - "Find women in Raleigh, Enneagram 7, under 30, who like hiking"
   - "Find DevOps engineers in Austin with Kubernetes certs who climb"

3. Multi-attribute filtering with fuzzy matching
4. Distance calculations for location queries
5. Ranking algorithm for result relevance

OUTPUT:
- /packages/powerpak-core/src/types.ts
- /packages/search-service/index.ts
- /packages/search-service/parser.ts (query → filters)
- /packages/search-service/__tests__/search.test.ts

Use existing Skills files at /skills/* for content integration.
```

### Prompt 2: Profile Data Generation

```
Generate 20 PowerPak profile JSONs:

PROFESSIONAL (8 profiles):
1. Justin Strackany - CEO Renubu, Revenue Ops, CS, Writing
   Location: Raleigh, NC
   Links to: /skills/platinum/justin-strackany/SKILL.md

2. Scott Leese - Sales Leader, MEDDIC, Hiring
   Location: [City]
   Military: Navy veteran
   Links to: /skills/platinum/scott-leese/SKILL.md

3. Grace - InHerSight, Underrepresented markets, Product
   Location: [City]
   
4-8: [YOUR SUGGESTIONS - diverse expertise, locations]

DATING (5 profiles):
1. Sarah Chen, 28, Raleigh - Enneagram 7w8, hiking, spontaneous
2-5: [Diverse ages 25-35, personalities, interests, locations]

HIRING (4 profiles):
1. Marcus DevOps, Austin - Kubernetes expert, rock climbing
2-4: [Designer, sales rep, product manager]

For each profile:
- Rich attributes (10+ searchable fields)
- Realistic bios
- Clear expertise/interests
- Availability + rates
- Photo placeholder

OUTPUT: /profiles/*.json (20 files)
```

### Prompt 3: Company Pages

```
Build company PowerPak system:

SCHEMA:
- Company identity (name, tagline, description)
- Tiered access (public, free_tools, customer, team)
- Team member profiles
- Tools/capabilities per tier

DATA:
1. Renubu
   - Public: B2B SaaS for CS expansion intelligence
   - Tools: CS Health Assessment, ROI Calculator
   - Customer: Expansion playbooks using Justin's frameworks
   - Team: Justin (CEO), Grace (Design Partner)

2. [1-2 more company examples]

OUTPUT:
- /companies/schema.ts
- /companies/*.json
- /packages/company-service/index.ts
```

### Prompt 4: Network Graph

```
Build network effects system:

REQUIREMENTS:
1. Graph data structure (nodes = profiles, edges = connections)
2. Correlation matrix ("People who use X also use Y")
3. Compound intelligence paths (Scott + Justin = hybrid frameworks)

DATA:
- Expert relationships (who works with who)
- Expertise overlaps (shared skills)
- Collaboration examples

OUTPUT:
- /network/graph.json
- /network/correlations.json
- /packages/network-service/index.ts
- D3.js visualization component

Show: Scott + Justin connection, 3-expert paths, recommendation engine
```

### Prompt 5: Demo UI

```
Build Next.js demo app:

COMPONENTS:
1. SearchBar - Natural language + filter dropdowns
2. ProfileCard - Shows profile data, links to Skills
3. CompanyPage - Tier selector, team roster, tools
4. NetworkGraph - Interactive D3.js visualization
5. SkillViewer - Loads and displays Skill content
6. ComparisonView - Side-by-side multi-expert analysis

ROUTES:
- / - Search interface
- /profile/[id] - Profile details
- /company/[id] - Company page
- /network - Graph visualization
- /demo - Script runner mode

STYLING: Tailwind + shadcn/ui
TECH: Next.js 14, TypeScript, D3.js

OUTPUT: /packages/demo-ui/*
```

---

## SUCCESS CHECKLIST

After Day 2, you should be able to:

### Search Demos:
- [ ] "Find experts with military experience who coach MEDDIC" → Returns Scott
- [ ] "Find women in Raleigh, Enneagram 7, under 30, hiking" → Returns Sarah
- [ ] "Find DevOps engineers in Austin with Kubernetes certs" → Returns Marcus

### Company Demos:
- [ ] View Renubu company page
- [ ] Switch between tiers (public, tools, customer)
- [ ] See team member profiles
- [ ] Test free tools (CS Health Assessment)

### Network Demos:
- [ ] Visualize Scott + Justin connection
- [ ] Query: "How would Scott AND Justin approach expansion selling?"
- [ ] Show compound intelligence synthesis

### Skills Integration:
- [ ] Load Justin's Skill from profile
- [ ] Generate content using Skill
- [ ] Combine multiple Skills in one response

---

## WHAT TO DO RIGHT NOW

1. **Answer the 5 questions** (checkboxes at top)
2. **List 15-20 profile names** (who to include)
3. **Send to Claude Code** with Prompt 1
4. **Go make coffee** (let AI build for 30 minutes)
5. **Test the search** when it's done
6. **Iterate** based on what you see

---

**You're 10 hours of build time away from a complete demo.**

**The rest is storytelling.**

Let's go.
