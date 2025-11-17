/**
 * Quick test script to verify the MCP server works
 *
 * This simulates what Claude Desktop will do when connecting
 */

const { spawn } = require('child_process');

console.log('Testing Justin Voice MCP Server...\n');

// Start the server
const server = spawn('node', ['dist/index.js'], {
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'inherit']
});

let responseBuffer = '';
let requestId = 0;

server.stdout.on('data', (data) => {
  responseBuffer += data.toString();

  // Try to parse complete JSON responses
  const lines = responseBuffer.split('\n');
  responseBuffer = lines.pop(); // Keep the last incomplete line

  lines.forEach(line => {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        console.log('Response:', JSON.stringify(response, null, 2));
      } catch (e) {
        // Not JSON, might be a log message
        if (!line.includes('Justin Voice MCP Server')) {
          console.log('Output:', line);
        }
      }
    }
  });
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Helper to send JSON-RPC request
function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: '2.0',
    id: ++requestId,
    method,
    params
  };

  console.log(`\nSending: ${method}`);
  server.stdin.write(JSON.stringify(request) + '\n');
}

// Wait a moment for server to start, then run tests
setTimeout(() => {
  console.log('\n=== Test 1: Initialize ===');
  sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  });

  setTimeout(() => {
    console.log('\n=== Test 2: List Resources ===');
    sendRequest('resources/list');
  }, 1000);

  setTimeout(() => {
    console.log('\n=== Test 3: List Tools ===');
    sendRequest('tools/list');
  }, 2000);

  setTimeout(() => {
    console.log('\n=== Test 4: Read Templates Resource ===');
    sendRequest('resources/read', {
      uri: 'justin://templates/beginnings'
    });
  }, 3000);

  setTimeout(() => {
    console.log('\n=== Test 5: Analyze Voice ===');
    sendRequest('tools/call', {
      name: 'analyze_voice',
      arguments: {
        text: 'I was sitting in my car -- you know that feeling? (the worst, am I right?) And shit got real.'
      }
    });
  }, 4000);

  setTimeout(() => {
    console.log('\n=== Test 6: Get Blend Recommendation ===');
    sendRequest('tools/call', {
      name: 'get_blend_recommendation',
      arguments: {
        context: 'product launch',
        mood: 'vulnerable'
      }
    });
  }, 5000);

  setTimeout(() => {
    console.log('\n=== All tests complete! ===\n');
    server.kill();
    process.exit(0);
  }, 7000);

}, 1000);
