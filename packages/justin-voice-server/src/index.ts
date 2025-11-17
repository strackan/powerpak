#!/usr/bin/env node

/**
 * Justin's Voice MCP Server
 *
 * Exposes Justin's writing voice, templates, and personality system through MCP.
 *
 * Resources:
 * - justin://templates/beginnings - List all beginning templates
 * - justin://templates/middles - List all middle templates
 * - justin://templates/endings - List all ending templates
 * - justin://templates/flavors - List all flavor elements
 * - justin://templates/transitions - List all transitions
 * - justin://blends - List all blend recipes
 * - justin://blends/{name} - Get specific blend recipe
 * - justin://rules - Get writing rules and guidelines
 *
 * Tools:
 * - generate_content - Generate content using Justin's voice
 * - analyze_voice - Analyze text for Justin-voice similarity
 * - suggest_improvements - Get suggestions to make text more Justin-like
 * - get_blend_recommendation - Get template blend based on context and mood
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { VoiceEngine } from './engine/voice-engine.js';
import { z } from 'zod';

// Initialize the voice engine
const voiceEngine = new VoiceEngine();

// Create MCP server
const server = new Server(
  {
    name: 'justin-voice-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

/**
 * List available resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'justin://templates/beginnings',
        name: 'Beginning Templates',
        description: 'All opening templates (O1-O6) for starting content',
        mimeType: 'application/json',
      },
      {
        uri: 'justin://templates/middles',
        name: 'Middle Templates',
        description: 'All middle templates (M1-M7) for developing content',
        mimeType: 'application/json',
      },
      {
        uri: 'justin://templates/endings',
        name: 'Ending Templates',
        description: 'All ending templates (E1-E6) for closing content',
        mimeType: 'application/json',
      },
      {
        uri: 'justin://templates/flavors',
        name: 'Flavor Elements',
        description: 'Flavor elements (F1-F10) to sprinkle throughout',
        mimeType: 'application/json',
      },
      {
        uri: 'justin://templates/transitions',
        name: 'Transitions',
        description: 'Transition phrases (T1-T4) to connect sections',
        mimeType: 'application/json',
      },
      {
        uri: 'justin://blends',
        name: 'Blend Recipes',
        description: 'Proven template combinations that work',
        mimeType: 'application/json',
      },
      {
        uri: 'justin://rules',
        name: 'Writing Rules',
        description: "Justin's writing rules and guidelines",
        mimeType: 'application/json',
      },
    ],
  };
});

/**
 * Read resource content
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === 'justin://templates/beginnings') {
    const templates = voiceEngine.getTemplatesByCategory('beginning');
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(templates, null, 2),
        },
      ],
    };
  }

  if (uri === 'justin://templates/middles') {
    const templates = voiceEngine.getTemplatesByCategory('middle');
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(templates, null, 2),
        },
      ],
    };
  }

  if (uri === 'justin://templates/endings') {
    const templates = voiceEngine.getTemplatesByCategory('ending');
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(templates, null, 2),
        },
      ],
    };
  }

  if (uri === 'justin://templates/flavors') {
    const templates = voiceEngine.getTemplatesByCategory('flavor');
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(templates, null, 2),
        },
      ],
    };
  }

  if (uri === 'justin://templates/transitions') {
    const templates = voiceEngine.getTemplatesByCategory('transition');
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(templates, null, 2),
        },
      ],
    };
  }

  if (uri === 'justin://blends') {
    const blends = voiceEngine.getAllBlends();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(blends, null, 2),
        },
      ],
    };
  }

  if (uri.startsWith('justin://blends/')) {
    const blendName = uri.replace('justin://blends/', '');
    const blend = voiceEngine.getBlendByName(blendName);

    if (!blend) {
      throw new Error(`Blend not found: ${blendName}`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(blend, null, 2),
        },
      ],
    };
  }

  if (uri === 'justin://rules') {
    const rules = voiceEngine.getWritingRules();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(rules, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'generate_content',
        description:
          "Generate content using Justin's voice. Provide either specific template IDs or a blend name.",
        inputSchema: {
          type: 'object',
          properties: {
            templateIds: {
              type: 'object',
              properties: {
                beginning: {
                  type: 'string',
                  description: 'Beginning template ID (e.g., "o1", "o2")',
                },
                middle: {
                  type: 'string',
                  description: 'Middle template ID (e.g., "m1", "m2")',
                },
                ending: {
                  type: 'string',
                  description: 'Ending template ID (e.g., "e1", "e2")',
                },
              },
            },
            blendName: {
              type: 'string',
              description:
                'Name of blend recipe to use (e.g., "THE AUTHENTIC FOUNDER", "THE PROVOCATEUR")',
            },
            topic: {
              type: 'string',
              description: 'Topic or subject matter for the content',
            },
            context: {
              type: 'string',
              description: 'Context for the content (e.g., "product launch", "personal story")',
            },
          },
        },
      },
      {
        name: 'analyze_voice',
        description:
          "Analyze text for Justin-voice similarity. Returns score (0-100) and detailed feedback.",
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Text to analyze',
            },
          },
          required: ['text'],
        },
      },
      {
        name: 'suggest_improvements',
        description: 'Get specific suggestions to make text more Justin-like.',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Text to improve',
            },
          },
          required: ['text'],
        },
      },
      {
        name: 'get_blend_recommendation',
        description: 'Get recommended template blend based on context and mood.',
        inputSchema: {
          type: 'object',
          properties: {
            context: {
              type: 'string',
              description:
                'Content context (e.g., "product launch", "hot take", "personal story")',
            },
            mood: {
              type: 'string',
              description: 'Desired mood/energy (e.g., "vulnerable", "punchy", "reflective")',
            },
          },
          required: ['context'],
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'generate_content') {
      const result = voiceEngine.generateContent(args as any);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (name === 'analyze_voice') {
      const schema = z.object({
        text: z.string(),
      });

      const { text } = schema.parse(args);
      const result = voiceEngine.analyzeVoice(text);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (name === 'suggest_improvements') {
      const schema = z.object({
        text: z.string(),
      });

      const { text } = schema.parse(args);
      const result = voiceEngine.suggestImprovements(text);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (name === 'get_blend_recommendation') {
      const schema = z.object({
        context: z.string(),
        mood: z.string().optional(),
      });

      const { context, mood } = schema.parse(args);
      const result = voiceEngine.suggestBlend(context, mood);

      if (!result) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: 'No matching blend found' }),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
          }),
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Justin Voice MCP Server running on stdio');
  console.error('Templates loaded:', voiceEngine.getAllTemplates().length);
  console.error('Blends loaded:', voiceEngine.getAllBlends().length);
  console.error('Writing rules loaded:', voiceEngine.getWritingRules().length);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
