/**
 * Example: Using Universal Messaging MCP in Your Application
 * 
 * This shows how you might integrate the messaging MCP server
 * into a real application like Renubu.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

/**
 * Example 1: Simple Message Dashboard
 */
async function messageDashboard() {
  const client = await connectToMessagingServer();

  try {
    // Get messages from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const result = await client.callTool({
      name: 'get_recent_messages',
      arguments: {
        limit: 50,
        since: oneDayAgo,
      },
    });

    const data = JSON.parse(result.content[0].text);
    
    console.log(`You have ${data.count} messages in the last 24 hours:\n`);
    
    // Group by platform
    const byPlatform = data.messages.reduce((acc: any, msg: any) => {
      acc[msg.platform] = (acc[msg.platform] || 0) + 1;
      return acc;
    }, {});

    Object.entries(byPlatform).forEach(([platform, count]) => {
      console.log(`  ${platform.toUpperCase()}: ${count} messages`);
    });

  } finally {
    await client.close();
  }
}

/**
 * Example 2: Customer Communication Monitor (Renubu use case)
 */
async function monitorCustomerCommunications() {
  const client = await connectToMessagingServer();

  try {
    // Search for messages mentioning "renewal" or "cancel"
    const renewalMentions = await client.callTool({
      name: 'get_recent_messages',
      arguments: {
        limit: 100,
        searchTerm: 'renewal',
      },
    });

    const cancelMentions = await client.callTool({
      name: 'get_recent_messages',
      arguments: {
        limit: 100,
        searchTerm: 'cancel',
      },
    });

    const renewalData = JSON.parse(renewalMentions.content[0].text);
    const cancelData = JSON.parse(cancelMentions.content[0].text);

    console.log('🚨 CHURN RISK SIGNALS:');
    console.log(`  - ${renewalData.count} messages mentioning "renewal"`);
    console.log(`  - ${cancelData.count} messages mentioning "cancel"\n`);

    // Show recent at-risk messages
    console.log('Recent at-risk messages:');
    [...renewalData.messages, ...cancelData.messages]
      .slice(0, 5)
      .forEach((msg: any) => {
        console.log(`\n[${msg.platform}] ${msg.sender.name}:`);
        console.log(`  "${msg.content.text}"`);
        console.log(`  ${new Date(msg.timestamp).toLocaleString()}`);
      });

  } finally {
    await client.close();
  }
}

/**
 * Example 3: Multi-Platform Response Time Monitor
 */
async function responseTimeAnalysis() {
  const client = await connectToMessagingServer();

  try {
    // Get messages by platform
    const platforms = ['sms', 'slack', 'whatsapp'];
    
    console.log('📊 RESPONSE TIME ANALYSIS\n');

    for (const platform of platforms) {
      const result = await client.callTool({
        name: 'get_recent_messages',
        arguments: {
          limit: 20,
          platforms: [platform],
        },
      });

      const data = JSON.parse(result.content[0].text);
      
      if (data.count > 0) {
        const avgResponseTime = calculateAverageResponseTime(data.messages);
        console.log(`${platform.toUpperCase()}:`);
        console.log(`  Messages: ${data.count}`);
        console.log(`  Avg time between messages: ${avgResponseTime} minutes\n`);
      }
    }

  } finally {
    await client.close();
  }
}

/**
 * Example 4: AI-Powered Message Analysis
 */
async function aiMessageAnalysis() {
  const client = await connectToMessagingServer();

  try {
    // Get recent messages
    const result = await client.callTool({
      name: 'get_recent_messages',
      arguments: { limit: 10 },
    });

    const data = JSON.parse(result.content[0].text);

    console.log('🤖 AI ANALYSIS OF RECENT MESSAGES:\n');

    // Here you would send messages to Claude for analysis
    // This is pseudo-code showing the pattern:
    /*
    const analysis = await claude.analyze({
      prompt: `Analyze these customer messages for:
        1. Sentiment (positive/negative/neutral)
        2. Urgency (high/medium/low)
        3. Topic categories
        4. Action items needed
        
        Messages: ${JSON.stringify(data.messages)}`,
    });

    console.log(analysis);
    */

    console.log('Messages ready for AI analysis:', data.count);
    data.messages.forEach((msg: any, idx: number) => {
      console.log(`\n${idx + 1}. [${msg.platform}] ${msg.sender.name}`);
      console.log(`   "${msg.content.text.substring(0, 80)}..."`);
    });

  } finally {
    await client.close();
  }
}

/**
 * Example 5: Real-Time Alert System
 */
async function realTimeAlerts() {
  const client = await connectToMessagingServer();

  try {
    // Define alert keywords
    const alertKeywords = ['urgent', 'emergency', 'asap', 'critical', 'problem'];
    
    console.log('🚨 MONITORING FOR URGENT MESSAGES...\n');

    // In a real app, this would run continuously
    // For demo, we'll check recent messages
    for (const keyword of alertKeywords) {
      const result = await client.callTool({
        name: 'get_recent_messages',
        arguments: {
          limit: 50,
          searchTerm: keyword,
        },
      });

      const data = JSON.parse(result.content[0].text);
      
      if (data.count > 0) {
        console.log(`⚠️ ALERT: ${data.count} messages containing "${keyword}"`);
        data.messages.slice(0, 3).forEach((msg: any) => {
          console.log(`  [${msg.platform}] ${msg.sender.name}: "${msg.content.text}"`);
        });
        console.log('');
      }
    }

  } finally {
    await client.close();
  }
}

/**
 * Example 6: Integration with Renubu Workflow
 */
async function renubuWorkflowIntegration() {
  const client = await connectToMessagingServer();

  try {
    console.log('🎵 RENUBU WORKFLOW: Renewal Risk Detection\n');

    // Step 1: Check for churn signals across all platforms
    const churnSignals = ['cancel', 'unhappy', 'disappointed', 'switching'];
    
    let totalChurnSignals = 0;
    const alertMessages: any[] = [];

    for (const signal of churnSignals) {
      const result = await client.callTool({
        name: 'get_recent_messages',
        arguments: {
          limit: 100,
          searchTerm: signal,
          since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
        },
      });

      const data = JSON.parse(result.content[0].text);
      totalChurnSignals += data.count;
      alertMessages.push(...data.messages);
    }

    console.log(`Found ${totalChurnSignals} churn signals in the last 7 days\n`);

    // Step 2: Create a Renubu "Movement" (workflow) for high-risk accounts
    if (totalChurnSignals > 0) {
      console.log('🎼 Creating Renubu Movement: "At-Risk Customer Recovery"\n');
      console.log('Notes in this movement:');
      console.log('  1. Review customer health score');
      console.log('  2. Schedule check-in call');
      console.log('  3. Prepare retention offer');
      console.log('  4. Document outcome\n');

      // Show which customers are at risk
      const uniqueCustomers = new Set(alertMessages.map(m => m.sender.name));
      console.log(`At-risk customers (${uniqueCustomers.size}):`);
      Array.from(uniqueCustomers).slice(0, 5).forEach(name => {
        console.log(`  - ${name}`);
      });
    }

  } finally {
    await client.close();
  }
}

/**
 * Helper: Connect to MCP Server
 */
async function connectToMessagingServer(): Promise<Client> {
  const client = new Client({
    name: 'app-client',
    version: '1.0.0',
  }, {
    capabilities: {},
  });

  const serverProcess = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  const transport = new StdioClientTransport({
    reader: serverProcess.stdout,
    writer: serverProcess.stdin,
  });

  await client.connect(transport);
  return client;
}

/**
 * Helper: Calculate average response time
 */
function calculateAverageResponseTime(messages: any[]): number {
  if (messages.length < 2) return 0;
  
  let totalMinutes = 0;
  for (let i = 1; i < messages.length; i++) {
    const diff = new Date(messages[i-1].timestamp).getTime() - 
                 new Date(messages[i].timestamp).getTime();
    totalMinutes += diff / (1000 * 60);
  }
  
  return Math.round(totalMinutes / (messages.length - 1));
}

/**
 * Main: Run examples
 */
async function runExamples() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Universal Messaging MCP - Application Examples');
  console.log('═══════════════════════════════════════════════════════\n');

  const examples = [
    { name: 'Message Dashboard', fn: messageDashboard },
    { name: 'Customer Communication Monitor', fn: monitorCustomerCommunications },
    { name: 'Response Time Analysis', fn: responseTimeAnalysis },
    { name: 'AI Message Analysis', fn: aiMessageAnalysis },
    { name: 'Real-Time Alerts', fn: realTimeAlerts },
    { name: 'Renubu Workflow Integration', fn: renubuWorkflowIntegration },
  ];

  for (const example of examples) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`Running: ${example.name}`);
    console.log('─'.repeat(60));
    
    try {
      await example.fn();
    } catch (error) {
      console.error(`Error in ${example.name}:`, error);
    }
    
    // Wait a bit between examples
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Examples Complete');
  console.log('═══════════════════════════════════════════════════════\n');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().catch(console.error);
}

export {
  messageDashboard,
  monitorCustomerCommunications,
  responseTimeAnalysis,
  aiMessageAnalysis,
  realTimeAlerts,
  renubuWorkflowIntegration,
};
