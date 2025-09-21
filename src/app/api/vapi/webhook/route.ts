import { NextRequest, NextResponse } from 'next/server';
import { VapiWebhookEvent, VapiCallSession, VapiTranscriptEntry } from '@/lib/types';
import { dummyVapiCallSessions, dummyVapiTranscripts } from '@/lib/dummy-data';
import { 
  realCallSessions, 
  realTranscripts, 
  processCompletedCall 
} from '@/lib/call-processor';

// In a real implementation, you would verify the webhook signature
function verifyVapiWebhook(_request: NextRequest): boolean {
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
    callType: 'appointment_request', // Default type
    createdAt: event.timestamp,
    updatedAt: event.timestamp
  };

  // Store in real call sessions (replaces dummy data)
  realCallSessions.push(newCallSession);
  
  console.log('Real call started:', newCallSession.id, 'Phone:', newCallSession.clientPhone);
}

async function handleCallEnded(event: VapiWebhookEvent) {
  const callData = event.data;
  
  // Find existing call session in real data
  const callSession = realCallSessions.find(session => session.callId === event.callId);
  
  if (callSession) {
    // Update call session with end data
    callSession.status = callData.endedReason === 'customer-ended-call' ? 'completed' : 'failed';
    callSession.endedAt = event.timestamp;
    callSession.duration = callData.duration;
    callSession.transcript = callData.transcript;
    callSession.summary = callData.summary; // Will be replaced by AI summary
    callSession.recordingUrl = callData.recordingUrl;
    callSession.updatedAt = event.timestamp;
    
    // Extract metadata from call analysis
    if (callData.analysis) {
      callSession.metadata = {
        emotionalState: callData.analysis.sentiment || 'neutral',
        urgencyLevel: callData.analysis.urgency || 3,
        keyTopics: callData.analysis.topics || [],
        followUpRequired: callData.analysis.followUpNeeded || false,
        referralNeeded: callData.analysis.referralRecommended || false
      };
    }
    
    console.log('Real call ended:', callSession.id, 'Duration:', callSession.duration, 'seconds');
    
    // Process completed call with AI summarization and data extraction
    if (callSession.status === 'completed') {
      console.log('Processing completed call with AI...');
      await processCompletedCall(callSession);
    }
    
    // Check if immediate therapist notification is needed
    if (callSession.metadata?.urgencyLevel && callSession.metadata.urgencyLevel > 7) {
      await notifyTherapistUrgent(callSession);
    }
  } else {
    console.error('Call session not found for callId:', event.callId);
  }
}

async function handleTranscript(event: VapiWebhookEvent) {
  const transcriptData = event.data;
  
  // Find the call session in real data
  const callSession = realCallSessions.find(session => session.callId === event.callId);
  
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
    // Store transcript entry in real data
    realTranscripts.push(transcriptEntry);
    
    console.log('Real transcript received for call:', callSession.id);
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
    case 'schedule_appointment':
      await handleScheduleAppointment(event.callId, functionData.functionCall.parameters);
      break;
    
    case 'collect_intake_info':
      await handleCollectIntakeInfo(event.callId, functionData.functionCall.parameters);
      break;
    
    case 'send_confirmation':
      await handleSendConfirmation(event.callId, functionData.functionCall.parameters);
      break;
    
    default:
      console.log('Unhandled function call:', functionData.functionCall?.name);
  }
}

async function handleScheduleAppointment(callId: string, parameters: unknown) {
  console.log('Scheduling appointment for call:', callId, parameters);
  
  const callSession = dummyVapiCallSessions.find(session => session.callId === callId);
  if (callSession && callSession.metadata && typeof parameters === 'object' && parameters !== null) {
    const params = parameters as Record<string, unknown>;
    // Update call session with appointment details
    callSession.metadata.appointmentType = params.appointmentType as any;
    callSession.metadata.urgencyLevel = params.urgency as number;
    callSession.metadata.preferredDates = params.preferredDates as string[];
    callSession.metadata.preferredTimes = params.preferredTimes as string[];
    callSession.metadata.schedulingStatus = 'requested';
    callSession.callType = 'appointment_request';
    
    console.log('Updated call session with appointment request');
  }
  
  // In a real implementation:
  // 1. Check therapist availability
  // 2. Book appointment slot
  // 3. Create calendar event
  // 4. Send confirmation
}

async function handleCollectIntakeInfo(callId: string, parameters: unknown) {
  console.log('Collecting intake info for call:', callId, parameters);
  
  const callSession = dummyVapiCallSessions.find(session => session.callId === callId);
  if (callSession && callSession.metadata && typeof parameters === 'object' && parameters !== null) {
    const params = parameters as Record<string, any>;
    // Update call session with client info
    callSession.metadata.clientName = params.clientInfo?.fullName;
    callSession.metadata.intakeCompleted = true;
    
    // Store intake information
    console.log('Intake completed for:', params.clientInfo?.fullName);
  }
  
  // In a real implementation:
  // 1. Store client information securely
  // 2. Verify insurance coverage
  // 3. Create client profile
  // 4. Generate intake summary for therapist
}

async function handleSendConfirmation(callId: string, parameters: unknown) {
  console.log('Sending confirmation for call:', callId, parameters);
  
  const callSession = dummyVapiCallSessions.find(session => session.callId === callId);
  if (callSession && callSession.metadata) {
    callSession.metadata.schedulingStatus = 'scheduled';
  }
  
  // In a real implementation:
  // 1. Send email/SMS confirmation
  // 2. Include appointment preparation materials
  // 3. Add to client's calendar
  // 4. Set appointment reminders
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
