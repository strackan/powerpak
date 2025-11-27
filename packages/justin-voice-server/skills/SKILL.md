---
skill_id: justin-voice-api
name: Justin's Voice - Writing Style API
version: 1.0.0
author: Justin Strackany
created: 2025-11-22
updated: 2025-11-22
---

# Justin's Voice - Writing Style API

## Overview

Justin's Voice is a template-based writing system that captures Justin Strackany's distinctive writing style. It provides 30 templates, 9 proven blend recipes, and 23 writing rules to generate content that sounds authentically like Justin.

**Key Capability:** Generate emails, updates, posts, and messages in Justin's voice by combining proven template patterns.

## API Configuration

### Base URL
```
http://localhost:3001/api
```

*Note: For production, this would be deployed to a public URL*

### Authentication
Currently open API (add auth headers when deployed)

## Core Concepts

### Templates
Templates are proven writing patterns organized into categories:

- **Beginnings (O1-O6)**: How to start (vulnerability, contrarian, context-shift, etc.)
- **Middles (M1-M7)**: How to develop (story arc, frameworks, tactical how-to, etc.)
- **Endings (E1-E6)**: How to close (invitation, cliffhanger, mic drop, etc.)
- **Flavors (F1-F10)**: Special ingredients (vulnerability, specificity, humor, etc.)
- **Transitions (T1-T4)**: How to connect sections

### Blend Recipes
Pre-configured template combinations that work well together:

1. **THE AUTHENTIC FOUNDER** - Vulnerability + Story + Invitation
2. **THE TACTICAL TEACHER** - Context-shift + Framework + Mic drop
3. **THE CONTRARIAN LEADER** - Contrarian + Pattern + CTA
4. **THE VULNERABLE TRUTH-TELLER** - Direct + Experience + Invitation
5. **THE STRATEGIC STORYTELLER** - Story + Framework + Cliffhanger
6. And 4 more...

### Writing Rules
23 guidelines covering:
- Formatting (line breaks, bullets, emphasis)
- Voice (conversational, vulnerable, specific)
- Content (show don't tell, avoid jargon)

## API Endpoints

### GET /templates

List all available templates by category.

**Request:**
```bash
GET http://localhost:3001/api/templates
```

**Response:**
```json
{
  "beginnings": [
    {
      "id": "o1",
      "name": "The Vulnerable Opening",
      "description": "Start with a personal admission or struggle",
      "example": "I used to think I had it all figured out. I was wrong."
    },
    ...
  ],
  "middles": [...],
  "endings": [...],
  "flavors": [...],
  "transitions": [...]
}
```

---

### GET /templates/:category

Get templates for a specific category.

**Categories:** `beginnings`, `middles`, `endings`, `flavors`, `transitions`

**Request:**
```bash
GET http://localhost:3001/api/templates/beginnings
```

**Response:**
```json
[
  {
    "id": "o1",
    "name": "The Vulnerable Opening",
    "description": "Start with a personal admission",
    "example": "I used to think..."
  },
  ...
]
```

---

### GET /blends

List all blend recipes.

**Request:**
```bash
GET http://localhost:3001/api/blends
```

**Response:**
```json
[
  {
    "name": "THE AUTHENTIC FOUNDER",
    "description": "Vulnerable, story-driven, inviting",
    "templates": {
      "beginning": "o1",
      "middle": "m1",
      "ending": "e2"
    },
    "useCase": "Sharing founder journey, personal updates"
  },
  ...
]
```

---

### GET /blends/:name

Get a specific blend recipe.

**Request:**
```bash
GET http://localhost:3001/api/blends/THE%20AUTHENTIC%20FOUNDER
```

**Response:**
```json
{
  "name": "THE AUTHENTIC FOUNDER",
  "description": "Vulnerable, story-driven, inviting",
  "templates": {
    "beginning": "o1",
    "middle": "m1",
    "ending": "e2"
  },
  "useCase": "Sharing founder journey, personal updates",
  "examples": [...]
}
```

---

### GET /rules

Get all writing rules.

**Request:**
```bash
GET http://localhost:3001/api/rules
```

**Response:**
```json
{
  "formatting": [
    "Use single line breaks between paragraphs",
    "Bold key phrases sparingly",
    ...
  ],
  "voice": [
    "Write like you talk",
    "Be vulnerable",
    ...
  ],
  "content": [
    "Show, don't tell",
    "Be specific",
    ...
  ]
}
```

---

### POST /generate

**Generate content in Justin's voice.**

**Request:**
```bash
POST http://localhost:3001/api/generate
Content-Type: application/json

{
  "blendName": "THE AUTHENTIC FOUNDER",
  "topic": "Launching Founder OS this weekend",
  "context": "Product launch to early adopters"
}
```

Or specify custom templates:
```json
{
  "templateIds": {
    "beginning": "o1",
    "middle": "m1",
    "ending": "e2"
  },
  "topic": "Why we built PowerPak",
  "context": "Explaining vision to investors"
}
```

**Response:**
```json
{
  "content": "I thought building a Chief of Staff AI would take months.\n\nTurns out, when you focus on conversations over automation, you can ship in a weekend.\n\nWe're launching Founder OS today...\n\n[Generated content in Justin's voice]",
  "templatesUsed": {
    "beginning": "o1",
    "middle": "m1",
    "ending": "e2"
  },
  "voiceScore": 87
}
```

---

### POST /analyze

Analyze text to score how "Justin-like" it is (0-100).

**Request:**
```bash
POST http://localhost:3001/api/analyze
Content-Type: application/json

{
  "text": "Your text to analyze..."
}
```

**Response:**
```json
{
  "voiceScore": 73,
  "breakdown": {
    "vulnerability": 8,
    "specificity": 7,
    "conversational": 9,
    "formatting": 6
  },
  "strengths": [
    "Conversational tone",
    "Good use of specificity"
  ],
  "weaknesses": [
    "Could use more vulnerability",
    "Formatting needs line breaks"
  ]
}
```

---

### POST /suggest

Get specific suggestions to improve voice match.

**Request:**
```bash
POST http://localhost:3001/api/suggest
Content-Type: application/json

{
  "text": "Your text to improve..."
}
```

**Response:**
```json
{
  "suggestions": [
    "Add vulnerability: Share what you were wrong about",
    "Use shorter paragraphs: Break after 2-3 lines",
    "Be more specific: Replace 'soon' with exact date",
    "Remove jargon: 'leverage' → 'use'"
  ]
}
```

---

## Common Use Cases

### Use Case 1: Email to Investor

**Scenario:** Update investor on PowerPak progress

```bash
POST /api/generate
{
  "blendName": "THE AUTHENTIC FOUNDER",
  "topic": "PowerPak demo progress for Scott meeting",
  "context": "investor update, demo Dec 4th, making good progress"
}
```

Claude will generate:
```
Hey Scott,

I thought I'd have this demo ready a week ago.
Turns out, building the right thing takes longer than building something fast.

We're on track for Dec 4th...
[Rest in Justin's voice]
```

---

### Use Case 2: LinkedIn Post

**Scenario:** Share Founder OS launch

```bash
POST /api/generate
{
  "blendName": "THE CONTRARIAN LEADER",
  "topic": "Why we built Founder OS for conversations, not automation",
  "context": "product launch, going against AI automation trend"
}
```

Generates:
```
Everyone's building AI agents to automate your work.

We built one to have better conversations with you.

Here's why...
[Rest in Justin's voice]
```

---

### Use Case 3: Check-in Message

**Scenario:** Reach out to Becky (investor you haven't talked to in a while)

```bash
POST /api/generate
{
  "blendName": "THE VULNERABLE TRUTH-TELLER",
  "topic": "Check-in with Becky, haven't talked in 3 weeks",
  "context": "relationship: investor, sentiment: concerned, last topic: proposal feedback"
}
```

Generates:
```
Hey Becky,

I realized it's been 3 weeks since we talked about the proposal.

That's on me – got heads-down on the demo and lost track.

Quick question: still good to chat this week?
```

---

## Combining with Founder OS

To write in Justin's voice with context from Founder OS:

**Step 1: Query Founder OS for context**
```bash
GET https://dokaliwfnptcwhywjltp.supabase.co/rest/v1/founder_relationships?name=ilike.%Becky%
```

**Step 2: Use that context in Justin's Voice**
```bash
POST http://localhost:3001/api/generate
{
  "blendName": "THE AUTHENTIC FOUNDER",
  "topic": "Check-in with Becky about PowerPak demo",
  "context": "Last contact: Nov 1, Sentiment: Concerned, Notes: Waiting for proposal feedback"
}
```

**Step 3: Result is personalized message in Justin's voice**

---

## Template Recommendations

### For Different Contexts

**Investor Updates:**
- Blend: THE AUTHENTIC FOUNDER
- Beginning: O1 (Vulnerable)
- Middle: M1 (Story Arc)
- Ending: E2 (Invitation)

**Product Launches:**
- Blend: THE CONTRARIAN LEADER
- Beginning: O3 (Contrarian)
- Middle: M2 (Pattern Recognition)
- Ending: E4 (CTA)

**Team Communication:**
- Blend: THE TACTICAL TEACHER
- Beginning: O2 (Context-shift)
- Middle: M4 (Framework)
- Ending: E3 (Mic Drop)

**Personal Outreach:**
- Blend: THE VULNERABLE TRUTH-TELLER
- Beginning: O6 (Direct)
- Middle: M3 (Personal Experience)
- Ending: E2 (Invitation)

---

## Voice Scoring

Voice scores range from 0-100:

- **90-100**: Perfect Justin voice
- **80-89**: Very strong match
- **70-79**: Good match, minor improvements needed
- **60-69**: Okay match, several improvements needed
- **Below 60**: Needs significant revision

**Key factors:**
- Vulnerability (sharing what you got wrong)
- Specificity (exact numbers, dates, names)
- Conversational tone (write like you talk)
- Formatting (line breaks, bold sparingly)
- Show don't tell (stories not claims)

---

## Running the API

### Start the HTTP server:
```bash
cd packages/justin-voice-server
npm run serve:http
```

### Or deploy to production:
```bash
# Deploy to your hosting platform
# Update Base URL in this Skills file
# Add authentication headers
```

---

## Integration Patterns

### Pattern 1: Content Generation
```
User → Claude → Justin Voice API → Generated content
```

### Pattern 2: Content Review
```
User writes draft → Claude → Analyze API → Suggestions → User revises
```

### Pattern 3: Combined with Founder OS
```
Claude → Founder OS (get context) → Justin Voice (generate with context) → Result
```

---

## Troubleshooting

**"API not responding"**
- Check server is running: `npm run serve:http`
- Verify port 3001 is not in use

**"Low voice score"**
- Use /suggest endpoint for specific improvements
- Try different blend recipes
- Add more context to generation request

**"Content doesn't match context"**
- Provide more specific context in request
- Include relationship details, sentiment, recent interactions

---

## Future Enhancements

- [ ] Authentication (API keys)
- [ ] Rate limiting
- [ ] Voice fine-tuning per user
- [ ] Template customization
- [ ] Multi-language support
- [ ] Supabase Edge Function deployment

---

**Ready to use!** Start generating content in Justin's voice with proven template patterns.
