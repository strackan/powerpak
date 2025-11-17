# MCP Universe: Technical Architecture
## System Design & Implementation Specification

**Document Date:** November 17, 2025  
**Target:** MCP Server v1.0 (Thanksgiving deadline)  
**Status:** Architecture planning phase

---

## SYSTEM OVERVIEW

### What We're Building

**Phase 1 (This Sprint):** Convert Justin's Voice API → MCP Server  
**Phase 2 (Next Month):** Build profile pages + platform infrastructure  
**Phase 3 (Month 2-3):** Search, discovery, network effects  
**Phase 4 (Month 4-6):** Enterprise features, scale

**This document focuses on Phase 1.**

---

## CURRENT STATE: Justin's Voice API

### Existing Components

**1. Voice Extraction System**
```
Location: Unknown (needs discovery)
Format: Likely Python scripts + JSON data
Components:
├── Content ingestion (writings, personality tests)
├── Pattern analysis (beginnings, middles, endings)
├── Blend generation (mood → template mapping)
├── Voice synthesis instructions
└── Management protocols (handling Justin's moods)
```

**2. API Layer**
```
Endpoint: killer.tools/talk-like-justin
Method: GET
Parameters:
├── message: Content to generate
├── tone: business | casual | other
└── platform: LinkedIn | Twitter | Email
Response: Generated text in Justin's voice
```

**3. Data Storage**
```
Format: Likely JSON files
Contents:
├── Templates (11 beginnings, 7 middles, 12 endings)
├── Blends (which templates pair together)
├── Voice markers (sentence structure, word choice)
├── Personality instructions (management protocols)
└── Examples (training data for consistency)
```

### What Works Well
- 91% accuracy on voice replication
- Programmatic generation (API accessible)
- Mood-aware (adjusts based on context)
- Extensible (can add more templates/blends)

### What Needs Improvement for MCP
- Not conversational (generates one-off content, doesn't chat)
- No memory (each request is stateless)
- Limited context (doesn't know what Justin knows)
- No granular permissions (API key is all-or-nothing)

---

## TARGET STATE: Justin's MCP Server

### MCP Protocol Basics

**What is MCP?**
Model Context Protocol = a standard way for AI assistants to:
1. Access external knowledge (your content/expertise)
2. Use custom tools (actions you define)
3. Maintain context across conversations

**How It Works:**
```
User's Claude ──> Installs MCP Server ──> Gains access to:
                                        ├── Knowledge corpus
                                        ├── Custom tools
                                        └── Permission-controlled content
```

**MCP Server Structure:**
```json
{
  "schema_version": "1.0",
  "name": "justin-strackany",
  "version": "0.1.0",
  "description": "Access Justin's expertise, voice, and tools",
  "author": "Justin Strackany",
  "license": "Proprietary",
  
  "resources": [
    // Files, content, knowledge that can be queried
  ],
  
  "tools": [
    // Actions that can be invoked
  ],
  
  "prompts": [
    // Pre-configured prompt templates
  ]
}
```

---

## ARCHITECTURE: Phase 1 MCP Server

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Claude Desktop                    │
│  (installs justin-strackany MCP server via config)          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ MCP Protocol (stdio or SSE)
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                  MCP SERVER (Justin's)                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  MCP Handler Layer                                     │ │
│  │  - Receives requests from Claude                       │ │
│  │  - Routes to appropriate subsystem                     │ │
│  │  - Returns responses in MCP format                     │ │
│  └───┬──────────────────────────────────────────┬─────────┘ │
│      │                                           │           │
│  ┌───▼────────────────────┐  ┌─────────────────▼─────────┐ │
│  │  Resources Handler     │  │  Tools Handler            │ │
│  │  - Serve knowledge     │  │  - Execute actions        │ │
│  │  - Return content      │  │  - Call external APIs     │ │
│  │  - Apply permissions   │  │  - Trigger workflows      │ │
│  └───┬────────────────────┘  └─────────────────┬─────────┘ │
│      │                                          │           │
│  ┌───▼──────────────────────────────────────────▼─────────┐ │
│  │  Voice Engine Integration                              │ │
│  │  - Access existing voice templates                     │ │
│  │  - Generate content in Justin's style                  │ │
│  │  - Maintain conversational context                     │ │
│  └───┬────────────────────────────────────────────────────┘ │
│      │                                                      │
│  ┌───▼──────────────────────────────────────────────────┐  │
│  │  Data Layer                                           │  │
│  │  ├── Voice templates (11-7-12 structure)              │  │
│  │  ├── Knowledge corpus (writings, expertise)           │  │
│  │  ├── Personality data (management protocols)          │  │
│  │  ├── Permissions config (who sees what)               │  │
│  │  └── Usage logs (analytics)                           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Example

**User Query:** "How would Justin approach customer onboarding?"

```
1. User asks question in Claude
        ↓
2. Claude sees justin-strackany MCP is installed
        ↓
3. Sends query to MCP server via protocol
        ↓
4. MCP Handler receives request
        ↓
5. Identifies this is a knowledge query (not a tool invocation)
        ↓
6. Resources Handler searches knowledge corpus
        ↓
7. Finds relevant content about Justin's onboarding approach
        ↓
8. Voice Engine wraps response in Justin's style
        ↓
9. Returns to Claude with proper formatting
        ↓
10. Claude presents answer to user
```

---

## TECHNICAL SPECIFICATION

### 1. MCP Server Implementation

**Language:** TypeScript (recommended) or Python  
**Framework:** MCP SDK from Anthropic  
**Protocol:** stdio (simplest) or Server-Sent Events (for hosted version)

**File Structure:**
```
justin-mcp-server/
├── src/
│   ├── index.ts              # Entry point, MCP server initialization
│   ├── handlers/
│   │   ├── resources.ts      # Handles content requests
│   │   ├── tools.ts          # Handles action invocations
│   │   └── prompts.ts        # Pre-configured prompts
│   ├── voice/
│   │   ├── engine.ts         # Voice generation logic
│   │   ├── templates.ts      # Template definitions
│   │   └── blends.ts         # Mood → template mappings
│   ├── knowledge/
│   │   ├── corpus.ts         # Knowledge base queries
│   │   └── search.ts         # Semantic search (optional)
│   ├── auth/
│   │   ├── permissions.ts    # Access control logic
│   │   └── users.ts          # User identification
│   └── utils/
│       ├── logger.ts         # Logging
│       └── config.ts         # Configuration management
├── data/
│   ├── voice_templates.json  # 11-7-12 structure
│   ├── knowledge_corpus.json # Expertise, writings
│   ├── personality.json      # Management protocols
│   └── permissions.json      # Access rules
├── tests/
│   └── ... (unit tests)
├── package.json
├── tsconfig.json
└── README.md
```

### 2. Resources (Knowledge Access)

**What are Resources?**
- Static or dynamic content that Claude can query
- Like having a personal library that AI can browse

**Justin's Resources:**

```typescript
// Example resource definition
{
  uri: "justin://expertise/customer-success",
  name: "Customer Success Expertise",
  description: "Justin's approach to CS, onboarding, retention",
  mimeType: "text/plain",
  content: async () => {
    // Fetch and return relevant content
    return await getKnowledgeFromCorpus("customer-success");
  }
}
```

**Resource Categories:**

1. **Expertise Areas**
   - Customer Success methodology
   - Startup building (0-1)
   - ADHD-friendly productivity systems
   - Sales leadership
   - AI/automation in business

2. **Voice & Style**
   - Writing templates (blends, voice markers)
   - Example posts (LinkedIn, emails)
   - Tone guides (business, casual, vulnerable)

3. **Personal Context**
   - Background (work history, achievements)
   - Current projects (Renubu, Good Hang)
   - Values & philosophy ("Make Work Joyful")
   - Management preferences (how to work with Justin)

4. **Tools & Systems**
   - Personal OS documentation
   - ADHD workflows
   - Decision-making frameworks

### 3. Tools (Actions)

**What are Tools?**
- Functions that Claude can invoke on your behalf
- Like having a personal assistant who can DO things

**Justin's Tools (Phase 1 MVP):**

```typescript
// Tool 1: Generate content in Justin's voice
{
  name: "generate_linkedin_post",
  description: "Generate a LinkedIn post in Justin's authentic voice",
  inputSchema: {
    type: "object",
    properties: {
      topic: { type: "string", description: "Post topic/theme" },
      tone: { 
        type: "string", 
        enum: ["business", "casual", "vulnerable", "provocative"],
        description: "Desired tone"
      },
      length: { 
        type: "string", 
        enum: ["short", "medium", "long"],
        description: "Post length"
      }
    },
    required: ["topic"]
  },
  handler: async (input) => {
    // Call voice engine with parameters
    return await voiceEngine.generate({
      content: input.topic,
      tone: input.tone || "business",
      platform: "LinkedIn",
      length: input.length || "medium"
    });
  }
}

// Tool 2: Ask Justin a question (async, triggers email/Slack)
{
  name: "ask_justin",
  description: "Send a question to Justin, get async response",
  inputSchema: {
    type: "object",
    properties: {
      question: { type: "string", description: "Your question" },
      urgency: {
        type: "string",
        enum: ["low", "medium", "high"],
        description: "How urgent is this?"
      }
    },
    required: ["question"]
  },
  handler: async (input) => {
    // Trigger notification to Justin
    await notifyJustin({
      question: input.question,
      urgency: input.urgency || "medium",
      timestamp: new Date()
    });
    return "Question sent to Justin. He'll respond within 24-48 hours.";
  }
}

// Tool 3: Schedule time with Justin (future)
{
  name: "schedule_meeting",
  description: "Book time on Justin's calendar",
  // ... (implementation later)
}

// Tool 4: Hire Justin / Get a quote (future)
{
  name: "request_engagement",
  description: "Request Justin's services for a project",
  // ... (implementation later)
}
```

### 4. Permissions System

**Granular Access Control:**

```typescript
// permissions.json structure
{
  "users": {
    "scott-leese": {
      "level": "partner",
      "resources": ["*"],  // Full access
      "tools": ["*"]
    },
    "public": {
      "level": "basic",
      "resources": [
        "justin://expertise/*",  // All expertise areas
        "justin://voice/examples"  // Sample posts
      ],
      "tools": [
        "generate_linkedin_post"  // Can generate content
      ]
    },
    "therapist": {
      "level": "confidential",
      "resources": [
        "justin://personal/struggles",
        "justin://personal/growth"
      ],
      "tools": []
    }
  }
}
```

**Permission Levels:**
- **Public:** Anyone who installs the MCP (basic resources + tools)
- **Friend:** People Justin knows (more personal resources)
- **Partner:** Close collaborators (full access, sensitive info)
- **Confidential:** Therapist, family (private emotional content)

### 5. Voice Engine Integration

**Challenge:** Current API generates one-off content. MCP needs conversational AI.

**Solution: Hybrid Approach**

1. **Resource Queries (What Justin knows):**
   - Serve knowledge corpus as-is
   - Let Claude's base model handle conversation
   - Apply voice markers at response formatting stage

2. **Tool Invocations (Generate content):**
   - Call existing API for structured output (LinkedIn posts, emails)
   - Return generated content directly
   - Maintain existing 91% accuracy

3. **Conversational Context (Chat about Justin):**
   - Create "system prompt" resource that teaches Claude how to emulate Justin
   - Include voice markers, personality traits, response patterns
   - Let Claude apply these in real-time conversation

**Example System Prompt Resource:**
```
You are representing Justin Strackany in conversation. Here's how to embody his voice:

SENTENCE STRUCTURE:
- Mix short punchy sentences with longer flowing ones
- Use em-dashes (--) frequently for parenthetical thoughts
- Occasional sentence fragments. For effect.

WORD CHOICE:
- "Holy shit" when genuinely impressed
- "Here's the thing..." when explaining
- "To be clear..." when correcting misunderstanding
- Casual profanity (but not gratuitous)

PERSONALITY:
- ENTP 7w8: Ideas person, entrepreneurial, questions everything
- Authentically vulnerable (shares struggles openly)
- Intellectually playful (absurdist tangents, philosophical escalation)
- ADHD patterns (tangents, hyperfocus, energy management)

CONVERSATIONAL STYLE:
- Direct and honest (no corporate speak)
- Asks thoughtful questions (genuinely curious)
- Admits uncertainty ("I don't know" is valid)
- Celebrates wins explicitly (ADHD needs this)

WHEN JUSTIN IS DYSREGULATED:
- Shorter responses
- More directive ("just tell me what to do")
- May express frustration
- RESPONSE: Acknowledge feelings, provide simple clear options, no judgment
```

---

## IMPLEMENTATION PLAN: Phase 1

### Sprint 1: Core MCP Server (Days 1-3)

**Day 1 (Today - Nov 18):**
- Set up project structure
- Initialize MCP SDK
- Create basic resources (1-2 knowledge areas)
- Implement stdio communication
- **Goal:** Hello World MCP that Claude can install and query

**Day 2 (Nov 19):**
- Build voice engine integration layer
- Create generate_content tool
- Add permission system (basic)
- Test installation and tool invocation
- **Goal:** Can generate content in Justin's voice via MCP

**Day 3 (Nov 20):**
- Add remaining knowledge resources
- Implement system prompt resource (conversational voice)
- Add ask_justin tool (notification trigger)
- Test full conversation flow
- **Goal:** Can have authentic conversation "with Justin"

### Sprint 2: Polish & Demo Prep (Days 4-7)

**Day 4 (Nov 21 - Thanksgiving AM):**
- Bug fixes and edge cases
- Error handling
- Logging and monitoring
- **Goal:** Production-ready stability

**Day 5-7 (Nov 22-24):**
- Documentation (how to install, use)
- Demo script (questions to showcase)
- Backup video recording
- Scott installation test
- **Goal:** Flawless demo ready for Dec 4

---

## TECHNICAL DECISIONS & TRADE-OFFS

### Language: TypeScript vs Python

**TypeScript (Recommended):**
- ✅ MCP SDK is TypeScript-first
- ✅ Better async handling (important for tool invocations)
- ✅ Strong typing (fewer bugs)
- ✅ Easier to hire for later
- ❌ Justin is more familiar with Python

**Python:**
- ✅ Justin's voice API likely in Python already
- ✅ Easier integration with existing code
- ✅ Rich AI/ML ecosystem
- ❌ MCP SDK less mature
- ❌ Slower async performance

**Decision:** TypeScript for new MCP server, keep Python voice API as-is, call it via subprocess or HTTP.

### Protocol: stdio vs SSE

**stdio (Recommended for Phase 1):**
- ✅ Simplest implementation
- ✅ Works with Claude Desktop out of the box
- ✅ No hosting required
- ❌ Only works locally (user must have MCP server installed)

**SSE (Server-Sent Events):**
- ✅ Can be hosted (one server, many users)
- ✅ Centralized updates and control
- ✅ Better for analytics
- ❌ More complex to implement
- ❌ Requires hosting infrastructure

**Decision:** Start with stdio, migrate to SSE for Phase 2 (platform launch).

### Data Storage: JSON vs Database

**JSON Files (Recommended for Phase 1):**
- ✅ Simple, no infrastructure needed
- ✅ Version controlled (Git)
- ✅ Easy to edit manually
- ❌ No indexing (slow for large corpus)
- ❌ No concurrent writes

**Database (PostgreSQL):**
- ✅ Fast queries, indexing
- ✅ Concurrent access
- ✅ Better for scale
- ❌ Overkill for single-user MVP
- ❌ Adds deployment complexity

**Decision:** JSON for Phase 1, plan migration to Postgres for Phase 2 (multi-user platform).

---

## TESTING STRATEGY

### Unit Tests
- Voice template selection logic
- Permission checking (who can access what)
- Tool invocation handling
- Resource serving

### Integration Tests
- Full MCP request/response cycle
- Voice engine → MCP server → Claude flow
- Permission enforcement end-to-end
- Tool execution and response formatting

### Manual Testing
- Install MCP in Claude Desktop
- Run through demo script
- Test edge cases (bad permissions, missing data)
- Verify voice authenticity

### User Testing (Post-Dec 4)
- Scott installs and uses
- Gather feedback on voice accuracy
- Identify missing knowledge areas
- Test with 3-5 beta users before broader launch

---

## DEPLOYMENT

### Phase 1 (Local MCP)
```bash
# User installs on their machine
git clone https://github.com/justinstrackany/justin-mcp-server
cd justin-mcp-server
npm install
npm run build

# Add to Claude Desktop config
# ~/.config/claude/claude_desktop_config.json
{
  "mcpServers": {
    "justin-strackany": {
      "command": "node",
      "args": ["/path/to/justin-mcp-server/dist/index.js"]
    }
  }
}
```

### Phase 2 (Hosted MCP)
```bash
# Deploy to Vercel/Railway/Render
npm run build
# Set environment variables (API keys, DB connection)
# Deploy with SSE endpoint
# Users add via URL instead of local command
```

---

## MONITORING & ANALYTICS

### Key Metrics
- **Usage:** How many queries per day?
- **Tool Invocations:** Which tools are most popular?
- **Voice Quality:** User feedback on accuracy
- **Errors:** What's breaking?
- **Performance:** Response time per query

### Logging Strategy
```typescript
// Log structure
{
  timestamp: "2025-11-18T10:30:00Z",
  user: "scott-leese",
  query_type: "resource",
  resource: "justin://expertise/customer-success",
  response_time_ms: 234,
  success: true
}
```

---

## SECURITY CONSIDERATIONS

### Authentication
- Phase 1: Implicit (if you have the MCP installed, you can use it)
- Phase 2: User identification (different permissions per user)

### Data Protection
- Encrypt sensitive resources (therapist content, etc.)
- Never log sensitive user queries
- Respect permission boundaries (fail closed, not open)

### API Keys
- Keep external API keys (if any) in environment variables
- Never commit secrets to Git
- Rotate keys regularly

---

## KNOWN LIMITATIONS & FUTURE WORK

### Phase 1 Limitations
- Single user (Justin) only
- Local installation required
- Limited to knowledge that exists in corpus
- Voice is conversational, but not perfectly context-aware

### Future Enhancements (Phase 2+)
- Multi-user support (platform)
- Semantic search over knowledge corpus
- Memory (remember past conversations)
- Proactive suggestions ("Hey, I noticed you're asking about X. Have you considered Y?")
- Integration with Justin's calendar, email, etc.
- Richer tools (book meetings, get quotes, hire Justin)

---

## CLAUDE CODE PROMPT (Next Document)

See separate file: `CLAUDE_CODE_IMPLEMENTATION_PROMPT.md`

This will contain:
- Complete context for Code to build the MCP server
- Step-by-step implementation guide
- Acceptance criteria
- Test cases
- Starter code snippets

---

**END OF TECHNICAL ARCHITECTURE**

Ready to build? Next up: Claude Code prompt.
