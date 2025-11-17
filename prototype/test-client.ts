#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

/**
 * Simple test client to interact with the Universal Messaging MCP Server
 */
async function testUniversalMessaging() {
  console.log('Starting Universal Messaging MCP Client...\n');

  // Create client
  const client = new Client({
    name: 'test-client',
    version: '1.0.0',
  }, {
    capabilities: {},
  });

  // Connect to server via stdio
  const serverProcess = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  const transport = new StdioClientTransport({
    reader: serverProcess.stdout,
    writer: serverProcess.stdin,
  });

  await client.connect(transport);
  console.log('Connected to MCP server\n');

  try {
    // Test 1: Check platform status
    console.log('=== Test 1: Platform Status ===');
    const statusResult = await client.callTool({
      name: 'get_platform_status',
      arguments: {},
    });
    console.log(JSON.parse(statusResult.content[0].text));
    console.log('');

    // Test 2: Get recent messages
    console.log('=== Test 2: Recent Messages (Last 10) ===');
    const messagesResult = await client.callTool({
      name: 'get_recent_messages',
      arguments: {
        limit: 10,
      },
    });
    const messagesData = JSON.parse(messagesResult.content[0].text);
    console.log(`Found ${messagesData.count} messages:\n`);
    
    messagesData.messages.forEach((msg: any, idx: number) => {
      console.log(`${idx + 1}. [${msg.platform.toUpperCase()}] From: ${msg.sender.name}`);
      console.log(`   Time: ${new Date(msg.timestamp).toLocaleString()}`);
      console.log(`   Message: ${msg.content.text.substring(0, 100)}${msg.content.text.length > 100 ? '...' : ''}`);
      if (msg.channel) {
        console.log(`   Channel: ${msg.channel.name}`);
      }
      console.log('');
    });

    // Test 3: Filter by platform
    console.log('=== Test 3: Filter by Platform (Slack only) ===');
    const slackResult = await client.callTool({
      name: 'get_recent_messages',
      arguments: {
        limit: 5,
        platforms: ['slack'],
      },
    });
    const slackData = JSON.parse(slackResult.content[0].text);
    console.log(`Found ${slackData.count} Slack messages\n`);

    // Test 4: Search messages
    console.log('=== Test 4: Search Messages ===');
    const searchResult = await client.callTool({
      name: 'get_recent_messages',
      arguments: {
        limit: 5,
        searchTerm: 'meeting', // Change this to a term that might exist in your messages
      },
    });
    const searchData = JSON.parse(searchResult.content[0].text);
    console.log(`Found ${searchData.count} messages containing "meeting"\n`);

  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await client.close();
    serverProcess.kill();
    console.log('Tests complete');
  }
}

// Run tests
testUniversalMessaging().catch(console.error);
