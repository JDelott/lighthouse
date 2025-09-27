# 🚀 Vapi Integration Setup Guide

## Step 1: Environment Variables

Create a `.env.local` file in your project root with these variables:

```bash
# Vapi AI Configuration
VAPI_API_KEY=your_vapi_private_key_here
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key_here
NEXT_PUBLIC_VAPI_PHONE_NUMBER=+15551234567
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id_here
VAPI_WEBHOOK_SECRET=your_webhook_secret_here

# Application Configuration  
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## Step 2: Vapi Dashboard Configuration

### 2.1 Create Assistant
1. Go to [Vapi Dashboard](https://dashboard.vapi.ai) → Assistants
2. Click "Create Assistant"
3. Use these settings:

**Basic Settings:**
- Name: `The Mental Health Hub Scheduling Assistant`
- First Message: `Hello, thank you for calling The Mental Health Hub. I'm the scheduling assistant. Dr. Martinez is currently with a client, but I'm here to help you schedule an appointment or answer any questions about our services. How can I assist you today?`

**Model Configuration:**
- Provider: `OpenAI`
- Model: `gpt-4`
- System Message: Copy from `src/lib/vapi-config.ts` (the appointmentAssistantConfig.systemPrompt)

**Voice Settings:**
- Provider: `ElevenLabs`
- Voice ID: `pNInz6obpgDQGcFmaJgB` (Adam)

**Transcriber Settings:**
- Provider: `Deepgram`
- Model: `nova-2`
- Language: `en-US`

**Call Settings:**
- Recording Enabled: `true`
- Max Duration: `1200` seconds (20 minutes)
- Silence Timeout: `30` seconds
- End Call Message: `Thank you for calling The Mental Health Hub. You should receive a confirmation email or text shortly with your appointment details. We look forward to seeing you soon!`

### 2.2 Add Functions
In the Functions tab, copy and paste the JSON from `vapi-functions.json`:

```json
[
  {
    "name": "schedule_appointment",
    "description": "Book an appointment slot for the client",
    "parameters": {
      "type": "object",
      "properties": {
        "appointmentType": {
          "type": "string",
          "enum": ["initial_consultation", "follow_up", "couples_therapy", "family_therapy", "psychiatric_eval", "urgent_consultation"],
          "description": "Type of appointment being scheduled"
        },
        "urgency": {
          "type": "number",
          "minimum": 1,
          "maximum": 5,
          "description": "Urgency level (1=routine, 5=urgent but not crisis)"
        },
        "preferredDates": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Client's preferred appointment dates"
        },
        "preferredTimes": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Client's preferred appointment times"
        },
        "duration": {
          "type": "number",
          "enum": [45, 60, 90],
          "description": "Appointment duration in minutes"
        },
        "notes": {
          "type": "string",
          "description": "Any special scheduling notes or requirements"
        }
      },
      "required": ["appointmentType", "urgency", "preferredDates", "preferredTimes"]
    }
  },
  // ... other functions from vapi-functions.json
]
```

### 2.3 Configure Server URL
In the assistant settings, set:
- Server URL: `https://your-domain.com/api/vapi/webhook`

### 2.4 Assign Phone Number
1. Go to Phone Numbers tab
2. Assign your purchased phone number to the assistant

## Step 3: Deploy & Test

### 3.1 Deploy Your App
Deploy to Vercel, Netlify, or your preferred platform so you have a public webhook URL.

### 3.2 Update Environment Variables
Update your `.env.local` with:
- Your actual Vapi keys
- Your actual phone number
- Your assistant ID
- Your deployed app URL

### 3.3 Test Integration

1. **Test Webhook**: Visit `/dashboard` and use the "Test Webhook" button
2. **Test API**: Use the "Test Calls API" button  
3. **Test Phone Call**: Call your Vapi phone number and try scheduling an appointment

## Step 4: Verification Checklist

✅ **Environment Variables Set**
- [ ] VAPI_API_KEY
- [ ] NEXT_PUBLIC_VAPI_PUBLIC_KEY  
- [ ] NEXT_PUBLIC_VAPI_PHONE_NUMBER
- [ ] NEXT_PUBLIC_VAPI_ASSISTANT_ID

✅ **Vapi Dashboard Configuration**
- [ ] Assistant created with correct prompts
- [ ] Functions added and configured
- [ ] Voice settings configured (ElevenLabs Adam)
- [ ] Transcriber settings configured (Deepgram Nova-2)
- [ ] Phone number assigned to assistant
- [ ] Server URL pointing to your webhook

✅ **App Integration**
- [ ] Webhook endpoint responding at `/api/vapi/webhook`
- [ ] Phone number displaying correctly on homepage
- [ ] Dashboard showing call sessions tab
- [ ] Test buttons working in dashboard

✅ **End-to-End Test**
- [ ] Call the phone number
- [ ] AI assistant responds with greeting
- [ ] Can complete appointment scheduling flow
- [ ] Webhook receives call events
- [ ] Call session appears in dashboard
- [ ] Transcript is captured and displayed

## Troubleshooting

### Common Issues:

**1. Webhook Not Receiving Events**
- Check that your server URL is publicly accessible
- Verify HTTPS is enabled
- Check webhook logs in Vapi dashboard

**2. Assistant Not Responding**
- Verify assistant ID is correct
- Check that phone number is assigned to assistant
- Review system prompt for any errors

**3. Functions Not Working**
- Verify function definitions match exactly
- Check webhook handler function names
- Review function parameters

**4. Phone Number Issues**
- Ensure phone number format is correct (+1XXXXXXXXXX)
- Verify number is assigned to correct assistant
- Check number status in Vapi dashboard

### Support Resources:
- [Vapi Documentation](https://docs.vapi.ai)
- [Vapi Discord Community](https://discord.gg/vapi)
- Dashboard logs and analytics

## Production Checklist

Before going live:

1. **Security**
   - [ ] Enable webhook signature verification
   - [ ] Use environment variables for all secrets
   - [ ] Enable HTTPS on your domain

2. **Monitoring**
   - [ ] Set up call monitoring in Vapi dashboard
   - [ ] Configure error logging
   - [ ] Set up appointment confirmation emails/SMS

3. **Business Logic**
   - [ ] Connect to real calendar system
   - [ ] Integrate with practice management software
   - [ ] Set up real appointment confirmations
   - [ ] Configure therapist notifications

Your Vapi AI appointment scheduling system is now ready to handle client calls 24/7! 🎉
