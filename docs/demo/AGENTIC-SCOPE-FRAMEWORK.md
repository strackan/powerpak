# Agentic Era Scope Framework
## Build Time is Free, Risk/Complexity is the Real Cost

**Core Insight:** In the agentic era, throughput isn't the constraint. Decision-making, testing surface area, cognitive load, and stability are.

---

## OLD WORLD vs NEW WORLD

### Old World (Human Dev)
```
Feature Request
    ↓
"That's 2 weeks of dev time" ← CONSTRAINT
    ↓
Scope negotiation
    ↓
Cut features to fit timeline
```

**Bottleneck:** Developer throughput

### New World (Agentic Dev)
```
Feature Request
    ↓
"That's 30 minutes of Claude Code" ← NOT A CONSTRAINT
    ↓
Real questions:
    - Does it add risk?
    - Does it create cognitive load?
    - Does it serve the story?
    - Does it introduce instability?
    ↓
Cut features that add complexity without value
```

**Bottleneck:** Decision-making, testing, story clarity

---

## THE NEW SCOPE QUESTIONS

### Instead of "How long will this take?"

Ask these:

### 1. RISK
**"Does this create a point of failure during the demo?"**
- Interactive network graph: Higher risk (D3.js bugs, performance)
- Pre-recorded animation: Lower risk (known quantity)
- **Trade-off:** Interactive = more impressive IF it works

### 2. TESTING SURFACE
**"How many things can break?"**
- 20 profiles: More data, more edge cases, more to QA
- 10 profiles: Fewer edge cases, faster to verify
- **Trade-off:** 20 = shows scale, 10 = less can go wrong

### 3. COGNITIVE LOAD
**"Can I explain this in 30 seconds?"**
- Permission tiers: 4 tiers = clear value ladder
- Permission tiers: 8 tiers = confusing, hard to explain
- **Trade-off:** Simplicity = clarity, complexity = confusion

### 4. STORY VALUE
**"Does this make the demo better or just longer?"**
- Dating layer: HUGE impact, makes universal search obvious
- Admin portal: Cool feature, doesn't serve the Scott story
- **Trade-off:** Every feature should advance the narrative

### 5. STABILITY
**"Will this work reliably under pressure?"**
- File-based JSON: Rock solid, no dependencies
- Neo4j Docker: Another thing that can fail to start
- **Trade-off:** Fewer dependencies = more reliable demo

---

## SCOPE DECISIONS REFRAMED

### Feature: Dating Layer

**Build Time:** 30 minutes (Claude Code generates 5 profiles)

**Real Costs:**
- **Risk:** Low (just more JSON data)
- **Testing:** Adds 5 more profiles to QA
- **Cognitive Load:** Zero (makes concept CLEARER)
- **Story Value:** MASSIVE (proves universal search)
- **Stability:** No new dependencies

**Decision:** ✅ INCLUDE - High value, low cost

---

### Feature: Interactive Network Graph (D3.js)

**Build Time:** 1 hour (Claude Code builds component)

**Real Costs:**
- **Risk:** MEDIUM (D3.js rendering, browser performance)
- **Testing:** Need to test across browsers, screen sizes
- **Cognitive Load:** Low (visual is intuitive)
- **Story Value:** High (shows compound intelligence visually)
- **Stability:** Depends on browser, data size

**Decision:** ✅ INCLUDE with BACKUP
- Build interactive version
- Record video backup if it lags
- Test extensively Day 7-8

---

### Feature: Real Calendar Integration (Google Calendar API)

**Build Time:** 1-2 hours (Claude Code implements OAuth + API)

**Real Costs:**
- **Risk:** HIGH (OAuth can fail, API rate limits, auth flows)
- **Testing:** Significant (auth states, edge cases, failures)
- **Cognitive Load:** Medium (explaining auth during demo)
- **Story Value:** Low (mocked availability is enough)
- **Stability:** NEW DEPENDENCY (Google API must be up)

**Decision:** ❌ EXCLUDE
- Mock with "available" flags
- Show concept, don't implement for real
- Reduces demo risk significantly

---

### Feature: 20 Profiles vs 10 Profiles

**Build Time:** SAME (Claude Code generates 20 as easily as 10)

**Real Costs:**
- **Risk:** Low (more data doesn't add complexity)
- **Testing:** Higher (more edge cases, more to verify)
- **Cognitive Load:** Zero (user doesn't see all 20 at once)
- **Story Value:** Medium (shows scale, network effects)
- **Stability:** Slightly lower (more data = more typos/errors)

**Decision:** ✅ 15 PROFILES (Goldilocks)
- 8 professional (Justin, Scott, Grace, +5)
- 5 dating (diverse)
- 2 hiring (DevOps, designer)
- Enough to show scale
- Not too many to QA thoroughly

---

### Feature: Full Renubu Company PowerPak vs Concept Only

**Build Time:** 30 minutes (Claude Code builds schema + data)

**Real Costs:**
- **Risk:** Low (just JSON data + UI)
- **Testing:** Medium (4 tiers to verify)
- **Cognitive Load:** Low (you know Renubu deeply)
- **Story Value:** HIGH (dogfooding your own product)
- **Stability:** High (your own data, no external deps)

**Decision:** ✅ FULL BUILD
- All 4 tiers (public, tools, customer, team)
- Mocked tools (CS Health Assessment, ROI calc)
- Real content from actual Renubu
- Proves the pattern works

---

### Feature: 3 Company Examples vs Just Renubu

**Build Time:** +30 minutes per company

**Real Costs:**
- **Risk:** Low
- **Testing:** Higher (3x the content to verify)
- **Cognitive Load:** Medium (switching between examples)
- **Story Value:** Medium (proves pattern, but Renubu already does)
- **Stability:** Slightly lower (more content = more errors)

**Decision:** ✅ RENUBU + 1 OTHER
- Renubu: Full detail (you know it)
- Scott Leese Consulting: Basic example (proves pattern)
- Keeps demo focused
- Less to QA

---

### Feature: AI-Powered Query Parser vs Hardcoded Demo Queries

**Build Time:** Same (Claude Code builds parser OR hardcoded list)

**Real Costs:**
- **Risk:** HIGH (NLP parsing can fail, unexpected queries)
- **Testing:** EXTENSIVE (infinite query variations)
- **Cognitive Load:** Low (natural language is intuitive)
- **Story Value:** High (feels like magic)
- **Stability:** LOW (user can say anything, break it)

**Decision:** ✅ HYBRID APPROACH
- Build AI parser for common patterns
- Hardcode 15 demo queries with keyboard shortcuts
- Demo mode: Use scripted queries (safe)
- Q&A mode: Show parser (impressive but controlled)
- Best of both worlds

---

## THE AGENTIC SCOPE FRAMEWORK

### Green Light Features (Build Everything)
- **High story value**
- **Low risk**
- **No new dependencies**
- **Easy to test**
- **Makes demo clearer**

Examples:
- Dating layer profiles
- Company pages (Renubu)
- Network correlation data
- Profile search
- Skills integration

### Yellow Light Features (Build with Backup)
- **High story value**
- **Medium risk**
- **Manageable dependencies**
- **Testable but complex**
- **Worth the risk if it works**

Examples:
- Interactive network graph (+ video backup)
- AI query parser (+ scripted fallback)
- Demo automation (+ manual control)

### Red Light Features (Mock or Skip)
- **Low story value**
- **High risk**
- **New dependencies**
- **Hard to test**
- **Adds complexity without clarity**

Examples:
- Real calendar integration (OAuth, API limits)
- Real payment processing (Stripe, compliance)
- User authentication (sessions, security)
- Mobile apps (new platform, new bugs)
- Real-time collaboration (WebSockets, complexity)

---

## REVISED BUILD SCOPE (Risk-Adjusted)

### ✅ BUILD (10 hours)

**Day 1 Morning:**
- Profile schema + 15 profiles (8 pro, 5 dating, 2 hiring)
- Search service with AI parser + 15 hardcoded queries
- Skills integration layer
- Renubu company page (full 4 tiers)

**Day 1 Afternoon:**
- Network graph data (JSON, no Neo4j)
- Correlation matrix
- Scott Leese Consulting company page (basic)

**Day 1 Evening:**
- Next.js demo UI
- Search interface (text + filters)
- Profile cards
- Company page viewer
- Network graph (D3.js + video backup)

**Day 2 Morning:**
- Permission tier mockup (no real auth)
- Mocked tools (HIRE, MESSAGE, BOOK)
- Dating-specific UI elements
- Mocked availability system

**Day 2 Afternoon:**
- Demo script runner (15 keyboard shortcuts)
- Video recording for all scenes
- Offline mode (all data local)
- Fast-forward shortcuts

---

### ❌ SKIP (Too Risky)

- Real Google Calendar OAuth
- Real payment processing
- Real authentication/sessions
- Neo4j (use JSON graph instead)
- Mobile apps
- Real-time features
- API rate limit handling
- Error recovery flows
- Multiple deployment environments
- CI/CD pipelines

---

### 🎬 MOCK (Show Concept Only)

- Calendar availability (just "Available" flag)
- Payment (show pricing, no checkout)
- Tools (show UI, return mocked results)
- Hire workflow (show form, fake submission)
- Email notifications (show design, no send)
- Analytics dashboard (show mockup)

---

## TESTING STRATEGY (Risk-Prioritized)

### Day 7: Critical Path Testing (Must Work)
- Search with 10 demo queries
- Profile loading
- Skills integration
- Company page navigation
- Network graph rendering
- Video backups load

### Day 8: Edge Case Testing (Should Work)
- Weird search queries
- Empty results
- Large result sets
- Network graph performance
- Mobile responsive

### Day 9: Polish Testing (Nice to Work)
- Animations smooth
- Transitions clean
- No typos
- Loading states
- Error messages

**Priority:** Ensure critical path is BULLETPROOF before polishing edges

---

## THE DECISION FRAMEWORK

When considering any feature:

```
Can Claude Code build this in <1 hour?
    ↓ YES (everything)
    ↓
Does this add value to the Scott demo?
    ↓ YES
    ↓
Does this create risk/instability?
    ↓ NO
    ↓
✅ BUILD IT

    ↓ YES (creates risk)
    ↓
Can we build a backup/fallback?
    ↓ YES
    ↓
✅ BUILD + BACKUP

    ↓ NO (too risky even with backup)
    ↓
❌ MOCK OR SKIP
```

---

## FINAL SCOPE (Risk-Optimized)

### Core (Must Build)
- 15 profiles with rich attributes
- Search service (AI + hardcoded)
- Renubu company page (4 tiers)
- Network graph data
- Skills integration
- Demo UI (Next.js)

### Enhanced (Build + Backup)
- Interactive D3.js graph (+ video)
- AI query parser (+ keyboard shortcuts)
- Demo automation (+ manual control)

### Mocked (Show Concept)
- Calendar integration
- Payment processing
- Tool execution
- Notifications

### Skipped (Not Worth Risk)
- Real auth
- Real APIs
- Multiple environments
- Mobile apps

---

## TIME ALLOCATION (Revised)

**Building:** 10 hours (Day 1-2)  
**Testing critical path:** 16 hours (Day 7-8)  
**Content refinement:** 24 hours (Day 3-6)  
**Narrative scripting:** 16 hours (Day 5-6)  
**Dress rehearsal:** 8 hours (Day 9)  
**Buffer:** 16 hours (Day 10)  

**Total:** 90 hours over 10 days

**Key insight:** More time on testing than building

---

## QUESTIONS REFRAMED

### Not: "Should we build X?"
**Ask:** "If X breaks during the demo, can we recover?"

### Not: "How many features can we add?"
**Ask:** "What's the minimum feature set that tells the best story?"

### Not: "Can Claude Code build this?"
**Ask:** "Can we test this thoroughly in 10 days?"

---

**This is the agentic era scope framework:**

Build time is free.  
Risk is the real cost.  
Test thoroughly > build quickly.  
Story clarity > feature count.  
Reliability > impressiveness.

---

Does this capture what you meant?
