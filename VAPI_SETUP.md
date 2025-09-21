# Lighthouse Psychology - AI Appointment Scheduling Setup

This document provides instructions for setting up the Vapi AI integration for appointment scheduling and intake management.

## Overview

The Lighthouse Psychology platform now includes:
- 24/7 AI-powered appointment scheduling assistant
- Automated intake questionnaire completion during calls
- Real-time conversation transcription and client information capture
- Therapist dashboard for reviewing appointment requests and intake data
- Seamless scheduling workflow when therapists are with other clients
- HIPAA-compliant call recording and data storage

## Prerequisites

1. **Vapi AI Account**: Sign up at [vapi.ai](https://vapi.ai)
2. **Phone Number**: Purchase a phone number through Vapi
3. **Webhook Endpoint**: Publicly accessible URL for receiving Vapi events

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Vapi AI Configuration
VAPI_API_KEY=your_vapi_api_key_here
VAPI_PHONE_NUMBER=+15551234567
VAPI_WEBHOOK_URL=https://your-domain.com/api/vapi/webhook
VAPI_WEBHOOK_SECRET=your_webhook_secret_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Database Configuration (for future use)
DATABASE_URL=postgresql://username:password@localhost:5432/lighthouse

# Application Configuration
APP_ENV=development
APP_URL=http://localhost:3000
```

## Vapi Assistant Configuration

1. **Create Assistant**: Use the Vapi dashboard or API to create a new assistant
2. **Configure Voice**: Use ElevenLabs voice "Adam" (pNInz6obpgDQGcFmaJgB)
3. **Set Transcriber**: Use Deepgram Nova-2 model
4. **Enable Recording**: Turn on call recording for all sessions
5. **Set Webhook URL**: Point to `https://your-domain.com/api/vapi/webhook`

### Assistant Settings

```json
{
  "name": "Lighthouse Mental Health Support Assistant",
  "firstMessage": "Hello, this is the Lighthouse Mental Health Support line. I'm here to provide a safe, confidential space to talk about what's on your mind. How can I support you today?",
  "model": {
    "provider": "openai",
    "model": "gpt-4",
    "systemMessage": "[See src/lib/vapi-config.ts for full prompt]"
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "pNInz6obpgDQGcFmaJgB"
  },
  "transcriber": {
    "provider": "deepgram",
    "model": "nova-2",
    "language": "en-US"
  },
  "recordingEnabled": true,
  "maxDurationSeconds": 1800,
  "silenceTimeoutSeconds": 30,
  "endCallMessage": "Thank you for calling Lighthouse Mental Health Support. Remember, you're not alone, and help is always available. Take care of yourself."
}
```

## Function Definitions

The assistant has access to these functions:

1. **schedule_callback**: Schedule therapist follow-up
2. **escalate_to_therapist**: Immediate crisis escalation
3. **provide_resources**: Share mental health resources

## Installation Steps

1. **Install Dependencies**:
   ```bash
   npm install @vapi-ai/web @vapi-ai/server-sdk
   ```

2. **Configure Environment**:
   - Copy environment variables to `.env.local`
   - Update phone number and webhook URL

3. **Deploy Webhook**:
   - Deploy your application to a public URL
   - Update `VAPI_WEBHOOK_URL` with your deployment URL

4. **Test Integration**:
   - Call the configured phone number
   - Verify webhook events are received
   - Check dashboard for call session data

## API Endpoints

### Webhook Endpoints
- `POST /api/vapi/webhook` - Receives Vapi events
- `GET /api/vapi/webhook` - Webhook verification

### Call Session Management
- `GET /api/vapi/calls` - List call sessions
- `GET /api/vapi/calls/[id]` - Get specific call session
- `GET /api/vapi/transcripts` - List transcripts

## Features Implemented

### 1. AI Phone Support
- 24/7 availability
- Mental health-trained AI assistant
- Crisis detection and escalation
- Coping strategy recommendations

### 2. Real-time Transcription
- Live conversation transcription
- Emotion and sentiment analysis
- Confidence scoring
- Speaker identification

### 3. Therapist Dashboard
- Call session overview
- Transcript review
- Note-taking functionality
- Priority flagging system

### 4. Automated Workflows
- Crisis escalation protocols
- Follow-up scheduling
- Resource sharing
- Referral management

## Security & Compliance

### HIPAA Compliance
- End-to-end encryption for all communications
- Secure storage of transcripts and recordings
- Access logging and audit trails
- Data retention policies

### Privacy Features
- Anonymous caller support
- Optional patient linking
- Secure data transmission
- Regular security audits

## Usage Instructions

### For Clients
1. Call the appointment line: **(555) 123-4567**
2. Speak with the AI scheduling assistant about appointment needs
3. Complete intake questionnaire during the call
4. Receive appointment confirmation and preparation materials
5. Get scheduled even when Dr. Martinez is with other clients

### For Therapists  
1. Access the dashboard at `/dashboard`
2. Switch to "AI Appointment Scheduling Calls" tab
3. Review recent appointment requests and intake information
4. Click on call sessions to view full transcripts and client details
5. Confirm appointments and add preparation notes
6. Access completed intake information before first appointments

## Monitoring & Analytics

### Call Metrics
- Total call volume
- Average call duration
- Urgency level distribution
- Follow-up completion rates

### Quality Assurance
- Transcript accuracy monitoring
- AI response quality review
- Crisis intervention effectiveness
- Patient satisfaction tracking

## Troubleshooting

### Common Issues
1. **Webhook not receiving events**: Check URL accessibility and HTTPS
2. **Transcription quality issues**: Verify Deepgram configuration
3. **AI responses inappropriate**: Review and update system prompts
4. **Call quality problems**: Check voice provider settings

### Support Resources
- Vapi Documentation: [docs.vapi.ai](https://docs.vapi.ai)
- Support Email: support@vapi.ai
- Community Discord: Available through Vapi dashboard

## Future Enhancements

### Planned Features
- Multi-language support
- Advanced emotion analysis
- Integration with EHR systems
- Automated outcome tracking
- Machine learning model improvements

### Database Migration
When ready to move from dummy data to a real database:
1. Set up PostgreSQL database
2. Run migration scripts (to be created)
3. Update API endpoints to use database
4. Implement data backup and recovery

## Development Notes

### File Structure
```
src/
├── app/
│   ├── api/vapi/           # Vapi API endpoints
│   ├── calls/[id]/         # Call session pages
│   ├── components/         # React components
│   └── dashboard/          # Dashboard pages
├── lib/
│   ├── types.ts           # TypeScript definitions
│   ├── dummy-data.ts      # Mock data (replace with DB)
│   ├── utils.ts           # Utility functions
│   └── vapi-config.ts     # Vapi configuration
```

### Key Components
- `CallSessionCard`: Display call session summaries
- `TranscriptViewer`: Show conversation transcripts
- `VapiWebhook`: Handle incoming Vapi events

This setup provides a complete MVP for AI-powered mental health support with professional oversight and follow-up capabilities.
