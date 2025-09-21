import { NextRequest, NextResponse } from 'next/server';
import { VapiWebhookEvent, VapiCallSession, VapiTranscriptEntry } from '@/lib/types';
import { dummyVapiCallSessions, dummyVapiTranscripts } from '@/lib/dummy-data';

// In a real implementation, you would verify the webhook signature
function verifyVapiWebhook(request: NextRequest): boolean {
  // TODO: Implement Vapi webhook signature verification
  // const signature = request.headers.get('x-vapi-signature');
  // const payload = await request.text();
  // return verifySignature(payload, signature, process.env.VAPI_WEBHOOK_SECRET);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook authenticity
    if (!verifyVapiWebhook(request)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const event: VapiWebhookEvent = await request.json();
    
    console.log('Received Vapi webhook event:', {
      type: event.type,
      callId: event.callId,
      timestamp: event.timestamp
    });

    switch (event.type) {
      case 'call-started':
        await handleCallStarted(event);
        break;
      
      case 'call-ended':
        await handleCallEnded(event);
        break;
      
      case 'transcript':
        await handleTranscript(event);
        break;
      
      case 'function-call':
        await handleFunctionCall(event);
        break;
      
      default:
        console.log('Unhandled webhook event type:', event.type);
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error processing Vapi webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleCallStarted(event: VapiWebhookEvent) {
  const callData = event.data;
  
  // Create new call session
  const newCallSession: VapiCallSession = {
    id: `vapi-call-${Date.now()}`,
    callId: event.callId,
    clientPhone: callData.customer?.number || 'unknown',
    status: 'in-progress',
    startedAt: event.timestamp,
    assistantId: event.assistantId,
    createdAt: event.timestamp,
    updatedAt: event.timestamp
  };

  // In a real app, save to database
  // For now, add to dummy data
  dummyVapiCallSessions.push(newCallSession);
  
  console.log('Call started:', newCallSession.id);
}

async function handleCallEnded(event: VapiWebhookEvent) {
  const callData = event.data;
  
  // Find existing call session
  const callSession = dummyVapiCallSessions.find(session => session.callId === event.callId);
  
  if (callSession) {
    // Update call session with end data
    callSession.status = callData.endedReason === 'customer-ended-call' ? 'completed' : 'failed';
    callSession.endedAt = event.timestamp;
    callSession.duration = callData.duration;
    callSession.transcript = callData.transcript;
    callSession.summary = callData.summary;
    callSession.recordingUrl = callData.recordingUrl;
    callSession.updatedAt = event.timestamp;
    
    // Extract metadata from call analysis
    if (callData.analysis) {
      callSession.metadata = {
        emotionalState: callData.analysis.sentiment || 'neutral',
        urgencyLevel: callData.analysis.urgency || 5,
        keyTopics: callData.analysis.topics || [],
        followUpRequired: callData.analysis.followUpNeeded || false,
        referralNeeded: callData.analysis.referralRecommended || false
      };
    }
    
    console.log('Call ended:', callSession.id, 'Duration:', callSession.duration, 'seconds');
    
    // Check if immediate therapist notification is needed
    if (callSession.metadata?.urgencyLevel && callSession.metadata.urgencyLevel > 7) {
      await notifyTherapistUrgent(callSession);
    }
  }
}

async function handleTranscript(event: VapiWebhookEvent) {
  const transcriptData = event.data;
  
  // Find the call session
  const callSession = dummyVapiCallSessions.find(session => session.callId === event.callId);
  
  if (callSession && transcriptData.text) {
    // Create transcript entry
    const transcriptEntry: VapiTranscriptEntry = {
      id: `transcript-${event.callId}-${Date.now()}`,
      callSessionId: callSession.id,
      speaker: transcriptData.role === 'assistant' ? 'assistant' : 'user',
      text: transcriptData.text,
      timestamp: event.timestamp,
      confidence: transcriptData.confidence
    };
    
    // Add emotion analysis if available
    if (transcriptData.emotions) {
      transcriptEntry.emotions = {
        sentiment: transcriptData.emotions.sentiment || 'neutral',
        confidence: transcriptData.emotions.confidence || 0,
        emotions: transcriptData.emotions.detected || []
      };
    }
    
    // In a real app, save to database
    dummyVapiTranscripts.push(transcriptEntry);
    
    console.log('Transcript received for call:', callSession.id);
  }
}

async function handleFunctionCall(event: VapiWebhookEvent) {
  const functionData = event.data;
  
  console.log('Function call received:', {
    callId: event.callId,
    function: functionData.functionCall?.name,
    parameters: functionData.functionCall?.parameters
  });
  
  // Handle specific function calls from the AI assistant
  switch (functionData.functionCall?.name) {
    case 'schedule_callback':
      await handleScheduleCallback(event.callId, functionData.functionCall.parameters);
      break;
    
    case 'escalate_to_therapist':
      await handleEscalateToTherapist(event.callId, functionData.functionCall.parameters);
      break;
    
    case 'provide_resources':
      await handleProvideResources(event.callId, functionData.functionCall.parameters);
      break;
    
    default:
      console.log('Unhandled function call:', functionData.functionCall?.name);
  }
}

async function handleScheduleCallback(callId: string, parameters: any) {
  // Handle callback scheduling
  console.log('Scheduling callback for call:', callId, parameters);
  
  // In a real implementation:
  // 1. Create a callback task
  // 2. Add to therapist's calendar
  // 3. Send confirmation to client
}

async function handleEscalateToTherapist(callId: string, parameters: any) {
  // Handle urgent escalation
  console.log('Escalating to therapist for call:', callId, parameters);
  
  const callSession = dummyVapiCallSessions.find(session => session.callId === callId);
  if (callSession) {
    await notifyTherapistUrgent(callSession);
  }
}

async function handleProvideResources(callId: string, parameters: any) {
  // Handle resource provision
  console.log('Providing resources for call:', callId, parameters);
  
  // In a real implementation:
  // 1. Send SMS/email with resources
  // 2. Log resource provision
  // 3. Track resource engagement
}

async function notifyTherapistUrgent(callSession: VapiCallSession) {
  // Notify therapist of urgent call requiring immediate attention
  console.log('URGENT: Call requires immediate therapist attention:', callSession.id);
  
  // In a real implementation:
  // 1. Send SMS/email to on-call therapist
  // 2. Create high-priority task
  // 3. Log urgent notification
  // 4. Potentially trigger automated follow-up if no response
}

// GET endpoint for webhook verification (some services require this)
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const challenge = url.searchParams.get('challenge');
  
  if (challenge) {
    return NextResponse.json({ challenge });
  }
  
  return NextResponse.json({ 
    message: 'Vapi webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
