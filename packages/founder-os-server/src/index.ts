#!/usr/bin/env node

/**
 * Founder OS MCP Server
 * Personal Chief of Staff - Task, Goal, and Context Management via Supabase
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Default Supabase credentials (can be overridden by env vars)
const DEFAULT_SUPABASE_URL = 'https://dokaliwfnptcwhywjltp.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRva2FsaXdmbnB0Y3doeXdqbHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjY3NjgsImV4cCI6MjA3OTQwMjc2OH0.MOrXt4Te6LYyoFbg_32qXmlTLsuWYkXTl8SbbVQpqMk';

// Load environment variables with defaults
const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;
const USER_ID = process.env.USER_ID;

// Initialize Supabase client
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.error('Founder OS MCP Server running on stdio');
console.error(`Supabase URL: ${SUPABASE_URL}`);
console.error(`User ID: ${USER_ID || 'Not set (will use auth.uid())'}`);

// Initialize MCP server
const server = new Server(
  {
    name: 'founder-os',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool schemas using Zod
const CreateTaskSchema = z.object({
  title: z.string().describe('Task title'),
  description: z.string().optional().describe('Detailed description'),
  status: z.enum(['todo', 'in_progress', 'blocked', 'done', 'archived']).default('todo'),
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  context_tags: z.array(z.string()).optional().describe('Context tags like ["Work", "Renubu"]'),
  energy_level: z.enum(['high', 'medium', 'low']).optional(),
  estimated_minutes: z.number().optional(),
  due_date: z.string().optional().describe('Due date in YYYY-MM-DD format'),
});

const UpdateTaskSchema = z.object({
  task_id: z.string().describe('UUID of task to update'),
  status: z.enum(['todo', 'in_progress', 'blocked', 'done', 'archived']).optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  blocked_reason: z.string().optional(),
  completed_at: z.string().optional().describe('ISO timestamp when completed'),
});

const GetTasksSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'blocked', 'done', 'archived']).optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  context: z.string().optional().describe('Filter by context tag'),
  limit: z.number().default(20),
});

const CreateGoalSchema = z.object({
  title: z.string().describe('Goal title'),
  description: z.string().optional(),
  type: z.enum(['objective', 'key_result']).default('objective'),
  parent_id: z.string().optional().describe('Parent goal UUID for hierarchy'),
  timeframe: z.enum(['yearly', 'quarterly', 'monthly', 'weekly']),
  target_value: z.number().optional(),
  current_value: z.number().optional().default(0),
  unit: z.string().optional().describe('Unit like "$", "users", "%"'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

const UpdateGoalProgressSchema = z.object({
  goal_id: z.string().describe('UUID of goal to update'),
  current_value: z.number().describe('New progress value'),
});

const CreateDailyPlanSchema = z.object({
  plan_date: z.string().describe('Date in YYYY-MM-DD format'),
  morning_intention: z.string().optional(),
  time_blocks: z.array(z.object({
    start: z.string(),
    end: z.string(),
    activity: z.string(),
  })).optional(),
});

const CreateCheckInSchema = z.object({
  mood: z.enum(['great', 'good', 'okay', 'stressed', 'overwhelmed']),
  energy_level: z.number().min(1).max(10),
  gratitude: z.string().optional(),
  challenges: z.string().optional(),
  wins: z.string().optional(),
  needs_support: z.boolean().default(false),
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_task',
        description: 'Create a new task in your task list',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Task title' },
            description: { type: 'string', description: 'Detailed description' },
            status: { type: 'string', enum: ['todo', 'in_progress', 'blocked', 'done', 'archived'], default: 'todo' },
            priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'], default: 'medium' },
            context_tags: { type: 'array', items: { type: 'string' }, description: 'Context tags like ["Work", "Renubu"]' },
            energy_level: { type: 'string', enum: ['high', 'medium', 'low'] },
            estimated_minutes: { type: 'number' },
            due_date: { type: 'string', description: 'Due date in YYYY-MM-DD format' },
          },
          required: ['title'],
        },
      },
      {
        name: 'get_tasks',
        description: 'Get your task list with optional filters',
        inputSchema: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['todo', 'in_progress', 'blocked', 'done', 'archived'] },
            priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
            context: { type: 'string', description: 'Filter by context tag' },
            limit: { type: 'number', default: 20 },
          },
        },
      },
      {
        name: 'update_task',
        description: 'Update an existing task (status, priority, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            task_id: { type: 'string', description: 'UUID of task to update' },
            status: { type: 'string', enum: ['todo', 'in_progress', 'blocked', 'done', 'archived'] },
            priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
            blocked_reason: { type: 'string' },
            completed_at: { type: 'string', description: 'ISO timestamp when completed' },
          },
          required: ['task_id'],
        },
      },
      {
        name: 'create_goal',
        description: 'Create a new goal (yearly, quarterly, monthly, or weekly)',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Goal title' },
            description: { type: 'string' },
            type: { type: 'string', enum: ['objective', 'key_result'], default: 'objective' },
            parent_id: { type: 'string', description: 'Parent goal UUID for hierarchy' },
            timeframe: { type: 'string', enum: ['yearly', 'quarterly', 'monthly', 'weekly'] },
            target_value: { type: 'number' },
            current_value: { type: 'number', default: 0 },
            unit: { type: 'string', description: 'Unit like "$", "users", "%"' },
            start_date: { type: 'string' },
            end_date: { type: 'string' },
          },
          required: ['title', 'timeframe'],
        },
      },
      {
        name: 'get_goals',
        description: 'Get your goals with optional timeframe filter',
        inputSchema: {
          type: 'object',
          properties: {
            timeframe: { type: 'string', enum: ['yearly', 'quarterly', 'monthly', 'weekly'] },
          },
        },
      },
      {
        name: 'update_goal_progress',
        description: 'Update progress on a goal',
        inputSchema: {
          type: 'object',
          properties: {
            goal_id: { type: 'string', description: 'UUID of goal to update' },
            current_value: { type: 'number', description: 'New progress value' },
          },
          required: ['goal_id', 'current_value'],
        },
      },
      {
        name: 'create_daily_plan',
        description: 'Create or update your daily plan and intentions',
        inputSchema: {
          type: 'object',
          properties: {
            plan_date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
            morning_intention: { type: 'string' },
            time_blocks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  start: { type: 'string' },
                  end: { type: 'string' },
                  activity: { type: 'string' },
                },
              },
            },
          },
          required: ['plan_date'],
        },
      },
      {
        name: 'get_daily_plan',
        description: 'Get daily plan for a specific date',
        inputSchema: {
          type: 'object',
          properties: {
            plan_date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
          },
          required: ['plan_date'],
        },
      },
      {
        name: 'create_check_in',
        description: 'Record a mood/energy check-in',
        inputSchema: {
          type: 'object',
          properties: {
            mood: { type: 'string', enum: ['great', 'good', 'okay', 'stressed', 'overwhelmed'] },
            energy_level: { type: 'number', minimum: 1, maximum: 10 },
            gratitude: { type: 'string' },
            challenges: { type: 'string' },
            wins: { type: 'string' },
            needs_support: { type: 'boolean', default: false },
          },
          required: ['mood', 'energy_level'],
        },
      },
      {
        name: 'get_contexts',
        description: 'Get all your context tags (projects, areas)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_active_tasks',
        description: 'Get all active (non-archived) tasks, ordered by priority descending. This is the primary tool for viewing your task list.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_parking_lot_tasks',
        description: 'Get all archived/parking lot tasks. Use this to review tasks that were shelved for later consideration.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_relationships',
        description: 'Get all relationships, optionally filtered by context. Shows which relationships are relevant to your current projects/contexts.',
        inputSchema: {
          type: 'object',
          properties: {
            context: { type: 'string', description: 'Optional: filter relationships whose notes mention this context (e.g., "Renubu", "PowerPak")' },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_task': {
        const params = CreateTaskSchema.parse(args);
        const { data, error } = await supabase
          .from('founder_tasks')
          .insert([params])
          .select();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `✅ Task created: ${params.title}\nID: ${data[0].id}`,
            },
          ],
        };
      }

      case 'get_tasks': {
        const params = GetTasksSchema.parse(args);
        let query = supabase
          .from('founder_tasks')
          .select('*')
          .order('priority', { ascending: false })
          .limit(params.limit);

        if (params.status) {
          query = query.eq('status', params.status);
        }
        if (params.priority) {
          query = query.eq('priority', params.priority);
        }
        if (params.context) {
          query = query.contains('context_tags', [params.context]);
        }

        const { data, error } = await query;
        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'update_task': {
        const params = UpdateTaskSchema.parse(args);
        const { task_id, ...updates } = params;

        const { data, error } = await supabase
          .from('founder_tasks')
          .update(updates)
          .eq('id', task_id)
          .select();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `✅ Task updated: ${data[0].title}`,
            },
          ],
        };
      }

      case 'create_goal': {
        const params = CreateGoalSchema.parse(args);
        const { data, error } = await supabase
          .from('founder_goals')
          .insert([params])
          .select();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `✅ Goal created: ${params.title}\nID: ${data[0].id}`,
            },
          ],
        };
      }

      case 'get_goals': {
        let query = supabase
          .from('founder_goals')
          .select('*')
          .order('created_at', { ascending: false });

        if (args && args.timeframe) {
          query = query.eq('timeframe', args.timeframe);
        }

        const { data, error } = await query;
        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'update_goal_progress': {
        const params = UpdateGoalProgressSchema.parse(args);
        const { data, error } = await supabase
          .from('founder_goals')
          .update({ current_value: params.current_value })
          .eq('id', params.goal_id)
          .select();

        if (error) throw error;

        const progress = data[0].target_value
          ? Math.round((params.current_value / data[0].target_value) * 100)
          : 0;

        return {
          content: [
            {
              type: 'text',
              text: `✅ Goal progress updated: ${data[0].title}\nProgress: ${progress}% (${params.current_value}/${data[0].target_value} ${data[0].unit || ''})`,
            },
          ],
        };
      }

      case 'create_daily_plan': {
        const params = CreateDailyPlanSchema.parse(args);
        const { error } = await supabase
          .from('founder_daily_plans')
          .upsert([params], { onConflict: 'plan_date' })
          .select();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `✅ Daily plan created for ${params.plan_date}`,
            },
          ],
        };
      }

      case 'get_daily_plan': {
        const { data, error } = await supabase
          .from('founder_daily_plans')
          .select('*')
          .eq('plan_date', args?.plan_date)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        return {
          content: [
            {
              type: 'text',
              text: data ? JSON.stringify(data, null, 2) : 'No plan found for this date',
            },
          ],
        };
      }

      case 'create_check_in': {
        const params = CreateCheckInSchema.parse(args);
        const { error } = await supabase
          .from('founder_check_ins')
          .insert([params])
          .select();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `✅ Check-in recorded (Mood: ${params.mood}, Energy: ${params.energy_level}/10)`,
            },
          ],
        };
      }

      case 'get_contexts': {
        const { data, error } = await supabase
          .from('founder_contexts')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_active_tasks': {
        const { data, error } = await supabase
          .from('founder_tasks')
          .select('*')
          .neq('status', 'archived')
          .order('priority', { ascending: false });

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_parking_lot_tasks': {
        const { data, error } = await supabase
          .from('founder_tasks')
          .select('*')
          .eq('status', 'archived')
          .order('updated_at', { ascending: false });

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: data.length > 0
                ? JSON.stringify(data, null, 2)
                : 'No parking lot tasks found. All tasks are active!',
            },
          ],
        };
      }

      case 'get_relationships': {
        // Get all relationships
        let query = supabase
          .from('founder_relationships')
          .select('*')
          .order('last_contact', { ascending: false });

        const { data: relationships, error } = await query;
        if (error) throw error;

        // If context filter provided, filter relationships whose notes mention the context
        const contextFilter = args?.context as string | undefined;
        let filteredRelationships = relationships;

        if (contextFilter && relationships) {
          const lowerContext = contextFilter.toLowerCase();
          filteredRelationships = relationships.filter((rel: { notes?: string }) =>
            rel.notes?.toLowerCase().includes(lowerContext)
          );
        }

        // Also get contexts to show which ones exist
        const { data: contexts } = await supabase
          .from('founder_contexts')
          .select('name')
          .order('name', { ascending: true });

        const contextNames = contexts?.map((c: { name: string }) => c.name) || [];

        // For each relationship, check which contexts are mentioned in notes
        const enrichedRelationships = filteredRelationships?.map((rel: { notes?: string; name: string; relationship: string; last_contact?: string; sentiment?: string }) => {
          const mentionedContexts = contextNames.filter((ctx: string) =>
            rel.notes?.toLowerCase().includes(ctx.toLowerCase())
          );
          return {
            ...rel,
            related_contexts: mentionedContexts,
          };
        });

        return {
          content: [
            {
              type: 'text',
              text: enrichedRelationships && enrichedRelationships.length > 0
                ? JSON.stringify(enrichedRelationships, null, 2)
                : contextFilter
                  ? `No relationships found mentioning "${contextFilter}"`
                  : 'No relationships found.',
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
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

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
