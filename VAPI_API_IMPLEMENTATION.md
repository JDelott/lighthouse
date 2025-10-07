# VAPI API Implementation

This project uses the **VAPI REST API directly** instead of the VAPI SDK. All interactions with VAPI are done through standard `fetch()` calls.

## Why Direct API Instead of SDK?

- **Better Control**: Direct control over API calls and error handling
- **Smaller Bundle Size**: No need for SDK dependencies
- **Flexibility**: Easier to customize and extend API interactions
- **Transparency**: Clear visibility into what data is being sent/received

## API Integration Points

### 1. Fetching Calls (`src/lib/vapi-api.ts`)

```typescript
// Direct REST API call to fetch calls
const response = await fetch(`https://api.vapi.ai/call?${params.toString()}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
    'Content-Type': 'application/json',
  },
});
```

**Key Features:**
- Fetches recent calls from VAPI
- Filters to last 7 days to avoid old test data
- Converts VAPI format to internal `VapiCallSession` format
- Handles errors gracefully

### 2. Webhook Processing (`src/app/api/vapi/webhook/route.ts`)

The webhook endpoint receives events from VAPI in real-time:

**Supported Event Types:**
- `call-started` / `Status Update` - Call initiation
- `call-ended` / `End Of Call Report` - Call completion
- `transcript` / `Conversation Update` - Real-time transcription
- `function-call` - AI assistant function calls
- `Speech Update` - Speech recognition updates

**Workflow:**
1. Receive webhook event from VAPI
2. Process event based on type
3. Save to database with organization context
4. Process completed calls with AI (Anthropic Claude)
5. Create appointment requests and therapist notes

### 3. Call Processing (`src/lib/call-processor.ts`)

After a call ends, we process it with AI:

**Processing Steps:**
1. Extract client name from transcript
2. Generate AI summary using Anthropic Claude
3. Extract structured appointment data
4. Create appointment request for therapist review
5. Generate therapist notes with action items

## Environment Variables Required

```bash
# VAPI Configuration
VAPI_API_KEY=your_vapi_api_key
VAPI_PHONE_NUMBER=+15551234567
VAPI_WEBHOOK_URL=https://your-domain.com/api/vapi/webhook
VAPI_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_VAPI_ASSISTANT_ID=asst_your_assistant_id

# AI Processing
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## API Endpoints

### VAPI REST API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `https://api.vapi.ai/call` | GET | Fetch call history |
| Webhook callback | POST | Receive real-time events |

### Authentication

All API calls use Bearer token authentication:
```
Authorization: Bearer ${VAPI_API_KEY}
```

## Data Flow

```
VAPI Call → Webhook Event → Process & Save → AI Analysis → Appointment Request
                                ↓
                         Database (PostgreSQL)
                                ↓
                         Dashboard Display
```

## Key Files

- **`src/lib/vapi-api.ts`** - Main VAPI API integration
- **`src/app/api/vapi/webhook/route.ts`** - Webhook event handler
- **`src/lib/call-processor.ts`** - AI-powered call processing
- **`src/lib/types.ts`** - TypeScript type definitions
- **`src/lib/database.ts`** - Database operations

## Type Definitions

### VapiCall (API Response)
```typescript
interface VapiCall {
  id: string;
  type: string;
  status: string;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  transcript?: string;
  recordingUrl?: string;
  customer?: {
    number?: string;
  };
}
```

### VapiCallSession (Internal Format)
```typescript
interface VapiCallSession {
  id: string;
  callId: string;
  clientPhone: string;
  status: 'in-progress' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  endedAt?: string;
  duration?: number;
  transcript?: string;
  summary?: string;
  recordingUrl?: string;
  assistantId: string;
  callType: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

## Error Handling

All API calls include comprehensive error handling:

```typescript
try {
  const response = await fetch(...);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Vapi API error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    return [];
  }
  // Process response...
} catch (error) {
  console.error('❌ Error fetching calls from Vapi:', error);
  return [];
}
```

## Testing

### Test Webhook Endpoint
```bash
curl http://localhost:3000/api/vapi/webhook
```

### Fetch Calls via API
```bash
curl http://localhost:3000/api/calls \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Migration from SDK

**Previously:** `@vapi-ai/web` SDK was listed in dependencies but never used.

**Now:** All VAPI interactions use direct REST API calls with `fetch()`.

**Benefits:**
- ✅ Removed 11 packages from dependencies
- ✅ Smaller bundle size
- ✅ Better control and transparency
- ✅ No SDK version compatibility issues

## Future Enhancements

Potential areas for improvement:

1. **Webhook Signature Verification** - Implement proper signature verification for security
2. **Rate Limiting** - Add rate limiting for API calls
3. **Retry Logic** - Implement exponential backoff for failed API calls
4. **Caching** - Cache call data to reduce API calls
5. **Real-time Updates** - Use WebSockets for real-time call status updates

## Resources

- [VAPI API Documentation](https://docs.vapi.ai)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Webhook Best Practices](https://docs.vapi.ai/webhooks)

---

**Last Updated:** October 7, 2025
