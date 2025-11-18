#!/usr/bin/env node

/**
 * Test script for MCP Network Sandbox
 * Runs basic integration tests to verify the server works
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'dist', 'index.js');

console.log('🧪 Testing MCP Network Sandbox...\n');

const tests = [
  {
    name: 'List Tools',
    request: { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} },
    validate: (response) => {
      if (!response.result || !response.result.tools) {
        throw new Error('No tools found in response');
      }
      const toolCount = response.result.tools.length;
      if (toolCount !== 5) {
        throw new Error(`Expected 5 tools, got ${toolCount}`);
      }
      console.log(`  ✅ Found ${toolCount} tools: browse_experts, view_profile, get_recommendations, search_experts, get_network_stats`);
      return true;
    },
  },
  {
    name: 'List Resources',
    request: { jsonrpc: '2.0', id: 2, method: 'resources/list', params: {} },
    validate: (response) => {
      if (!response.result || !response.result.resources) {
        throw new Error('No resources found in response');
      }
      const resourceCount = response.result.resources.length;
      if (resourceCount !== 4) {
        throw new Error(`Expected 4 resources, got ${resourceCount}`);
      }
      console.log(`  ✅ Found ${resourceCount} resources: profiles, connections, stats, profile/{id}`);
      return true;
    },
  },
  {
    name: 'Browse Sales Experts',
    request: {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'browse_experts',
        arguments: { category: 'sales', limit: 5 },
      },
    },
    validate: (response) => {
      if (!response.result || !response.result.content) {
        throw new Error('No content in response');
      }
      const text = response.result.content[0].text;
      if (!text.includes('Justin Strackany') || !text.includes('Scott Leese')) {
        throw new Error('Expected sales experts not found');
      }
      console.log(`  ✅ Successfully browsed sales experts`);
      return true;
    },
  },
  {
    name: 'View Specific Profile',
    request: {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'view_profile',
        arguments: { expertId: 'justin-strackany' },
      },
    },
    validate: (response) => {
      if (!response.result || !response.result.content) {
        throw new Error('No content in response');
      }
      const text = response.result.content[0].text;
      if (!text.includes('Justin Strackany') || !text.includes('Renubu')) {
        throw new Error('Profile details not found');
      }
      console.log(`  ✅ Successfully viewed Justin's profile`);
      return true;
    },
  },
  {
    name: 'Get Recommendations',
    request: {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'get_recommendations',
        arguments: { expertId: 'justin-strackany', limit: 3 },
      },
    },
    validate: (response) => {
      if (!response.result || !response.result.content) {
        throw new Error('No content in response');
      }
      const text = response.result.content[0].text;
      if (!text.includes('Scott Leese') || !text.includes('%')) {
        throw new Error('Recommendations not found');
      }
      console.log(`  ✅ Successfully got recommendations for Justin`);
      return true;
    },
  },
  {
    name: 'Search Experts',
    request: {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'search_experts',
        arguments: { query: 'enterprise sales', limit: 5 },
      },
    },
    validate: (response) => {
      if (!response.result || !response.result.content) {
        throw new Error('No content in response');
      }
      const text = response.result.content[0].text;
      if (!text.includes('Marcus')) {
        throw new Error('Search results not found');
      }
      console.log(`  ✅ Successfully searched for enterprise sales experts`);
      return true;
    },
  },
  {
    name: 'Get Network Stats',
    request: {
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: {
        name: 'get_network_stats',
        arguments: {},
      },
    },
    validate: (response) => {
      if (!response.result || !response.result.content) {
        throw new Error('No content in response');
      }
      const text = response.result.content[0].text;
      if (!text.includes('Total Experts') || !text.includes('10')) {
        throw new Error('Network stats not found');
      }
      console.log(`  ✅ Successfully retrieved network statistics`);
      return true;
    },
  },
];

async function runTest(test) {
  return new Promise((resolve, reject) => {
    console.log(`\n📝 Test: ${test.name}`);

    const server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    server.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    server.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Send request
    server.stdin.write(JSON.stringify(test.request) + '\n');

    // Wait for response
    setTimeout(() => {
      try {
        // Try to parse response from stdout
        const lines = stdout.split('\n').filter((line) => line.trim());
        for (const line of lines) {
          try {
            const response = JSON.parse(line);
            if (response.id === test.request.id) {
              test.validate(response);
              server.kill();
              resolve();
              return;
            }
          } catch (e) {
            // Not JSON, skip
          }
        }
        throw new Error('No valid response received');
      } catch (error) {
        server.kill();
        reject(error);
      }
    }, 2000);
  });
}

async function main() {
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await runTest(test);
      passed++;
    } catch (error) {
      console.error(`  ❌ FAILED: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`\n✅ Tests Passed: ${passed}/${tests.length}`);
  if (failed > 0) {
    console.log(`❌ Tests Failed: ${failed}/${tests.length}`);
    process.exit(1);
  } else {
    console.log(`\n🎉 All tests passed! MCP Network Sandbox is ready for demo.\n`);
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
