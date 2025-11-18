# MCP Network Sandbox - Demo Script

**Demo Duration:** 3-5 minutes
**Audience:** Scott Leese
**Goal:** Show the future of MCP Universe as a discoverable, interconnected network of expertise

---

## Pre-Demo Setup

1. ✅ Build the network sandbox: `npm run build`
2. ✅ Configure Claude Desktop (see claude-config-example.json)
3. ✅ Restart Claude Desktop
4. ✅ Test with: "Get network statistics"

---

## Demo Flow

### Part 1: Platform Overview (30 seconds)

**You:**
> "Before we dive into the individual MCPs, let me show you what the platform looks like at scale. Claude, get network statistics."

**Expected Response:**
- 10 experts, 12,420 installations
- Tier breakdown (Basic/Enhanced/Premium)
- Trending experts
- Popular combinations

**Key Points to Highlight:**
- "This is what 10 experts looks like. Imagine 10,000."
- "Notice the network effects - people install Scott + Keisha together 721 times"
- "Premium tier drives most installations (8,555 vs 1,266 for Basic)"

---

### Part 2: Discovery & Filtering (60 seconds)

**You:**
> "Scott, let's say you're looking for sales expertise. Claude, browse experts in the Sales category."

**Expected Response:**
- Shows Justin, Scott, Marcus, Keisha with stats

**You:**
> "Now show me just the Premium tier sales experts."

**Expected Response:**
- Filters to show only Scott

**You:**
> "Tell me about Scott Leese."

**Expected Response:**
- Full profile with 12 tools, testimonials, stats
- 3,891 installations, 5.0 rating
- Specialties, pricing ($25K one-time)

**Key Points to Highlight:**
- "You can filter by category, tier, or keyword"
- "Each profile shows tools, testimonials, pricing"
- "Premium tier = 12+ tools, white-glove onboarding"

---

### Part 3: Network Effects (90 seconds)

**You:**
> "Here's where it gets interesting. Claude, who else do people install when they install Justin Strackany?"

**Expected Response:**
- Scott (85% correlation)
- Keisha (72%)
- Marcus (68%)
- Lisa (54%)
- Priya (48%)

With reasons for each correlation

**You:**
> "And who installs with Scott?"

**Expected Response:**
- Keisha (81%)
- Justin (78%)
- Marcus (74%)
- Lisa (62%)

**Key Points to Highlight:**
- "85% of people who install Justin also install you"
- "The system learns which experts complement each other"
- "Sales leadership + enablement is the strongest pairing"
- "This is how we create network effects - discovery through connections"

---

### Part 4: Search & Discovery (30 seconds)

**You:**
> "Claude, find experts who can help with enterprise sales."

**Expected Response:**
- Shows Marcus, Scott, others with "enterprise" in their profiles

**You:**
> "Search for product-market fit experts."

**Expected Response:**
- Shows Priya, Jordan

**Key Points to Highlight:**
- "Semantic search across all profiles"
- "Finds relevant experts even if exact keyword doesn't match"

---

### Part 5: The Vision (60 seconds)

**You (to Scott):**
> "So here's the vision. Right now we have 10 experts in this sandbox. But imagine:
>
> - 500 experts in month 1
> - 5,000 by month 6
> - Each with their own voice, tools, frameworks
>
> The network effects compound. When you install someone, we show you who else is relevant. Communities form naturally - revenue builders, product people, technical founders.
>
> And the best part? This is all working right now. This isn't a mockup - Claude is actually querying this network, finding connections, making recommendations.
>
> What we're showing you is the infrastructure that makes 'LinkedIn for AI' actually work."

---

## Backup Scenarios

### If Scott Wants to Explore

**Browse by Tier:**
```
"Show me all Basic tier experts"
"Now Enhanced tier"
"Now Premium tier"
```

**Explore Connections:**
```
"Who is the most connected expert?"
"What are the strongest expert pairings?"
"Show me the Product & Growth community cluster"
```

**Deep Dive on Specific Expert:**
```
"Tell me about Priya Patel"
"What tools does Marcus Johnson offer?"
"Show me Lisa Martinez's testimonials"
```

### If Tech Questions Come Up

**How does this scale?**
"Each expert profile is <30KB. 10,000 experts = 300MB. The network runs locally, so it's instant."

**How do correlations work?**
"Right now it's pre-computed. In production, we track actual installations and calculate correlations daily using collaborative filtering."

**Voice profiles?**
"4 experts have voice profiles active (Justin, Scott, Priya, Lisa). We can generate content in their style, just like Justin's Voice MCP."

---

## Key Messages to Land

1. **This is real** - Not a mockup, actually works with Claude
2. **Network effects are the moat** - Discovery through connections
3. **Three tiers work** - Basic (lead gen), Enhanced (revenue), Premium (profit)
4. **Scales infinitely** - 10 experts or 10,000, same architecture
5. **Combines with other MCPs** - Universal Messenger + Voice + Network = magic

---

## What Success Looks Like

Scott says one of:
- "Holy shit, this actually works"
- "I need to be Premium tier #1"
- "When can we launch this?"
- "I want in - what do you need from me?"

---

## Troubleshooting

**If Claude doesn't recognize the tools:**
- Restart Claude Desktop
- Check config file syntax
- Verify path to dist/index.js

**If no results show up:**
- Verify JSON data files are in dist/data/
- Check console output for errors

**If Scott asks about backend:**
- "This is a sandbox - all data is pre-seeded JSON"
- "In production, we'd have a database, APIs, user accounts"
- "But the MCP interface stays exactly the same"

---

**Demo Prep Time:** 2 minutes
**Demo Run Time:** 3-5 minutes
**Impact:** Maximum

🎯 **Goal: Make Scott say "I'm in"**
