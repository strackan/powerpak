# Claude Code Implementation Prompt: Justin's MCP Server
## Build the Foundation for AI-Native Profile System

---

## PROJECT CONTEXT

You are building the first version of Justin Strackany's Model Context Protocol (MCP) server. This is Phase 1 of a larger vision to create "LinkedIn for AI" - a platform where people can install each other's expertise, voice, and personality as power packs for their AI assistants.

**Your mission today:** Build the core MCP server infrastructure so that when someone installs "justin-strackany" in their Claude Desktop, they can:
1. Ask questions about Justin's expertise and get authentic responses
2. Generate content (LinkedIn posts, emails) in Justin's voice
3. Have natural conversations that feel like chatting with Justin himself

---

## WHAT YOU'RE BUILDING

### The Technical Goal
Create an MCP server that:
- Implements Anthropic's Model Context Protocol specification
- Serves knowledge resources (Justin's expertise)
- Provides custom tools (content generation, etc.)
- Applies permission-based access control
- Integrates with Justin's existing voice API

### The User Experience Goal
When Scott (or anyone) installs Justin's MCP:
1. They can ask: "How would Justin approach customer onboarding?"
   → Get a thoughtful, authentic response in Justin's voice
   
2. They can invoke: generate_linkedin_post("AI in CS workflows", tone="business")
   → Receive a 3-paragraph post that sounds exactly like Justin wrote it
   
3. They can chat naturally: "What's your take on the future of AI?"
   → Have a back-and-forth conversation that feels like talking to Justin

---

## YOUR STARTING POINT

### What EXISTS (You Need to Discover/Integrate)

**1. Justin's Voice API**
- Location: Unknown (likely in a separate repo or codebase)
- Functionality: Generates content in Justin's style
- Endpoint: `killer.tools/talk-like-justin`
- Input: message, tone, platform
- Output: Generated text with 91% accuracy

**Action:** You'll need to either:
- Find this code and integrate it directly, OR
- Call it as an external HTTP API, OR
- Replicate its core logic based on available templates

**2. Voice Templates & Data**
- Structure: 11 beginnings, 7 middles, 12 endings
- Blends: Mappings of which templates pair well
- Voice markers: Sentence structure, word choice patterns
- Personality data: ENTP 7w8, ADHD patterns, management protocols

**Action:** Create JSON files that capture this structure

**3. Knowledge Corpus**
- Justin's writings (LinkedIn posts, blog articles, private notes)
- Expertise areas: Customer Success, startups, ADHD productivity, AI/automation
- Background: Work history, current projects (Renubu, Good Hang)

**Action:** Organize into queryable resources

### What DOES NOT EXIST (You Need to Build)

**1. MCP Server Infrastructure**
- Entry point (index.ts)
- Protocol handling (stdio communication)
- Request routing (resources vs. tools)
- Response formatting

**2. Resources Handler**
- Serve knowledge on demand
- Apply permissions
- Format responses

**3. Tools Handler**
- Execute actions (generate content, send notifications)
- Call external APIs if needed
- Return structured responses

**4. Permission System**
- User identification (who's asking?)
- Access control (what can they see?)
- Default to "public" permissions for MVP

---

## IMPLEMENTATION GUIDE

### Step 1: Project Setup (30 minutes)

**Create Project Structure:**
```
justin-mcp-server/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── server.ts                # MCP server initialization
│   ├── handlers/
│   │   ├── resources.ts         # Handle knowledge queries
│   │   ├── tools.ts             # Handle action invocations
│   │   └── prompts.ts           # Pre-configured prompts (optional)
│   ├── voice/
│   │   ├── engine.ts            # Voice generation logic
│   │   ├── templates.ts         # Template definitions
│   │   └── types.ts             # Voice-related types
│   ├── knowledge/
│   │   ├── corpus.ts            # Knowledge base access
│   │   └── resources.ts         # Resource definitions
│   ├── auth/
│   │   └── permissions.ts       # Permission checking
│   └── utils/
│       ├── logger.ts            # Logging utility
│       └── config.ts            # Configuration
├── data/
│   ├── voice_templates.json     # Voice structure
│   ├── knowledge_corpus.json    # Expertise content
│   ├── personality.json         # Personality data
│   └── permissions.json         # Access rules
├── tests/
│   └── ... (add tests as you go)
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

**Install Dependencies:**
```json
{
  "name": "justin-mcp-server",
  "version": "0.1.0",
  "description": "Justin Strackany's MCP Server - AI-native profile",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "ts-node src/index.ts",
    "test": "jest"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.9.0",
    "@modelcontextprotocol/sdk": "^0.1.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
```

**TypeScript Config:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Step 2: MCP Server Core (1 hour)

**src/index.ts:**
```typescript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ResourcesHandler } from './handlers/resources.js';
import { ToolsHandler } from './handlers/tools.js';
import { logger } from './utils/logger.js';

async function main() {
  logger.info('Starting Justin Strackany MCP Server...');

  // Initialize MCP server
  const server = new Server(
    {
      name: 'justin-strackany',
      version: '0.1.0',
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  // Initialize handlers
  const resourcesHandler = new ResourcesHandler();
  const toolsHandler = new ToolsHandler();

  // Register resource handlers
  server.setRequestHandler('resources/list', async () => {
    return { resources: await resourcesHandler.list() };
  });

  server.setRequestHandler('resources/read', async (request) => {
    return { contents: await resourcesHandler.read(request.params.uri) };
  });

  // Register tool handlers
  server.setRequestHandler('tools/list', async () => {
    return { tools: await toolsHandler.list() };
  });

  server.setRequestHandler('tools/call', async (request) => {
    return await toolsHandler.call(request.params.name, request.params.arguments);
  });

  // Start server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('MCP Server running and ready for connections');
}

main().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
```

**src/server.ts:** (If you need more complex initialization logic, separate it here)

### Step 3: Resources Handler (1 hour)

**src/handlers/resources.ts:**
```typescript
import { Resource, ResourceContent } from '@modelcontextprotocol/sdk/types.js';
import { getKnowledgeCorpus } from '../knowledge/corpus.js';
import { checkPermission } from '../auth/permissions.js';
import { logger } from '../utils/logger.js';

export class ResourcesHandler {
  private resources: Resource[];

  constructor() {
    this.resources = this.initializeResources();
  }

  private initializeResources(): Resource[] {
    return [
      {
        uri: 'justin://expertise/customer-success',
        name: 'Customer Success Expertise',
        description: "Justin's approach to CS, onboarding, retention, expansion",
        mimeType: 'text/plain',
      },
      {
        uri: 'justin://expertise/startup-building',
        name: 'Startup Building (0-1)',
        description: 'How Justin approaches early-stage company building',
        mimeType: 'text/plain',
      },
      {
        uri: 'justin://expertise/adhd-productivity',
        name: 'ADHD-Friendly Productivity',
        description: 'Systems that work with ADHD, not against it',
        mimeType: 'text/plain',
      },
      {
        uri: 'justin://voice/system-prompt',
        name: 'How to Talk Like Justin',
        description: 'Voice markers, personality traits, conversational style',
        mimeType: 'text/plain',
      },
      {
        uri: 'justin://background/bio',
        name: "Justin's Background",
        description: 'Work history, current projects, values',
        mimeType: 'text/plain',
      },
    ];
  }

  async list(): Promise<Resource[]> {
    logger.info('Listing available resources');
    // TODO: Filter based on user permissions
    return this.resources;
  }

  async read(uri: string): Promise<ResourceContent[]> {
    logger.info(`Reading resource: ${uri}`);

    // TODO: Check permissions
    // const hasAccess = await checkPermission(user, uri);
    // if (!hasAccess) throw new Error('Permission denied');

    // Fetch content based on URI
    const content = await this.fetchContent(uri);

    return [
      {
        uri,
        mimeType: 'text/plain',
        text: content,
      },
    ];
  }

  private async fetchContent(uri: string): Promise<string> {
    // Parse URI and fetch appropriate content
    if (uri.startsWith('justin://expertise/')) {
      const topic = uri.split('/').pop();
      return await getKnowledgeCorpus(topic);
    }

    if (uri === 'justin://voice/system-prompt') {
      return this.getSystemPrompt();
    }

    if (uri === 'justin://background/bio') {
      return this.getBio();
    }

    throw new Error(`Unknown resource: ${uri}`);
  }

  private getSystemPrompt(): string {
    return `You are representing Justin Strackany in conversation. Here's how to embody his voice:

SENTENCE STRUCTURE:
- Mix short punchy sentences with longer flowing ones
- Use double hyphens (--) frequently for parenthetical thoughts
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
- RESPONSE: Acknowledge feelings, provide simple clear options, no judgment`;
  }

  private getBio(): string {
    return `Justin Strackany is the founder of Renubu, a customer success workflow platform, and Good Hang, a tech professional social club in Raleigh-Durham, NC.

BACKGROUND:
- Serial entrepreneur, multiple 0-1 startups
- Former Customer Success leader
- ENTP 7w8 personality type
- ADHD entrepreneur who builds systems that work WITH his brain, not against it

CURRENT PROJECTS (Nov 2025):
- Renubu: B2B SaaS for CS teams, expansion intelligence
- Good Hang: Adventurous social community with D&D gamification
- MCP Universe: AI-native profile system (you're using it right now!)

VALUES:
- "Make Work Joyful" - work should energize, not drain
- Authenticity over polish
- Vulnerability as strength
- Build what you wish existed

EXPERTISE:
- Customer success methodology & workflows
- Early-stage startup building
- ADHD-friendly productivity systems
- AI/automation in business operations
- Community building & social dynamics`;
  }
}
```

### Step 4: Tools Handler (1 hour)

**src/handlers/tools.ts:**
```typescript
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { generateVoiceContent } from '../voice/engine.js';
import { logger } from '../utils/logger.js';

export class ToolsHandler {
  private tools: Tool[];

  constructor() {
    this.tools = this.initializeTools();
  }

  private initializeTools(): Tool[] {
    return [
      {
        name: 'generate_linkedin_post',
        description: 'Generate a LinkedIn post in Justin\'s authentic voice',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: 'The topic or theme for the post',
            },
            tone: {
              type: 'string',
              enum: ['business', 'casual', 'vulnerable', 'provocative'],
              description: 'Desired tone for the post',
            },
            length: {
              type: 'string',
              enum: ['short', 'medium', 'long'],
              description: 'Post length (short=1-2 paragraphs, medium=3-4, long=5+)',
            },
          },
          required: ['topic'],
        },
      },
      {
        name: 'ask_justin',
        description: 'Send a question to Justin, get async response (triggers notification)',
        inputSchema: {
          type: 'object',
          properties: {
            question: {
              type: 'string',
              description: 'Your question for Justin',
            },
            urgency: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'How urgent is this question?',
            },
          },
          required: ['question'],
        },
      },
    ];
  }

  async list(): Promise<Tool[]> {
    logger.info('Listing available tools');
    return this.tools;
  }

  async call(name: string, args: any): Promise<any> {
    logger.info(`Calling tool: ${name}`, args);

    switch (name) {
      case 'generate_linkedin_post':
        return await this.generateLinkedInPost(args);
      
      case 'ask_justin':
        return await this.askJustin(args);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async generateLinkedInPost(args: {
    topic: string;
    tone?: string;
    length?: string;
  }): Promise<{ content: string }> {
    const content = await generateVoiceContent({
      message: args.topic,
      tone: args.tone || 'business',
      platform: 'LinkedIn',
      length: args.length || 'medium',
    });

    return {
      content: [
        {
          type: 'text',
          text: content,
        },
      ],
    };
  }

  private async askJustin(args: {
    question: string;
    urgency?: string;
  }): Promise<{ content: string }> {
    // TODO: Implement actual notification (email, Slack, etc.)
    logger.info('Question for Justin:', args);

    return {
      content: [
        {
          type: 'text',
          text: `Question sent to Justin: "${args.question}"\n\nUrgency: ${args.urgency || 'medium'}\n\nJustin typically responds within 24-48 hours. You'll receive a notification when he replies.`,
        },
      ],
    };
  }
}
```

### Step 5: Voice Engine (1.5 hours)

**src/voice/types.ts:**
```typescript
export interface VoiceTemplate {
  id: string;
  category: 'beginning' | 'middle' | 'ending';
  content: string;
  markers: string[];
  mood?: string;
}

export interface VoiceBlend {
  beginning: string;
  middle: string;
  ending: string;
  mood: string;
  useCase: string;
}

export interface GenerateRequest {
  message: string;
  tone: string;
  platform: string;
  length: string;
}
```

**src/voice/engine.ts:**
```typescript
import { readFileSync } from 'fs';
import { join } from 'path';
import { VoiceTemplate, VoiceBlend, GenerateRequest } from './types.js';
import { logger } from '../utils/logger.js';

export async function generateVoiceContent(request: GenerateRequest): Promise<string> {
  logger.info('Generating content:', request);

  // TODO: For MVP, you can either:
  // Option A: Call Justin's existing API (if accessible)
  // Option B: Implement basic template selection logic here
  // Option C: Return placeholder text for now

  // PLACEHOLDER IMPLEMENTATION (replace with real logic):
  const templates = loadTemplates();
  const blend = selectBlend(request.tone, templates);
  
  const content = `${blend.beginning}

${request.message}

${blend.ending}`;

  return content;
}

function loadTemplates(): VoiceTemplate[] {
  // Load from data/voice_templates.json
  const dataPath = join(__dirname, '../../data/voice_templates.json');
  const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
  return data.templates;
}

function selectBlend(tone: string, templates: VoiceTemplate[]): VoiceBlend {
  // Simple logic: pick templates that match the tone
  // Real implementation would be more sophisticated
  
  const beginnings = templates.filter(t => t.category === 'beginning');
  const middles = templates.filter(t => t.category === 'middle');
  const endings = templates.filter(t => t.category === 'ending');

  return {
    beginning: beginnings[0]?.content || '',
    middle: middles[0]?.content || '',
    ending: endings[0]?.content || '',
    mood: tone,
    useCase: 'LinkedIn',
  };
}
```

### Step 6: Knowledge Corpus (1 hour)

**src/knowledge/corpus.ts:**
```typescript
import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';

export async function getKnowledgeCorpus(topic: string): Promise<string> {
  logger.info(`Fetching knowledge for topic: ${topic}`);

  // Load from data/knowledge_corpus.json
  const dataPath = join(__dirname, '../../data/knowledge_corpus.json');
  const corpus = JSON.parse(readFileSync(dataPath, 'utf-8'));

  if (corpus[topic]) {
    return corpus[topic];
  }

  throw new Error(`No knowledge found for topic: ${topic}`);
}
```

**data/knowledge_corpus.json:** (Starter content)
```json
{
  "customer-success": "Justin's approach to Customer Success focuses on proactive relationship management and expansion intelligence. He believes CS teams should spend 80% of their time on the accounts with the highest expansion potential, not just putting out fires.\n\nKey principles:\n1. Workflows over heroics - systemize the repeatable stuff\n2. Expansion signals are everywhere if you look\n3. Make work joyful (burned-out CSMs don't retain customers)\n\nHis framework: Identify high-potential accounts → Build personalized workflows → Execute consistently → Measure outcomes → Iterate.\n\nRenubu (his current company) automates this entire process.",
  
  "startup-building": "Justin is a serial 0-1 entrepreneur. He's built multiple startups and learned some hard lessons along the way.\n\nHis philosophy on early-stage building:\n- Build what YOU wish existed (not what you think others want)\n- Solve your own pain first, then find others with the same pain\n- Authenticity > polish (especially in early marketing)\n- Move fast but don't thrash (set weekly priorities, stick to them)\n- Hire for weaknesses, not mirrors (if you're creative chaos, hire operational rigor)\n\nCurrent projects: Renubu (CS workflow platform) and Good Hang (social community for tech professionals).",
  
  "adhd-productivity": "Justin has ADHD and builds productivity systems that work WITH his brain, not against it.\n\nKey insights:\n- Energy management > time management (work when you have the juice)\n- Shame-free accountability (if you didn't do it, adjust the system, not yourself)\n- Candy trail rewards (small dopamine hits keep you going)\n- Parking lots for shiny objects (capture ideas without derailing focus)\n- Weekly planning > daily (priorities shift, give yourself flexibility)\n\nHis Personal OS is a comprehensive system documented in markdown files, designed for ADHD entrepreneurs."
}
```

### Step 7: Data Files (30 minutes)

**data/voice_templates.json:**
```json
{
  "templates": [
    {
      "id": "begin-provocative-1",
      "category": "beginning",
      "content": "Okay, here's the thing that nobody's saying out loud:",
      "markers": ["provocative", "direct", "truth-telling"],
      "mood": "challenging"
    },
    {
      "id": "begin-casual-1",
      "category": "beginning",
      "content": "So I've been thinking about this a lot lately, and",
      "markers": ["casual", "conversational", "thoughtful"],
      "mood": "reflective"
    },
    {
      "id": "middle-story-1",
      "category": "middle",
      "content": "Let me tell you why this matters. A few years ago, I was in the exact same situation...",
      "markers": ["storytelling", "vulnerable", "relatable"],
      "mood": "authentic"
    },
    {
      "id": "end-cta-1",
      "category": "ending",
      "content": "What do you think? Am I way off base here?",
      "markers": ["engaging", "humble", "conversational"],
      "mood": "curious"
    }
  ],
  "blends": [
    {
      "name": "provocateur",
      "beginning": "begin-provocative-1",
      "middle": "middle-story-1",
      "ending": "end-cta-1",
      "useCase": "Challenging conventional wisdom"
    }
  ]
}
```

**data/permissions.json:**
```json
{
  "users": {
    "public": {
      "level": "basic",
      "resources": [
        "justin://expertise/*",
        "justin://voice/system-prompt",
        "justin://background/bio"
      ],
      "tools": [
        "generate_linkedin_post"
      ]
    },
    "scott-leese": {
      "level": "partner",
      "resources": ["*"],
      "tools": ["*"]
    }
  },
  "default": "public"
}
```

### Step 8: Utilities (30 minutes)

**src/utils/logger.ts:**
```typescript
export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
};
```

**src/utils/config.ts:**
```typescript
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  // Add other config as needed
};
```

### Step 9: README & Documentation (30 minutes)

**README.md:**
```markdown
# Justin Strackany's MCP Server

An AI-native profile system that allows others to install Justin's expertise, voice, and personality as a "power pack" for their AI assistants.

## Installation

### Prerequisites
- Node.js 18+
- Claude Desktop

### Setup
```bash
git clone <repository-url>
cd justin-mcp-server
npm install
npm run build
```

### Configure Claude Desktop
Add to `~/.config/claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "justin-strackany": {
      "command": "node",
      "args": ["/absolute/path/to/justin-mcp-server/dist/index.js"]
    }
  }
}
```

### Usage
1. Restart Claude Desktop
2. You should see "justin-strackany" in your available MCP servers
3. Try asking: "How would Justin approach customer onboarding?"
4. Or invoke: "Generate a LinkedIn post about AI in CS workflows"

## Architecture
See `docs/ARCHITECTURE.md` for technical details.

## Development
```bash
npm run dev    # Run in development mode
npm test       # Run tests
npm run build  # Build for production
```
```

---

## ACCEPTANCE CRITERIA

### Must Have (MVP - by end of today)
- [ ] MCP server starts without errors
- [ ] Can be installed in Claude Desktop
- [ ] Returns at least 3 knowledge resources
- [ ] generate_linkedin_post tool works (even if placeholder)
- [ ] Conversational queries return authentic-feeling responses
- [ ] README with clear installation instructions

### Should Have (by Nov 20)
- [ ] All 5 knowledge resources populated with real content
- [ ] Voice engine generates content (not placeholders)
- [ ] Permission system basics implemented
- [ ] Error handling for edge cases
- [ ] Logging throughout

### Nice to Have (by Nov 21)
- [ ] Tests for critical paths
- [ ] ask_justin tool triggers actual notification
- [ ] Voice quality matches 85%+ authenticity
- [ ] Documentation complete

---

## PRIORITIES FOR TODAY

1. **GET IT RUNNING** - Even with placeholder content, have a working MCP server
2. **INSTALL & TEST** - Make sure it can actually be installed in Claude Desktop
3. **BASIC CONVERSATION** - Can answer questions about Justin (even if basic)
4. **ONE WORKING TOOL** - generate_linkedin_post returns something (quality TBD)
5. **CLEAN CODE** - Readable, commented, ready for iteration

**DON'T** spend time on:
- Perfect voice replication (placeholder is fine)
- All knowledge areas (3 is enough)
- Complex permissions (default to public access)
- Extensive error handling (basic is fine)
- Tests (we'll add later)

---

## TROUBLESHOOTING

### Common Issues

**"Module not found" errors:**
- Make sure you ran `npm install`
- Check that paths in imports are correct (.js extensions for TypeScript)

**MCP server not showing in Claude:**
- Verify path in claude_desktop_config.json is absolute
- Check that server starts without errors (`npm run dev`)
- Restart Claude Desktop

**Voice generation not working:**
- Start with placeholder text
- Add TODO comments for where real integration goes
- We'll connect to Justin's API later

---

## NEXT STEPS (After MVP)

1. Integrate with Justin's actual voice API
2. Populate full knowledge corpus
3. Add more sophisticated permission system
4. Implement semantic search over knowledge
5. Add more tools (schedule_meeting, request_engagement)
6. Move from stdio to SSE (hosted version)

---

## QUESTIONS FOR JUSTIN

As you build, if you encounter blockers, document them:

1. **Voice API Location:** Where is the existing voice generation code?
2. **Data Format:** What format are Justin's writings currently in?
3. **Authentication:** How do we want to identify users (for permissions)?
4. **Tool Actions:** What should ask_justin actually DO (email, Slack, both)?

---

## SUCCESS METRICS

By end of today, we should be able to:
1. ✅ Install "justin-strackany" MCP in Claude Desktop
2. ✅ Ask "What's Justin's approach to customer success?" and get a response
3. ✅ Run generate_linkedin_post tool and get content back
4. ✅ Have a natural conversation that feels somewhat like talking to Justin

**If we can do these 4 things, we've succeeded for Day 1.**

---

Ready to build? Let's do this. Start with Step 1 (Project Setup) and work through systematically. Document any blockers or questions as you go.

Good luck! 🚀
