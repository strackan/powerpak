# Justin's Voice MCP Server

A Model Context Protocol (MCP) server that exposes Justin's writing voice, templates, and personality system. This server allows LLMs like Claude to write in Justin's distinctive style using proven template blends and writing rules.

## Features

- **30 Writing Templates**: Beginning (O1-O6), Middle (M1-M7), Ending (E1-E6), plus Flavor elements and Transitions
- **9 Proven Blend Recipes**: Pre-configured combinations that work for different contexts
- **23 Writing Rules**: Formatting, voice, and vulnerability guidelines
- **Voice Analysis**: Score any text for "Justin-ness" (0-100)
- **Smart Suggestions**: Get specific improvements to match Justin's style
- **MCP Integration**: Works seamlessly with Claude Desktop and other MCP clients

## Installation

```bash
cd packages/justin-voice-server
npm install
npm run build
npm run extract-templates
```

## Usage

### Running the Server

```bash
npm start
```

The server runs on stdio and is designed to work with MCP clients like Claude Desktop.

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "justin-voice": {
      "command": "node",
      "args": [
        "C:\\Users\\strac\\dev\\MCP-World\\packages\\justin-voice-server\\dist\\index.js"
      ]
    }
  }
}
```

### Available Resources

Access Justin's writing system through these URIs:

- `justin://templates/beginnings` - All opening templates (O1-O6)
- `justin://templates/middles` - All middle templates (M1-M7)
- `justin://templates/endings` - All ending templates (E1-E6)
- `justin://templates/flavors` - Flavor elements (F1-F10)
- `justin://templates/transitions` - Transitions (T1-T4)
- `justin://blends` - All blend recipes
- `justin://blends/{name}` - Specific blend (e.g., "THE AUTHENTIC FOUNDER")
- `justin://rules` - Writing rules and guidelines

### Available Tools

#### 1. `generate_content`

Generate content using Justin's voice.

```typescript
{
  "blendName": "THE AUTHENTIC FOUNDER",
  "topic": "Launching our new CS platform",
  "context": "product launch"
}
```

Or specify individual templates:

```typescript
{
  "templateIds": {
    "beginning": "o1",  // Vulnerability
    "middle": "m1",     // Story Arc
    "ending": "e2"      // Invitation
  },
  "topic": "My journey building this"
}
```

**Returns:**
```json
{
  "content": "Generated text in Justin's voice...",
  "templatesUsed": {
    "beginning": "o1",
    "middle": "m1",
    "ending": "e2"
  },
  "voiceScore": 85
}
```

#### 2. `analyze_voice`

Analyze text for Justin-voice similarity.

```typescript
{
  "text": "Your text to analyze..."
}
```

**Returns:**
```json
{
  "overallScore": 75,
  "strengths": [
    "Uses parenthetical asides (3 found)",
    "Good mix of short punchy sentences",
    "Strategic profanity for rhythm"
  ],
  "improvements": [
    "Found 2 em dashes (AI tell)"
  ],
  "suggestions": [
    {
      "issue": "Using em dash (—) instead of double hyphen (--)",
      "suggestion": "Replace all em dashes with double hyphens",
      "example": "Use -- not —"
    }
  ]
}
```

#### 3. `suggest_improvements`

Get specific suggestions to make text more Justin-like.

```typescript
{
  "text": "Your text to improve..."
}
```

**Returns:**
```json
[
  {
    "issue": "Missing parenthetical asides",
    "suggestion": "Add conversational asides in parentheses",
    "example": "like this (you know what I mean?)"
  },
  {
    "issue": "Lack of short sentences",
    "suggestion": "Add short, punchy sentences for rhythm",
    "example": "Short sentences. Create. Impact."
  }
]
```

#### 4. `get_blend_recommendation`

Get recommended template blend based on context and mood.

```typescript
{
  "context": "hot take",
  "mood": "punchy"
}
```

**Returns:**
```json
{
  "name": "THE PROVOCATEUR",
  "components": {
    "opening": "o5",
    "middle": ["m2"],
    "ending": "e5"
  },
  "whenToUse": "Hot takes, challenging assumptions, stirring debate",
  "energyMatch": "Punchy, aggressive, contrarian",
  "whyItWorks": "Provocation stops scroll, philosophy backs it up, redirect offers alternative"
}
```

## Template System

### Beginning Templates

1. **O1: Vulnerability** - Personal moment of uncertainty/failure/fear
2. **O2: Absurdist Observation** - Mundane → cosmic/existential
3. **O3: Scene-Setting** - Present tense, vivid sensory details
4. **O4: Pattern Recognition** - "Three things happened this week..."
5. **O5: Provocative Question** - Challenge assumption immediately
6. **O6: Specific Detail** - Lead with the weird/interesting/surprising fact

### Middle Templates

1. **M1: Story Arc** - Setup → Conflict → Turn → Resolution
2. **M2: Philosophical Escalation** - Specific → pattern → universal truth
3. **M3: Technical Deep Dive** - Show the work, explain the mechanism
4. **M4: Analogy Game** - Parallel from totally different domain
5. **M5: List-That-Isn't-A-List** - Numbered items with commentary
6. **M6: Dialogue-Driven** - Actual conversation, minimal attribution
7. **M7: Evidence + Vulnerability** - Data PLUS what it felt like

### Ending Templates

1. **E1: Open Question** - Genuine curiosity, not rhetorical
2. **E2: Invitation** - Explicit call to connect/share/join
3. **E3: Callback** - Circle back to opening with new meaning
4. **E4: Unexpected Twist** - Subvert established expectations
5. **E5: Practical Application** - "Here's what to do about it"
6. **E6: Philosophical Button** - Micro→macro, specific→universal

## Blend Recipes

### Top 5 Proven Blends

1. **THE AUTHENTIC FOUNDER** (O1 + M1 + E2)
   - When: Product launches, founder updates, building trust
   - Performance: High comments (50-100), moderate shares (10-20)

2. **THE PATTERN SPOTTER** (O4 + M2 + E5)
   - When: Industry commentary, thought leadership
   - Performance: High shares (20-40), moderate comments (30-50)

3. **THE STORYTELLER** (O3 + M6 + E6)
   - When: Customer stories, real interactions
   - Performance: Moderate shares (15-25), high comments (60-90)

4. **THE PROVOCATEUR** (O5 + M2 + E5)
   - When: Hot takes, challenging assumptions
   - Performance: High shares (30-50), very high comments (100+)

5. **THE CONNECTOR** (O6 + M4 + E1)
   - When: Community building, relationship development
   - Performance: Very high comments (80-120), moderate shares (12-18)

## Writing Rules

### Always

- Parenthetical asides (like this)
- Self-deprecating humor with specific details
- Mix high/low vocabulary
- Strategic profanity for rhythm
- Double hyphen (--) NEVER em dash (—)
- Spacing = pacing (visual rhythm matters)

### Never

- Corporate jargon
- Thought leader voice
- Apologizing unnecessarily
- Hiding problems
- Em dash (—) - this is an AI tell

### Vulnerability Boundary

**YES:**
- Allude to mess: "my negative self-talk and daily morning panic attacks"
- Past tense reference to hard shit

**NO:**
- Present tense weakness: "I'm really terrified I'm not good enough"
- Admitting fear in the moment of writing

**The line:** Refer to the mess, don't be IN the mess while writing.

## Example Prompts for Claude

### Generate Content

```
Using the justin-voice server, generate a product launch post about our new AI features.
Use "THE AUTHENTIC FOUNDER" blend and make it vulnerable but hopeful.
```

### Analyze Your Writing

```
Analyze this text using justin-voice and tell me how to make it more Justin-like:

[paste your text]
```

### Get Template Recommendations

```
I need to write a hot take about customer success metrics.
What blend should I use from justin-voice?
```

### Browse Templates

```
Show me all the beginning templates from justin-voice so I can pick the right opener.
```

## Development

### Project Structure

```
justin-voice-server/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── engine/
│   │   ├── voice-engine.ts   # Core generation logic
│   │   └── rule-enforcer.ts  # Rule application & analysis
│   ├── templates/            # Generated JSON files
│   │   ├── templates.json    # All templates
│   │   ├── blends.json       # Blend recipes
│   │   └── rules.json        # Writing rules
│   └── scripts/
│       └── extract-templates.ts  # Parse markdown → JSON
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts

- `npm run build` - Compile TypeScript
- `npm run extract-templates` - Parse Justin OS docs → JSON
- `npm start` - Run the MCP server
- `npm run dev` - Watch mode for development

### Extracting Templates

The template extraction process:

1. Reads `justin_os/*.md` files
2. Parses template components (O1-O6, M1-M7, E1-E6, F1-F10, T1-T4)
3. Extracts blend recipes and writing rules
4. Outputs structured JSON files

Run after updating Justin OS docs:

```bash
npm run extract-templates
```

## Voice Score Breakdown

The `analyze_voice` tool scores text on multiple dimensions:

- **Parenthetical asides**: +10 if present
- **Double hyphen usage**: +5 if correct, -5 for em dashes
- **Strategic profanity**: +5 for 1-3 instances
- **Visual rhythm**: +5 for good paragraph spacing
- **Short sentences**: +10 for punchy rhythm (>30% short)
- **Vocabulary whiplash**: +10 for high/low mix
- **Self-deprecation**: +5 if present
- **Specific details**: +5 for numbers + quotes
- **Vulnerability boundary**: -15 for violations
- **Corporate jargon**: -10 per instance
- **Questions**: +5 for engagement

**Score ranges:**
- 80-100: Excellent Justin voice
- 60-79: Good, needs minor tweaks
- 40-59: Some Justin elements, needs work
- 0-39: Doesn't sound like Justin

## API Integration (Future)

The server is designed to integrate with `killer.tools/talk-like-justin` API. When available, add to `.env`:

```
KILLER_TOOLS_API_KEY=your_key
KILLER_TOOLS_API_URL=https://killer.tools/talk-like-justin
```

Currently, the server uses local template-based generation.

## Contributing

To add new templates or blends:

1. Edit `justin_os/*.md` files
2. Run `npm run extract-templates`
3. Rebuild: `npm run build`
4. Test the changes

## License

MIT

## Demo Deadline

**Target: December 4, 2024**

This server is a critical component for the demo. All core features are implemented and tested.
