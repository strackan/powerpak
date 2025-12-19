# PowerPak - MCP Expert Knowledge System

MCP-based expert knowledge marketplace exposing expert profiles as dynamic tools for Claude integration.

## Key Features
- Expert profiles (Justin Strackany, Scott Leese) as MCP resources
- Knowledge graph backend with Neo4j
- Semantic search via OpenAI embeddings
- Hiring, messaging, and meeting booking workflows

## Technology Stack
- TypeScript monorepo with Turbo
- MCP SDK 1.0.4
- Neo4j 5.13 (knowledge graph)
- OpenAI (embeddings)
- Docker for infrastructure

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start Neo4j
docker-compose up -d neo4j

# 3. Build all packages
npm run build

# 4. Run PowerPak server
cd packages/powerpak-server
node dist/index.js justin-strackany platinum
```

See `QUICK-START.md` for detailed 5-minute setup.

## Monorepo Structure (11 Packages)

```
packages/
  powerpak-server/           - Main MCP server (expert profiles)
  knowledge-graph/           - Neo4j graph loader
  shared-types/              - TypeScript shared types
  skill-updater/             - Keeps skills in sync
  electron-app/              - Desktop application
  better-chatbot/            - Electron foundation fork
  justin-voice-server/       - Voice integration MCP
  founder-os-server/         - Founder OS MCP
  universal-messenger-server/ - Messaging MCP
  mcp-network-sandbox/       - Testing sandbox

skills/                      - Expert profiles by tier
  platinum/                  - Premium tier (Justin, Scott)
  premium/                   - Mid-tier
  regular/                   - Basic tier
  spotlight/                 - Featured profiles
```

## Common Commands

```bash
# Root level (via workspaces)
npm install          # Install all dependencies
npm run build        # Build all packages (turbo)
npm run dev          # Watch mode
npm run test         # Run tests
npm run lint         # Lint all packages
npm run typecheck    # TypeScript checking

# Docker
docker-compose up -d neo4j    # Start Neo4j
docker-compose down           # Stop services
```

## SKILL.md Format

Expert profiles use YAML frontmatter + Markdown:

```markdown
---
id: expert-id
name: Expert Name
tier: platinum
expertise: [area1, area2]
---

# Profile Section
Bio and background...

## Content Sections
Methodologies, frameworks, etc.
```

## MCP Concepts

### Resources (Static Content)
- Expert profile info
- Frameworks and methodologies
- Skill content

### Tools (Callable Functions)
- `query_skill` - Search expert knowledge
- `get_framework` - Get specific framework
- `search_content` - Semantic search
- `hire` - Initiate hiring workflow
- `message` - Send message to expert
- `book_meeting` - Schedule meeting

## Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
SLACK_TOKEN=xoxb-...
GITHUB_TOKEN=ghp_...
```

## Adding New Expert Profiles

1. Create directory: `skills/<tier>/<expert-id>/`
2. Create `SKILL.md` with YAML frontmatter
3. Run skill updater: `npm run build -w packages/skill-updater`
4. Load into knowledge graph: `npm run load -w packages/knowledge-graph`

## Key Packages

### powerpak-server
Main MCP server exposing expert profiles.
```bash
node dist/index.js <expert-id> <tier> [--with-backend]
```

### knowledge-graph
Loads expert data into Neo4j.
```bash
cd packages/knowledge-graph
npm run load
```

## Presentation Deck (mockups/presentation/)

The PowerPak pitch deck is a 27-scene HTML presentation with a modular architecture.

### Structure
```
mockups/presentation/
  index.html              - Main presentation (all slides)
  index-modular.html      - Modular loader version
  scene-manager.js        - CLI tool for slide management
  slides/                 - Individual slide files (01-title.html, etc.)
  assets/
    scenes.css            - All slide styles
    scenes.js             - Navigation and animations
    presentation.css/js   - Base presentation styles
```

### SOP: Managing Slides

**ALWAYS use the scene-manager.js tool for slide operations:**

```bash
cd mockups/presentation

# View current slides
node scene-manager.js list          # Brief list
node scene-manager.js view          # Detailed view with headlines

# Add a new slide
node scene-manager.js add <position> "<title>"

# Delete a slide
node scene-manager.js delete <position>

# Reorder slides
node scene-manager.js move <from> <to>
node scene-manager.js swap <pos1> <pos2>

# Fix numbering after manual edits
node scene-manager.js renumber
```

**When adding new slides manually:**
1. Create slide file: `slides/XX-name.html` with `<section class="scene" data-scene="XX">`
2. Add CSS for new scene class in `assets/scenes.css`
3. Add animation function in `assets/scenes.js` (triggerSceneAnimations switch)
4. Run `node scene-manager.js renumber` to sync index.html and navigation

**Files that need updating for new slides:**
- `slides/XX-name.html` - The slide content
- `index.html` - Scene section, navigation dots
- `assets/scenes.css` - Styles for `.your-scene-class`
- `assets/scenes.js` - Animation in triggerSceneAnimations(), totalScenes count

### Keyboard Shortcuts (in presentation)
- Arrow keys / Space: Navigate
- 1-9: Jump to scenes 1-9
- Shift+0-9: Scenes 10-19
- Ctrl+1-8: Scenes 20-27

## Documentation
- `QUICK-START.md` - 5-minute setup
- `README.md` - Project overview
- Individual package READMEs in `packages/*/`
