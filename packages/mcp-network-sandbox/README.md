# MCP Network Sandbox

An interactive MCP server exposing a pre-seeded network of 10 expert profiles. Demonstrates network effects, discovery, recommendation features, and the future vision of MCP Universe.

## Overview

The MCP Network Sandbox is a fully functional Model Context Protocol server that simulates a marketplace of expert profiles. It's designed for demonstration purposes to showcase:

- **Network Effects**: Installation correlations ("People who installed X also installed Y")
- **Discovery**: Browse, search, and filter expert profiles
- **Tiers**: Basic (FREE), Enhanced ($49/mo), Premium ($25K)
- **Voice Profiles**: 4 experts with active voice systems
- **Recommendations**: Smart suggestions based on user behavior

## Quick Start

```bash
# 1. Build
npm run build

# 2. Test locally
npm test

# 3. Configure Claude Desktop
# Add to %APPDATA%\Claude\claude_desktop_config.json:
{
  "mcpServers": {
    "mcp-network": {
      "command": "node",
      "args": ["C:\\Users\\strac\\dev\\MCP-World\\packages\\mcp-network-sandbox\\dist\\index.js"]
    }
  }
}

# 4. Restart Claude Desktop and try:
"Browse sales experts"
"Who else do people install when they install Justin Strackany?"
"Show me all Premium tier experts"
```

## The 10-Person Network

1. **Justin Strackany** (Enhanced) - Sales + CS | Voice active
2. **Scott Leese** (Premium) - Sales Leadership | 3,891 installations
3. **Sarah Chen** (Basic) - Engineering | React + TypeScript
4. **Marcus "The Closer" Johnson** (Enhanced) - Enterprise Sales
5. **Dr. Priya Patel** (Premium) - Product Strategy | Former Google PM
6. **Alex Rivera** (Basic) - Customer Success | SaaS specialist
7. **David Kim** (Enhanced) - DevOps | Kubernetes + AWS
8. **Lisa Martinez** (Premium) - B2B Marketing | Content strategy
9. **Jordan Taylor** (Basic) - Startup Founder | Bootstrapping expert
10. **Keisha Williams** (Enhanced) - Sales Enablement | Training

## MCP Tools (5)

### 1. `browse_experts`
Filter and browse expert profiles.

**Parameters:**
- `category` (optional): sales, engineering, product, marketing, customer-success, etc.
- `tier` (optional): basic, enhanced, premium
- `keyword` (optional): Search term
- `limit` (optional): Max results (default: 10)

**Example:**
```
browse_experts({ category: "sales", tier: "enhanced" })
```

### 2. `view_profile`
Get complete details for a specific expert.

**Parameters:**
- `expertId` (required): Expert ID (e.g., "justin-strackany")

**Example:**
```
view_profile({ expertId: "scott-leese" })
```

### 3. `get_recommendations`
Get recommendations based on installation correlations.

**Parameters:**
- `expertId` (required): Expert to get recommendations for
- `limit` (optional): Max recommendations (default: 5)

**Example:**
```
get_recommendations({ expertId: "justin-strackany", limit: 5 })
```

**Returns:**
- Related experts with correlation percentages
- Reasons for the correlation
- Full profile details

### 4. `search_experts`
Semantic search across all profiles.

**Parameters:**
- `query` (required): Search query
- `limit` (optional): Max results (default: 10)

**Example:**
```
search_experts({ query: "enterprise sales" })
```

### 5. `get_network_stats`
Get platform-level statistics and insights.

**No parameters required**

**Returns:**
- Total experts, installations, ratings
- Tier breakdown
- Trending experts
- Popular combinations
- Network insights

## MCP Resources (4)

### 1. `network://profiles`
JSON list of all 10 expert profiles with complete data.

### 2. `network://connections`
Connection graph showing installation correlations and network insights.

### 3. `network://stats`
Platform statistics including tier breakdown, trending experts, and usage data.

### 4. `network://profile/{id}`
Full profile details for a specific expert (formatted text).

## Demo Scenarios

### Scenario 1: Discovery & Filtering
```
You: "Claude, browse experts in the Sales category"
Claude: Shows Justin, Scott, Marcus, Keisha...

You: "Show me only Premium tier"
Claude: Shows Scott, Priya, Lisa

You: "Tell me about Scott Leese"
Claude: Full profile with 12 tools, testimonials, stats
```

### Scenario 2: Network Effects
```
You: "Who else do people install when they install Justin?"
Claude: Scott (85%), Keisha (72%), Marcus (68%)...

You: "Why do people install Scott with Justin?"
Claude: "Both focus on revenue team building"
```

### Scenario 3: Search & Discovery
```
You: "Find experts who can help with product-market fit"
Claude: Shows Priya Patel, Jordan Taylor...

You: "Search for Kubernetes experts"
Claude: Shows David Kim...
```

### Scenario 4: Platform Insights
```
You: "What are the platform statistics?"
Claude: 10 experts, 12,420 installations, 4.82 avg rating...
       Trending: Scott (+28%), Priya (+22%)...
       Popular combo: Scott + Keisha (721 users)
```

## Network Data

### Installation Correlations
Realistic percentages based on complementary expertise:
- Justin + Scott: 85% (revenue ops + sales leadership)
- Scott + Keisha: 81% (leadership + enablement)
- Priya + Lisa: 73% (product + marketing)

### Community Clusters
- **Revenue Engine Builders**: Justin, Scott, Marcus, Keisha, Lisa
- **Product & Growth**: Priya, Lisa, Jordan
- **Technical Builders**: Sarah, David, Jordan
- **Customer-Centric**: Justin, Alex, Keisha

### Tier Distribution
- Basic (40%): 1,266 installations, avg 3.25 tools
- Enhanced (30%): 2,599 installations, avg 7.33 tools
- Premium (30%): 8,555 installations, avg 12.67 tools

## Technical Details

### Data Files
- `src/data/profiles.json` - 10 expert profiles (29KB)
- `src/data/connections.json` - Correlation matrix (6.5KB)
- `src/data/network-stats.json` - Platform stats (3.2KB)

### Architecture
- **Transport**: stdio (for Claude Desktop)
- **Validation**: Zod schemas
- **Data Loading**: Synchronous JSON file reads
- **Error Handling**: Graceful degradation

### Dependencies
- `@modelcontextprotocol/sdk` v1.0.4
- `zod` v3.22.0
- `@mcp-world/shared-types`

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Clean
npm run clean

# Type check
npm run typecheck
```

## Use Cases for Demo

1. **Show Network Effects** - Demonstrate installation correlations
2. **Tier Differentiation** - Compare Basic vs Enhanced vs Premium
3. **Voice Profiles** - Show which experts have voice systems active
4. **Discovery** - Search and filter to find the right expert
5. **Platform Vision** - Use stats to show scale potential

## Future Enhancements

- **Live Profiles**: Connect to actual expert APIs
- **User Accounts**: Track individual installation history
- **Voice Integration**: Link to Justin's Voice MCP for active profiles
- **Recommendations Engine**: ML-based suggestions
- **Social Features**: Reviews, ratings, comments
- **Marketplace UI**: Web interface for browsing

## License

MIT

---

**Built for MCP-World Demo | December 4, 2024**
