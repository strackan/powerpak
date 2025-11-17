# Universal Messaging MCP - Technical Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Renubu     │  │ Claude       │  │ Your Custom  │          │
│  │   Frontend   │  │ Desktop      │  │ Application  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                   │
│                            │                                       │
└────────────────────────────┼───────────────────────────────────────┘
                             │
                             │ MCP Protocol (JSON-RPC over stdio/HTTP)
                             │
┌────────────────────────────┼───────────────────────────────────────┐
│                            ↓                                       │
│              UNIVERSAL MESSAGING MCP SERVER                        │
│  ┌──────────────────────────────────────────────────────┐        │
│  │  MCP Interface Layer                                  │        │
│  │  - ListTools: Expose available tools                 │        │
│  │  - CallTool: Handle tool invocations                 │        │
│  │  - Error handling & response formatting              │        │
│  └────────────────────┬──────────────────────────────────┘        │
│                       │                                            │
│  ┌────────────────────┴──────────────────────────────────┐        │
│  │  Aggregation & Normalization Layer                    │        │
│  │  - Parallel fetching from all platforms               │        │
│  │  - Message deduplication                              │        │
│  │  - Timestamp-based sorting                            │        │
│  │  - Search filtering                                   │        │
│  │  - Format standardization                             │        │
│  └────────────────────┬──────────────────────────────────┘        │
│                       │                                            │
│  ┌────────────────────┴──────────────────────────────────┐        │
│  │  Adapter Layer (Platform-Specific)                    │        │
│  │                                                         │        │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  │   SMS    │  │  Slack   │  │  GChat   │  │ WhatsApp │      │
│  │  │ Adapter  │  │ Adapter  │  │ Adapter  │  │ Adapter  │      │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│  │       │             │             │             │              │
│  └───────┼─────────────┼─────────────┼─────────────┼──────────────┘
│          │             │             │             │              │
└──────────┼─────────────┼─────────────┼─────────────┼──────────────┘
           │             │             │             │
           │ REST API    │ Web API     │ REST API    │ REST API
           ↓             ↓             ↓             ↓
┌──────────────────────────────────────────────────────────────────┐
│                    EXTERNAL PLATFORM APIs                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Twilio   │  │ Slack    │  │ Google   │  │ Twilio   │        │
│  │ SMS API  │  │ Web API  │  │ Chat API │  │ WhatsApp │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└──────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Message Retrieval Flow

```
1. Client calls MCP tool: get_recent_messages(limit=50)
                    ↓
2. MCP Server receives request via JSON-RPC
                    ↓
3. Server identifies configured adapters
                    ↓
4. Parallel API calls to all platforms:
   ├─→ SMS Adapter: GET /Messages.json
   ├─→ Slack Adapter: POST conversations.history
   ├─→ GChat Adapter: GET spaces/{id}/messages
   └─→ WhatsApp Adapter: GET /Messages.json
                    ↓
5. Each adapter normalizes to UnifiedMessage format
                    ↓
6. Aggregation layer:
   - Combines all message arrays
   - Removes duplicates
   - Sorts by timestamp
   - Applies filters
   - Limits to requested count
                    ↓
7. Server formats response as JSON
                    ↓
8. Client receives unified message array
```

### Message Format Transformation

**Platform-Specific → Unified**

```typescript
// Slack Native Format
{
  "type": "message",
  "user": "U123ABC",
  "text": "Can we discuss renewal?",
  "ts": "1700000000.123456",
  "channel": "C456DEF"
}

// ↓ Adapter Transformation ↓

// Unified Format
{
  "id": "slack-C456DEF-1700000000.123456",
  "platform": "slack",
  "sender": {
    "id": "U123ABC",
    "name": "John Smith",
    "email": "john@company.com"
  },
  "content": {
    "text": "Can we discuss renewal?"
  },
  "timestamp": "2025-11-17T10:30:00.000Z",
  "channel": {
    "id": "C456DEF",
    "name": "customer-success"
  },
  "metadata": {
    "platformMessageId": "1700000000.123456",
    "raw": { /* original message */ }
  }
}
```

---

## Design Decisions

### 1. Adapter Pattern

**Why:**
- Each platform has unique API quirks
- Encapsulates platform-specific logic
- Easy to add new platforms
- Can be tested independently

**Implementation:**
```typescript
interface MessageAdapter {
  name: string;
  fetchRecentMessages(limit?: number, since?: Date): Promise<UnifiedMessage[]>;
  getMessageById(id: string): Promise<UnifiedMessage | null>;
  isConfigured(): boolean;
}
```

### 2. Parallel Fetching

**Why:**
- Faster than sequential (4x speedup with 4 platforms)
- Platforms are independent
- Users want quick responses

**Implementation:**
```typescript
const messagePromises = adapters
  .filter(adapter => adapter.isConfigured())
  .map(adapter => adapter.fetchRecentMessages(limit, sinceDate));

const messageArrays = await Promise.all(messagePromises);
const allMessages = messageArrays.flat();
```

### 3. Client-Side Filtering

**Why:**
- Platform APIs have inconsistent query capabilities
- Easier to implement once than per-platform
- More flexible for complex queries

**Trade-off:**
- Fetches more data than needed
- Could hit rate limits faster
- Future: Add server-side caching

### 4. Unified Message ID Format

**Pattern:** `{platform}-{original-id}`

**Why:**
- Globally unique across all platforms
- Easy to parse (extract platform)
- Maintains traceability to source

**Examples:**
- `slack-C123-1700000000.123456`
- `sms-SM1234567890abcdef`
- `whatsapp-SM0987654321fedcba`

### 5. Optional Platform Configuration

**Why:**
- Users may not use all platforms
- Reduces setup friction
- Graceful degradation

**Implementation:**
```typescript
constructor() {
  const token = process.env.SLACK_BOT_TOKEN;
  if (token) {
    this.client = new WebClient(token);
  }
}

isConfigured(): boolean {
  return this.client !== null;
}
```

---

## Technical Choices

### Language: TypeScript

**Pros:**
- Type safety for complex data transformations
- Great tooling/IDE support
- Native async/await
- MCP SDK is TypeScript-first

**Cons:**
- Build step required
- Slightly more setup than Python

### Transport: stdio

**Pros:**
- Simple process-to-process communication
- No network configuration needed
- Works well with Claude Desktop
- Standard for MCP servers

**Future:** Could add HTTP/SSE for cloud deployment

### Error Handling: Graceful Degradation

```typescript
try {
  const messages = await adapter.fetchRecentMessages();
  return messages;
} catch (error) {
  console.error(`Error fetching from ${adapter.name}:`, error);
  return []; // Return empty array, don't fail entire request
}
```

**Why:**
- One platform's failure shouldn't break everything
- User still gets messages from working platforms
- Better user experience

### Authentication: Environment Variables

**Why:**
- Standard practice
- Works with all deployment methods
- Easy to rotate credentials
- Secure (not in code)

**Future:** Could add vault integration (AWS Secrets, HashiCorp Vault)

---

## Performance Characteristics

### Latency Breakdown (estimated)

```
Component                          Time        Notes
─────────────────────────────────────────────────────────────
MCP Protocol Overhead              <10ms       JSON-RPC minimal
Adapter Initialization             <1ms        Cached after first call
API Calls (parallel):
  - Slack API                      100-300ms   Depends on channel count
  - Twilio SMS                     200-400ms   REST API
  - Google Chat                    300-500ms   OAuth overhead
  - Twilio WhatsApp                200-400ms   REST API
Message Normalization              1-5ms       Per message
Sorting & Filtering                <10ms       In-memory operations
Response Formatting                <5ms        JSON stringify
─────────────────────────────────────────────────────────────
Total End-to-End                   300-900ms   Depends on slowest API
```

### Optimization Opportunities

1. **Caching Layer**
   ```typescript
   // Cache messages for 30 seconds
   if (cache.has(cacheKey) && !cache.isExpired(cacheKey)) {
     return cache.get(cacheKey);
   }
   ```

2. **Pagination**
   ```typescript
   // Don't fetch all messages at once
   async function* fetchMessagesStream() {
     let pageToken = null;
     do {
       const result = await fetchPage(pageToken);
       yield result.messages;
       pageToken = result.nextPageToken;
     } while (pageToken);
   }
   ```

3. **Incremental Updates**
   ```typescript
   // Only fetch messages since last check
   const lastCheck = await db.getLastCheckTime(platform);
   const messages = await adapter.fetchRecentMessages(100, lastCheck);
   ```

---

## Scalability Considerations

### Current Limits

| Aspect | Limit | Reason |
|--------|-------|--------|
| Concurrent clients | ~10 | stdio transport |
| Messages per request | 100 | API rate limits |
| Platforms | 4 | Implemented adapters |
| Real-time updates | No | Polling-based |

### Scaling Strategies

**1. Add HTTP Transport**
```typescript
// Support both stdio and HTTP
if (process.env.MCP_TRANSPORT === 'http') {
  transport = new HttpServerTransport({ port: 3000 });
} else {
  transport = new StdioServerTransport();
}
```

**2. Add Webhook Support**
```typescript
// Real-time message ingestion
app.post('/webhook/slack', async (req, res) => {
  const message = await slackAdapter.parseWebhook(req.body);
  await messageQueue.enqueue(message);
  res.status(200).send('OK');
});
```

**3. Add Message Persistence**
```typescript
// Store messages in database
await db.messages.insert({
  ...message,
  created_at: new Date(),
  indexed_at: new Date()
});
```

**4. Add Search Index**
```typescript
// Full-text search with Elasticsearch
await searchIndex.index({
  id: message.id,
  text: message.content.text,
  platform: message.platform,
  timestamp: message.timestamp
});
```

---

## Security Considerations

### Current Implementation

1. **Credentials in Environment**
   - ✅ Not in code
   - ✅ Not in version control
   - ⚠️ Visible to process inspector

2. **API Tokens**
   - ✅ Bot tokens (limited scope)
   - ✅ Read-only access
   - ⚠️ No token rotation

3. **Message Data**
   - ⚠️ No encryption at rest
   - ⚠️ Stored in memory (exposed in logs)
   - ⚠️ Original messages in metadata

### Production Hardening

**1. Use Secret Management**
```typescript
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const secrets = await secretsManager.getSecretValue({
  SecretId: 'universal-messaging/api-tokens'
});

const tokens = JSON.parse(secrets.SecretString);
```

**2. Implement Token Rotation**
```typescript
// Check token age, rotate if needed
if (await tokenManager.isExpired('slack')) {
  await tokenManager.rotate('slack');
}
```

**3. Add PII Scrubbing**
```typescript
// Remove sensitive data from logs
function sanitizeMessage(message: UnifiedMessage) {
  return {
    ...message,
    sender: {
      ...message.sender,
      email: '[REDACTED]',
      phone: '[REDACTED]'
    },
    metadata: undefined // Don't log raw messages
  };
}
```

**4. Implement Rate Limiting**
```typescript
// Prevent API abuse
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60 // 60 requests per minute
});
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('SlackAdapter', () => {
  it('converts Slack message to unified format', () => {
    const slackMsg = { /* Slack format */ };
    const unified = adapter.toUnifiedMessage(slackMsg);
    
    expect(unified.platform).toBe('slack');
    expect(unified.sender.name).toBeDefined();
  });
});
```

### Integration Tests

```typescript
describe('MCP Server', () => {
  it('aggregates messages from multiple platforms', async () => {
    const result = await client.callTool({
      name: 'get_recent_messages',
      arguments: { limit: 10 }
    });
    
    const data = JSON.parse(result.content[0].text);
    expect(data.messages).toBeInstanceOf(Array);
  });
});
```

### End-to-End Tests

```bash
# Test with real APIs (use test accounts)
npm run test:e2e
```

---

## Monitoring & Observability

### Metrics to Track

```typescript
// Prometheus-style metrics
messaging_api_calls_total{platform="slack",status="success"} 1234
messaging_api_calls_total{platform="slack",status="error"} 5
messaging_api_latency_seconds{platform="slack",quantile="0.5"} 0.234
messaging_messages_fetched_total{platform="slack"} 5678
```

### Logging

```typescript
// Structured logging
logger.info('Fetching messages', {
  platform: 'slack',
  limit: 50,
  since: sinceDate?.toISOString()
});
```

### Health Checks

```typescript
// Expose health endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    platforms: adapters.map(a => ({
      name: a.name,
      configured: a.isConfigured(),
      reachable: await checkPlatformHealth(a)
    }))
  };
  res.json(health);
});
```

---

## Future Architecture

### Phase 2: Cloud-Native Deployment

```
┌─────────────────────────────────────────────┐
│         Load Balancer (nginx/ALB)           │
└──────────────────┬──────────────────────────┘
                   │
     ┌─────────────┼─────────────┐
     ↓             ↓             ↓
┌─────────┐  ┌─────────┐  ┌─────────┐
│  MCP    │  │  MCP    │  │  MCP    │
│ Server  │  │ Server  │  │ Server  │
│Instance │  │Instance │  │Instance │
└────┬────┘  └────┬────┘  └────┬────┘
     │            │            │
     └────────────┼────────────┘
                  │
     ┌────────────┼────────────┐
     ↓            ↓            ↓
┌─────────┐  ┌─────────┐  ┌─────────┐
│  Redis  │  │Postgres │  │Elastic  │
│  Cache  │  │Messages │  │ Search  │
└─────────┘  └─────────┘  └─────────┘
```

---

## Conclusion

This POC demonstrates that **MCP can be an effective universal adapter layer** for business systems.

Key achievements:
- ✅ Unified interface for disparate platforms
- ✅ Extensible architecture (easy to add platforms)
- ✅ Production-ready patterns (error handling, graceful degradation)
- ✅ Performance characteristics suitable for real-world use

Next steps depend on strategic direction:
1. Use internally for Renubu
2. Open source for community
3. Commercialize as standalone product

The technology works. Now it's a business decision.
