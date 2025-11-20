#!/usr/bin/env node

/**
 * MCP Skill Discovery Service
 *
 * An interactive MCP server for discovering and recommending Claude Skills.
 * Demonstrates skill tiering (PLATINUM/Premium/Regular/Spotlight), network effects,
 * and recommendation features for the MCP-World Skills marketplace.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load data
const skillsData = JSON.parse(readFileSync(join(__dirname, 'data/skills.json'), 'utf-8'));
const correlationsData = JSON.parse(readFileSync(join(__dirname, 'data/skill-correlations.json'), 'utf-8'));

// Types
interface ExpertProfile {
  id: string;
  name: string;
  title: string;
  tier: 'basic' | 'enhanced' | 'premium';
  category: string[];
  tagline: string;
  bio: string;
  stats: {
    installations: number;
    rating: number;
    toolCount: number;
    followers: number;
  };
  pricing?: {
    free?: boolean;
    monthly?: number;
    lifetime?: number;
    oneTime?: number;
    whiteGlove?: boolean;
  };
  tools: Array<{
    name: string;
    description: string;
    example: string;
  }>;
  voiceActive: boolean;
  voiceStyles?: string[];
  specialties: string[];
  testimonials?: Array<{
    author: string;
    text: string;
  }>;
  connections: string[];
}

// Parse data
const profiles = profilesData.experts as ExpertProfile[];
const connections = connectionsData;
const networkStats = networkStatsData;

// Validation schemas
const BrowseExpertsSchema = z.object({
  category: z.string().optional(),
  tier: z.enum(['basic', 'enhanced', 'premium']).optional(),
  keyword: z.string().optional(),
  limit: z.number().min(1).max(50).optional().default(10),
});

const ViewProfileSchema = z.object({
  expertId: z.string(),
});

const GetRecommendationsSchema = z.object({
  expertId: z.string(),
  limit: z.number().min(1).max(10).optional().default(5),
});

const SearchExpertsSchema = z.object({
  query: z.string(),
  limit: z.number().min(1).max(50).optional().default(10),
});

// Helper functions
function filterProfiles(
  category?: string,
  tier?: string,
  keyword?: string
): ExpertProfile[] {
  return profiles.filter((profile) => {
    if (category && !profile.category.includes(category.toLowerCase())) {
      return false;
    }
    if (tier && profile.tier !== tier) {
      return false;
    }
    if (keyword) {
      const searchText = `${profile.name} ${profile.title} ${profile.bio} ${profile.tagline} ${profile.specialties.join(' ')}`.toLowerCase();
      if (!searchText.includes(keyword.toLowerCase())) {
        return false;
      }
    }
    return true;
  });
}

function getProfileById(id: string): ExpertProfile | undefined {
  return profiles.find((p) => p.id === id);
}

function searchProfiles(query: string): ExpertProfile[] {
  const lowerQuery = query.toLowerCase();
  return profiles.filter((profile) => {
    const searchText = `
      ${profile.name}
      ${profile.title}
      ${profile.bio}
      ${profile.tagline}
      ${profile.specialties.join(' ')}
      ${profile.tools.map((t) => `${t.name} ${t.description}`).join(' ')}
    `.toLowerCase();
    return searchText.includes(lowerQuery);
  });
}

function getRecommendations(expertId: string, limit: number = 5) {
  const correlation = connections.correlations.find((c: any) => c.expertId === expertId);
  if (!correlation) {
    return [];
  }

  return correlation.alsoInstalled
    .slice(0, limit)
    .map((rec: any) => ({
      ...getProfileById(rec.id),
      correlation: {
        percentage: rec.percentage,
        reason: rec.reason,
      },
    }))
    .filter((r: any) => r.id); // Filter out any undefined profiles
}

function formatProfileSummary(profile: ExpertProfile): string {
  const tierBadge = profile.tier.toUpperCase();
  const voiceBadge = profile.voiceActive ? '🎤 Voice Active' : '';

  let pricing = '';
  if (profile.pricing?.free) {
    pricing = 'FREE';
  } else if (profile.pricing?.monthly) {
    pricing = `$${profile.pricing.monthly}/mo or $${profile.pricing.lifetime} lifetime`;
  } else if (profile.pricing?.oneTime) {
    pricing = `$${profile.pricing.oneTime.toLocaleString()} one-time${profile.pricing.whiteGlove ? ' + White-glove onboarding' : ''}`;
  }

  return `
**${profile.name}** [${tierBadge}] ${voiceBadge}
${profile.title}
"${profile.tagline}"

📊 Stats: ${profile.stats.installations.toLocaleString()} installations | ⭐ ${profile.stats.rating}/5.0 | 🔧 ${profile.stats.toolCount} tools

💰 Pricing: ${pricing}

Categories: ${profile.category.join(', ')}
`.trim();
}

function formatFullProfile(profile: ExpertProfile): string {
  const summary = formatProfileSummary(profile);

  const specialties = profile.specialties.map((s) => `  • ${s}`).join('\n');

  const tools = profile.tools
    .map((tool) => `
**${tool.name}**
${tool.description}
Example: "${tool.example}"
  `.trim())
    .join('\n\n');

  const testimonials = profile.testimonials
    ? profile.testimonials
        .map((t) => `
"${t.text}"
— ${t.author}
    `.trim())
        .join('\n\n')
    : 'No testimonials yet.';

  const voiceInfo = profile.voiceActive
    ? `
**Voice Profile Active** 🎤
Styles: ${profile.voiceStyles?.join(', ') || 'N/A'}
This expert's writing voice has been captured and is available for content generation.
    `.trim()
    : '';

  return `
${summary}

---

## Bio
${profile.bio}

## Specialties
${specialties}

## Tools (${profile.tools.length})
${tools}

${voiceInfo ? `\n${voiceInfo}\n` : ''}

## Testimonials
${testimonials}

## Network Connections
Connected to ${profile.connections.length} experts: ${profile.connections.map((id) => getProfileById(id)?.name).filter(Boolean).join(', ')}
  `.trim();
}

// Create MCP server
const server = new Server(
  {
    name: 'mcp-network-sandbox',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'browse_experts',
        description:
          'Browse and filter expert profiles by category, tier, or keyword. Returns a list of experts matching the criteria.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description:
                'Filter by category: sales, customer-success, engineering, product, marketing, leadership, devops, startup, founder, etc.',
            },
            tier: {
              type: 'string',
              enum: ['basic', 'enhanced', 'premium'],
              description: 'Filter by pricing tier',
            },
            keyword: {
              type: 'string',
              description: 'Search for keyword in name, title, bio, or specialties',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default: 10, max: 50)',
              default: 10,
            },
          },
        },
      },
      {
        name: 'view_profile',
        description:
          'Get complete details for a specific expert profile, including bio, tools, testimonials, and connections.',
        inputSchema: {
          type: 'object',
          properties: {
            expertId: {
              type: 'string',
              description: 'The unique ID of the expert (e.g., "justin-strackany")',
            },
          },
          required: ['expertId'],
        },
      },
      {
        name: 'get_recommendations',
        description:
          'Get expert recommendations based on installation correlations. Shows "People who installed X also installed Y" with percentages and reasons.',
        inputSchema: {
          type: 'object',
          properties: {
            expertId: {
              type: 'string',
              description: 'The expert ID to get recommendations for',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of recommendations (default: 5, max: 10)',
              default: 5,
            },
          },
          required: ['expertId'],
        },
      },
      {
        name: 'search_experts',
        description:
          'Semantic search across all expert profiles. Searches name, title, bio, specialties, and tools.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (e.g., "enterprise sales", "product strategy", "kubernetes")',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default: 10, max: 50)',
              default: 10,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_network_stats',
        description:
          'Get overall platform statistics including total experts, installations, trending experts, popular combinations, and network insights.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Register resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'network://profiles',
        name: 'All Expert Profiles',
        description: 'List of all available expert profiles in the network',
        mimeType: 'application/json',
      },
      {
        uri: 'network://connections',
        name: 'Network Connections',
        description: 'Connection graph showing installation correlations and network effects',
        mimeType: 'application/json',
      },
      {
        uri: 'network://stats',
        name: 'Network Statistics',
        description: 'Platform-level statistics and insights',
        mimeType: 'application/json',
      },
      {
        uri: 'network://profile/{id}',
        name: 'Specific Expert Profile',
        description: 'Get full details for a specific expert (replace {id} with expert ID)',
        mimeType: 'text/plain',
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'browse_experts': {
        const validated = BrowseExpertsSchema.parse(args);
        const results = filterProfiles(
          validated.category,
          validated.tier,
          validated.keyword
        );
        const limited = results.slice(0, validated.limit);

        const formatted = limited.map(formatProfileSummary).join('\n\n---\n\n');

        return {
          content: [
            {
              type: 'text',
              text: `Found ${results.length} experts${validated.limit && results.length > validated.limit ? ` (showing first ${validated.limit})` : ''}:\n\n${formatted}`,
            },
          ],
        };
      }

      case 'view_profile': {
        const validated = ViewProfileSchema.parse(args);
        const profile = getProfileById(validated.expertId);

        if (!profile) {
          return {
            content: [
              {
                type: 'text',
                text: `Expert with ID "${validated.expertId}" not found.`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: formatFullProfile(profile),
            },
          ],
        };
      }

      case 'get_recommendations': {
        const validated = GetRecommendationsSchema.parse(args);
        const profile = getProfileById(validated.expertId);

        if (!profile) {
          return {
            content: [
              {
                type: 'text',
                text: `Expert with ID "${validated.expertId}" not found.`,
              },
            ],
            isError: true,
          };
        }

        const recommendations = getRecommendations(validated.expertId, validated.limit);

        if (recommendations.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No recommendations available for ${profile.name}.`,
              },
            ],
          };
        }

        const formatted = recommendations
          .map((rec: any) => {
            const recProfile = rec as ExpertProfile & { correlation: { percentage: number; reason: string } };
            return `
**${recProfile.name}** (${recProfile.correlation.percentage}% correlation)
${recProfile.title}
"${recProfile.tagline}"

Why: ${recProfile.correlation.reason}

📊 ${recProfile.stats.installations.toLocaleString()} installations | ⭐ ${recProfile.stats.rating}/5.0 | 🔧 ${recProfile.stats.toolCount} tools
            `.trim();
          })
          .join('\n\n---\n\n');

        return {
          content: [
            {
              type: 'text',
              text: `People who installed **${profile.name}** also installed:\n\n${formatted}`,
            },
          ],
        };
      }

      case 'search_experts': {
        const validated = SearchExpertsSchema.parse(args);
        const results = searchProfiles(validated.query);
        const limited = results.slice(0, validated.limit);

        if (limited.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No experts found matching "${validated.query}".`,
              },
            ],
          };
        }

        const formatted = limited.map(formatProfileSummary).join('\n\n---\n\n');

        return {
          content: [
            {
              type: 'text',
              text: `Found ${results.length} experts matching "${validated.query}"${validated.limit && results.length > validated.limit ? ` (showing first ${validated.limit})` : ''}:\n\n${formatted}`,
            },
          ],
        };
      }

      case 'get_network_stats': {
        const stats = networkStats;

        const tierInfo = `
**Tier Breakdown:**
- Basic (FREE): ${stats.tierBreakdown.basic.count} experts, ${stats.tierBreakdown.basic.totalInstallations.toLocaleString()} installations
- Enhanced ($49/mo): ${stats.tierBreakdown.enhanced.count} experts, ${stats.tierBreakdown.enhanced.totalInstallations.toLocaleString()} installations
- Premium ($25K): ${stats.tierBreakdown.premium.count} experts, ${stats.tierBreakdown.premium.totalInstallations.toLocaleString()} installations
        `.trim();

        const trending = stats.trendingExperts
          .map((t: any) => `- **${t.name}**: ${t.growthRate} (${t.reason})`)
          .join('\n');

        const popular = stats.popularCombinations
          .map((combo: any) => {
            const names = combo.experts.map((id: string) => getProfileById(id)?.name).join(' + ');
            return `- ${names}: ${combo.installations.toLocaleString()} users (${combo.description})`;
          })
          .join('\n');

        const categoryInfo = Object.entries(stats.categoryBreakdown)
          .map(([cat, data]: [string, any]) => {
            return `- **${cat}**: ${data.expertCount} experts, ${data.installations.toLocaleString()} installations`;
          })
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `
# MCP Network Statistics

## Platform Overview
- **Total Experts**: ${stats.platform.totalExperts}
- **Total Installations**: ${stats.platform.totalInstallations.toLocaleString()}
- **Average Rating**: ${stats.platform.averageRating}/5.0 ⭐
- **Total Tools**: ${stats.platform.totalTools}
- **Active Voice Profiles**: ${stats.platform.activeVoiceProfiles} 🎤

${tierInfo}

## Category Breakdown
${categoryInfo}

## Trending Experts 📈
${trending}

## Popular Combinations
${popular}

## Network Insights
- Average experts per user: ${stats.insights.averageExpertsPerUser}
- Most common first install: ${getProfileById(stats.insights.mostCommonFirstInstall)?.name}
- Highest retention: ${getProfileById(stats.insights.highestRetention)?.name}
- Fastest growing: ${getProfileById(stats.insights.fastestGrowing)?.name}
- Most connected: ${getProfileById(stats.insights.mostConnected)?.name}

## Usage Statistics
- Total tool calls: ${stats.usageStats.totalToolCalls.toLocaleString()}
- Average calls per day: ${stats.usageStats.averageToolCallsPerDay.toLocaleString()}
- Most used tool: ${stats.usageStats.mostUsedTool}
- Peak usage: ${stats.usageStats.peakUsageTime}
              `.trim(),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Handle resource reads
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  try {
    if (uri === 'network://profiles') {
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(profiles, null, 2),
          },
        ],
      };
    }

    if (uri === 'network://connections') {
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(connections, null, 2),
          },
        ],
      };
    }

    if (uri === 'network://stats') {
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(networkStats, null, 2),
          },
        ],
      };
    }

    if (uri.startsWith('network://profile/')) {
      const id = uri.replace('network://profile/', '');
      const profile = getProfileById(id);

      if (!profile) {
        throw new Error(`Profile not found: ${id}`);
      }

      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: formatFullProfile(profile),
          },
        ],
      };
    }

    throw new Error(`Unknown resource: ${uri}`);
  } catch (error) {
    throw new Error(`Failed to read resource: ${error instanceof Error ? error.message : String(error)}`);
  }
});

// Start server
async function main() {
  console.error('MCP Network Sandbox Server starting...');
  console.error(`Loaded ${profiles.length} expert profiles`);
  console.error(`Network stats: ${networkStats.platform.totalInstallations.toLocaleString()} total installations`);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('MCP Network Sandbox Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
