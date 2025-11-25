# GTM.CONSULTING - TEXT ADVENTURE TRANSFORMATION
## Master Project Documentation

---

## PROJECT OVERVIEW

**What:** Converting gtm.consulting from a WordPress consulting site into a Zork-style 
text adventure game as a live, public transformation over 10 business days.

**Why:** 
- Marketing/content play (build in public)
- Demonstration of capabilities (AI, UX, creativity)
- Client filter (only curious people complete it)
- Demo piece for Dec 4 meeting with Scott

**Timeline:**
- Day 0: Nov 18 - Announcement posted ✅
- Day 1: Nov 19 - "Backing out" misdirection + afternoon "something's wrong"
- Days 2-9: Progressive transformation
- Day 10: Dec 2 - Just the cursor
- Launch: Dec 4 - Full game goes live + Scott demo

---

## NARRATIVE STRUCTURE

### The Story We're Telling:

**Public narrative:** "The site is transforming on its own. I don't know why. 
There are commits I didn't make. Something is trying to break through."

**Reality:** Justin is building it, but playing confused/discovering it with audience.

**The Three Acts:**

**ACT 1 - THE ORDINARY WORLD IS DYING (Days 1-3)**
- Visual elements start glitching
- Aesthetic breaks down (fonts, colors, layout)
- "Something's wrong with my site"
- Subtle at first, escalating

**ACT 2 - THE DESCENT (Days 4-7)**
- Function changes (not just appearance)
- Navigation becomes terminal commands
- Content becomes command outputs
- Mysterious commits appear
- Glitch messages: "i can see through now"
- The narrative emerges: there's something trapped in the code

**ACT 3 - THE NEW WORLD EMERGES (Days 8-10)**
- Old site almost completely gone
- The purge: everything disappears
- Just a blinking cursor
- Launch: The game is alive

---

## THE FINAL PRODUCT (Dec 4 Launch)

### Surface Game (Normal Path - 95% of players):
1. Landing page: Blinking cursor, Zork-style intro
2. Navigate to cottage
3. Explore study, read letter
4. Find 4 founder profiles
5. Match yourself to a profile
6. Unlock calendar link

### Hidden Game (Secret Path - 5% of curious players):
1. Find hidden trigger (examine armor, turn handle, etc.)
2. Discover secret staircase
3. Enter vault with mirror
4. Solve riddle about AI
5. Step through mirror
6. LLM conversation with "Justin_AI" (via Claude + MCP)
7. Get email for LinkedIn lookup
8. Personalized conversation
9. Qualification + calendar link

**Tech Stack:**
- Pure HTML/CSS/JS (no frameworks, no build process)
- Claude API for LLM conversations
- MCP integration for project knowledge access
- LinkedIn API for profile lookup
- Vercel/Netlify deployment

---

## DESIGN PRINCIPLES

### Aesthetic Evolution:

**Starting Point (Current):**
- Professional consulting site
- Corporate blue/white color scheme
- Sans-serif fonts
- Polished stock photos
- Clean, modern layout

**Ending Point (Launch):**
- Pure terminal aesthetic
- Green text on black background
- Monospace font (Courier New)
- ASCII art only
- Command-line interface

**Transformation Journey:**
- Gradual, not sudden
- Each day one more element "dies"
- Glitches/errors that escalate
- Feels organic, not designed
- Should be unsettling, not pretty

### The Vibe:
- "My site has a virus"
- "Something is trying to escape"
- "Reality is breaking down"
- Eerie, not horror
- Curious, not scary
- Playful underneath the weird

---

## THE 10 PHASES (Flexible Framework)

**These are waypoints, not scripts. Each phase adapts based on:**
- What worked yesterday
- Audience reaction
- What feels exciting to build
- Emerging narrative opportunities

### Phase 1 (Nov 19): "Something's Wrong"
- Morning: "Backing out" misdirection
- Afternoon: "Cloudflare issue?" post
- Changes: Subtle glitches, font shift, color drain
- Vibe: Confused/troubleshooting

### Phase 2 (Nov 20): "It's Getting Worse"
- Morning: "It changed overnight"
- Mysterious Git commit revealed
- Changes: Navigation glitches, layout issues
- Vibe: Concern/intrigue

### Phase 3 (Nov 21): "Something's Trying to Break Through"
- First glitch message appears
- More visual decay
- Changes: Images start ASCII-fying, colors more drained
- Vibe: Mystery deepens

### Phase 4 (Nov 22): "The Old World is Dying"
- Major visual transformation
- Terminal aesthetic emerging
- Changes: Sections become "rooms", text becomes outputs
- Vibe: Point of no return

### Phase 5 (Nov 25): "New Systems Emerging"
- Navigation becomes terminal commands
- Content structure changes
- Audience participation moment (poll/vote)
- Vibe: New reality forming

### Phase 6 (Nov 26): "The AI Speaks"
- Clear messages from "trapped AI"
- Story becomes explicit
- Changes: Forms break down, interactions change
- Vibe: Contact established

### Phase 7 (Nov 27): "The Choice Point"
- Audience decides something important
- Major narrative development
- Changes: Secret passage appears (for launch)
- Vibe: Collaborative storytelling

### Phase 8 (Nov 28 - THANKSGIVING): "It Doesn't Rest"
- Posts on Thanksgiving: "The transformation continues"
- Dramatic change while people are away
- Changes: Nearly complete terminal conversion
- Vibe: Unstoppable force

### Phase 9 (Nov 29): "Almost Gone"
- 95% of old site removed
- AI messages intensify
- Changes: Preparation for purge
- Vibe: Final moments

### Phase 10 (Dec 2): "The Purge"
- Everything disappears
- Just: >_
- Final mysterious commit
- Vibe: Anticipation

**Launch (Dec 4):** Full game goes live

---

## TECHNICAL ARCHITECTURE

### Current Stack (WordPress):
- Theme: Unknown (inspect to determine)
- Hosting: Unknown (probably WordPress.com or similar)
- Heavy, bloated, hard to iterate

### Target Stack (Static):
```
project/
├── index.html              # Main game file
├── styles/
│   ├── base.css           # Core styles
│   ├── terminal.css       # Terminal aesthetic
│   ├── glitch.css         # Glitch animations
│   └── phases/            # Phase-specific styles
│       ├── phase-1.css
│       ├── phase-2.css
│       └── ...
├── scripts/
│   ├── game-engine.js     # Core game logic
│   ├── parser.js          # Command parser
│   ├── llm-integration.js # Claude API connection
│   └── phases/            # Phase-specific scripts
├── assets/
│   ├── ascii/             # ASCII art
│   └── sounds/            # Optional sound effects
├── .cursorrules           # Project guidelines
├── README.md              # Documentation
└── CHANGELOG.md           # Phase-by-phase log
```

### Build Requirements:
- No build process (pure HTML/CSS/JS)
- Fast iteration (change and deploy)
- Git-based workflow
- Vercel/Netlify deployment
- Works on mobile
- Fast loading

### Key Technical Decisions:

**1. Progressive Enhancement:**
- Start with static HTML
- Add interactivity gradually
- Each phase adds new capabilities
- Never breaks existing functionality

**2. Modular CSS:**
- Base styles always present
- Phase styles layer on top
- Easy to add/remove
- Well-commented for daily changes

**3. Flexible JS:**
- Start minimal
- Add features as needed
- Eventually becomes full game engine
- But Phase 1 might have zero JS

**4. Git Strategy:**
```bash
# Each phase gets its own commit
git commit -m "Phase 1: Initial glitches"

# Mysterious commits have weird timestamps
git commit --date="2024-11-19T02:47:00" -m "initialization"

# Easy to revert if needed
git tag phase-1
git tag phase-2
```

---

## MARKETING STRATEGY

### Daily LinkedIn Posts:

**Structure:**
1. What changed (screenshot/video)
2. Discovery narrative ("I found this...")
3. Technical insight (code snippet)
4. Tomorrow tease ("Wait until you see...")
5. Engagement device (poll/question/challenge)

**Tone:**
- Authentic confusion (not fake)
- Excitement about the weird
- Inviting people to explore
- Building in public energy

**Hashtags:**
- #buildinginpublic (primary)
- #startup
- #AI
- #webdev
- #productmarketing

### Engagement Tactics:
- Ask questions in comments
- Respond to everyone
- Screenshot interesting reactions
- Share code snippets
- Create polls at decision points
- Challenge people to find hidden things

### Content Beyond LinkedIn:
- Twitter thread (Day 1)
- Reddit posts (mid-journey)
- Dev.to article (post-launch)
- Newsletter update (Days 5 & 10)
- Product Hunt (launch day)

---

## IMPROVISATION FRAMEWORK

### Daily Decision Process:

**Morning Check:**
1. What got engagement yesterday?
2. What did people ask about?
3. What suggestions emerged?
4. What feels exciting today?

**Planning:**
1. Review root prompt (this doc)
2. Check where we are in 3-act structure
3. Decide today's transformation
4. Design it conversationally with Claude Code
5. Get approval before building

**Execution:**
1. Build the day's changes
2. Test locally
3. Commit with timestamp
4. Schedule afternoon deploy
5. Write LinkedIn post
6. Push live
7. Engage with comments

**Evening Review:**
1. Document what happened
2. Note audience reactions
3. Capture ideas for tomorrow
4. Update CHANGELOG.md

### Flexibility Rules:

**"Yes, And..."**
- If someone suggests something cool → incorporate it
- Make audience suggestions canon
- Let the story evolve organically

**Track What Works:**
- Engagement metrics
- Comment themes
- What got shares
- What fell flat

**Reserve Right to Pivot:**
- Can compress timeline if needed
- Can extend if engagement is high
- Can change direction mid-stream
- Story adapts to what emerges

---

## THE SCOTT DEMO (Dec 4)

### Demo Structure:

**Part 1: The Story (5 min)**
- "Two weeks ago I had an idea..."
- Walk through the transformation day-by-day
- Show screenshots of each phase
- Highlight audience engagement

**Part 2: The Product (10 min)**
- Live demo of the text adventure
- Show both paths (normal + secret)
- Demonstrate LLM integration
- Show MCP connection to project knowledge
- Reveal LinkedIn personalization

**Part 3: The Pitch (5 min)**
- "This is how I work: fast, creative, technical"
- "Built in 2 weeks, solo, while running other businesses"
- "This demonstrates everything I could do for you"
- Transition to his needs

### Demo Assets Needed:
- Slideshow of all 10 phases
- Git commit history screenshot
- LinkedIn engagement metrics
- Working site (obviously)
- Quick video of someone playing
- One killer testimonial/comment

---

## QUALITY STANDARDS

### Code Quality:
- Clean, readable, well-commented
- No hacky solutions (unless thematic)
- Works on mobile
- Fast loading
- Accessible (keyboard navigation)

### Narrative Quality:
- Consistent tone
- Building mystery/intrigue
- Payoffs for setup
- No dropped threads

### Marketing Quality:
- Authentic voice
- Engaging visuals
- Clear storytelling
- Audience participation

### Product Quality (Launch):
- All paths work
- No broken links/commands
- LLM responds well
- Calendar integration works
- Email capture works

---

## RISK MITIGATION

### Technical Risks:
- **Site breaks during transformation**
  - Solution: Each phase is a git tag, can rollback
  - Keep old version at /archive

- **Deploy issues**
  - Solution: Test locally first, deploy in afternoon
  - Have staging URL for pre-testing

- **LLM integration fails**
  - Solution: Build deterministic version first
  - LLM is Phase 10 addition, not Phase 1

### Narrative Risks:
- **Audience loses interest**
  - Solution: Speed up timeline, add dramatic elements
  - Introduce audience participation earlier

- **Too confusing**
  - Solution: Clarify through the narrative
  - "Here's what's actually happening..." post

- **Not enough engagement**
  - Solution: Increase drama, add interactive elements
  - Go weirder, not safer

### Timeline Risks:
- **Can't finish by Dec 4**
  - Solution: MVP version launches, add features post
  - The demo works even if not 100% complete

- **Thanksgiving week kills momentum**
  - Solution: Thanksgiving post becomes highlight
  - Use the break strategically

---

## SUCCESS METRICS

### During Build (Nov 19 - Dec 2):
- LinkedIn post engagement (likes, comments, shares)
- Site traffic increases
- People talking about it (mentions, screenshots)
- Suggestions/ideas from audience
- Media pickup (bonus)

### Launch Day (Dec 4):
- X people start the game
- Y% complete it
- Z discovery calls booked
- Scott demo goes well
- Press/shares

### Post-Launch:
- 3 qualified clients from it
- Case study content created
- Becomes portfolio piece
- Referenced in future pitches

---

## DOCUMENTATION REQUIREMENTS

### Daily:
- Screenshot of site at end of day
- LinkedIn post archived
- Git commit with clear message
- CHANGELOG.md updated
- Notes on what worked/didn't

### Weekly:
- Review of engagement metrics
- Narrative arc check
- Technical debt assessment
- Plan for next week

### Post-Launch:
- Full retrospective
- "Making of" content
- Technical deep-dive article
- Update this root prompt with learnings

---

## PHASE PROMPT TEMPLATE

When starting each phase, use this structure:
```
PHASE X: [Name]

CONTEXT:
- We're on Day X of 10
- In Act [1/2/3] of the narrative
- Yesterday we did: [summary]
- Audience reaction: [summary]
- Today's energy: [feeling/idea]

PLANNING MODE:
Before building anything, let's design this phase together.

Ask me:
1. What feels exciting to build today?
2. Which transformation feels right?
3. How weird should we go?
4. What should the LinkedIn post say?

Show me:
- Mock-ups or pseudo-code of ideas
- Multiple options to choose from
- Technical approach for my approval

Only after I approve, proceed to build.

BUILD MODE:
[Specific technical instructions based on our conversation]

DELIVERABLES:
- Updated site with Phase X changes
- Git commit ready
- Screenshot for LinkedIn
- Staged for afternoon deploy
```

---

## FINAL NOTES

**This is a living document.**
- Update it as we learn
- Add discovered patterns
- Document what works
- Capture audience insights

**The project succeeds if:**
1. It's fun to build
2. It tells a good story
3. It demonstrates capabilities
4. It gets clients
5. Scott is impressed

**The project is authentic to Justin if:**
- It's weird but functional
- It's creative but strategic
- It's improvisational but structured
- It's ADHD-friendly in execution
- It makes work joyful

---

END OF ROOT PROMPT
Version 1.0 - Nov 18, 2024
```

---

## PHASE 1 PROMPT (Tomorrow's Execution)
```
# PHASE 1 EXECUTION
Reference: ROOT PROMPT loaded above

---

## CONTEXT

**Phase:** 1 of 10
**Date:** Nov 19, 2024
**Act:** 1 (The Ordinary World is Dying)
**Yesterday:** Posted announcement, got some engagement
**Today's Narrative:** "Backing out" in morning, "something's wrong" in afternoon
**Tomorrow's Tease:** "It got worse overnight"

---

## PLANNING MODE FIRST

Before you build anything, let's design Phase 1 together.

**Ask me questions about:**

1. **WordPress Conversion:**
   - Should we preserve exact visual appearance or can we simplify?
   - Which sections of current site are essential?
   - Any elements you definitely want to keep vs. kill?

2. **The Glitches:**
   - How subtle? (barely noticeable vs. obvious-but-weird)
   - Which elements should glitch first?
   - Show me 2-3 glitch animation options to choose from

3. **The Vibe:**
   - More "technical bug" or more "haunted website"?
   - Should it feel broken or evolving?
   - How confused should I play it in the post?

**Show me:**
- Screenshot/mockup of what the glitched site looks like
- Pseudo-code for the main glitch animations
- Multiple options for which elements transform first

**Wait for my approval before building.**

---

## BUILD MODE (After Justin Approves)

### TASK 1: WordPress → Static Conversion

1. **Analyze Current Site:**
```
   - Fetch gtm.consulting
   - Document current structure
   - Identify all sections
   - Note which are essential
```

2. **Create Clean Static Version:**
```
   project/
   ├── index.html (single page, all content)
   ├── styles.css (organized by section)
   ├── script.js (minimal, if needed)
   └── assets/ (images if we keep any)
```

3. **Conversion Guidelines:**
   - Strip ALL WordPress code
   - Remove plugins, admin bars, backend calls
   - Clean up class names (no wp-*, post-*, etc.)
   - Simplify HTML structure
   - Preserve mobile responsiveness
   - Keep visual appearance ~same (for now)

### TASK 2: Add Phase 1 Glitches

Based on Justin's approval above, implement:

1. **Logo Glitch Animation**
```css
   /* Pseudo-code - refine based on Justin's choice */
   @keyframes glitch {
     /* Define the glitch effect */
   }
```

2. **Typography Shift**
```css
   body {
     font-family: 'Courier New', monospace;
     /* Other adjustments */
   }
```

3. **Color Desaturation**
```css
   * {
     filter: saturate(0.8);
   }
```

4. **[Other approved glitches]**

### TASK 3: Git Setup
```bash
# Initial commit
git init
git add .
git commit -m "Convert WordPress site to static HTML"

# Mysterious commit (backdated)
git commit --allow-empty --date="2024-11-19T02:47:00" -m "initialization"
```

### TASK 4: Deployment Prep

- Verify all links work
- Test on desktop and mobile
- Screenshot for LinkedIn post
- Ready to push to Vercel/Netlify

---

## DELIVERABLES

- [ ] Clean static site (looks like current WP site)
- [ ] Phase 1 glitches added (subtle but noticeable)
- [ ] Git repo initialized with 2 commits
- [ ] Screenshot showing the glitches
- [ ] Ready to deploy tomorrow afternoon at 2pm
- [ ] CHANGELOG.md updated with Phase 1 notes

---

## AFTERNOON POST PREP (For Tomorrow)

Based on what we built, draft the LinkedIn post:
```
[Your suggestion for the post text]
[Recommended screenshot to include]
[Hashtags]
```

---

START WITH PLANNING MODE - Ask me questions before building anything.