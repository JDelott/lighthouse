import { NextRequest, NextResponse } from 'next/server';
import { VapiWebhookEvent, VapiCallSession, VapiTranscriptEntry } from '@/lib/types';
// Removed dummy data import - using real data only
import { 
  realCallSessions, 
  realTranscripts, 
  processCompletedCall 
} from '@/lib/call-processor';
import { saveCallSession, saveTranscript } from '@/lib/database';
import { fetchVapiCalls, convertVapiCallToSession, fetchAndProcessCalls } from '@/lib/vapi-api';
import { OrganizationResolver } from '@/lib/organization-resolver';

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
    
    console.log('🔔 VAPI WEBHOOK EVENT RECEIVED:', {
      type: event.type,
      callId: event.callId,
      timestamp: event.timestamp,
      assistantId: event.assistantId,
      hasData: !!event.data,
      dataPreview: event.data ? {
        hasTranscript: !!event.data.transcript,
        transcriptLength: event.data.transcript?.length || 0,
        status: event.data.status
      } : null
    });

    switch (event.type) {
      case 'call-started':
      case 'Status Update':
        await handleCallStarted(event);
        break;
      
      case 'call-ended':
      case 'End Of Call Report':
        await handleCallEnded(event);
        break;
      
      case 'transcript':
      case 'Conversation Update':
        await handleTranscript(event);
        break;
      
      case 'function-call':
        await handleFunctionCall(event);
        break;
      
      case 'Speech Update':
        // Handle speech updates if needed
        console.log('📢 Speech update received');
        break;
      
      default:
        console.log('⚠️ Unhandled webhook event type:', event.type);
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
  
  // Resolve which organization this call belongs to
  const organizationId = await OrganizationResolver.resolve({
    assistantId: event.assistantId,
    phoneNumber: callData.customer?.number,
    request: undefined, // No request object in webhook events
    fallbackToDefault: true
  });

  if (!organizationId) {
    console.error('❌ Could not resolve organization for call:', event.callId);
    return;
  }
  
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

  // Store in real call sessions and database with resolved organization
  realCallSessions.push(newCallSession);
  await saveCallSession(newCallSession, organizationId);
  
  console.log('✅ Real call started:', newCallSession.id, 'Phone:', newCallSession.clientPhone, 'Org:', organizationId);
  console.log('📊 Total call sessions now:', realCallSessions.length);
}

async function handleCallEnded(event: VapiWebhookEvent) {
  const callData = event.data;
  console.log('🔔 Call ended webhook received for:', event.callId);
  
  try {
    // Instead of trying to find existing session, fetch the complete call data from Vapi API
    console.log('🔄 Fetching complete call data from Vapi API...');
    const vapiCalls = await fetchVapiCalls();
    const completedCall = vapiCalls.find(call => call.id === event.callId);
    
    if (completedCall) {
      console.log('✅ Found call in Vapi API:', completedCall.id);
      
      // Convert to our format
      const callSession = convertVapiCallToSession(completedCall);
      
      // Check if we already have this call to avoid duplicates
      const existingIndex = realCallSessions.findIndex(session => session.callId === event.callId);
      
      if (existingIndex >= 0) {
        // Update existing call
        realCallSessions[existingIndex] = callSession;
        console.log('📝 Updated existing call session:', callSession.id);
      } else {
        // Add new call
        realCallSessions.push(callSession);
        console.log('➕ Added new call session:', callSession.id);
      }
      
      // Resolve which organization this call belongs to
      const organizationId = await OrganizationResolver.resolve({
        assistantId: event.assistantId,
        phoneNumber: completedCall.customer?.number,
        request: undefined,
        fallbackToDefault: true
      });

      if (!organizationId) {
        console.error('❌ Could not resolve organization for completed call:', event.callId);
        return;
      }

      // Save to database with resolved organization
      await saveCallSession(callSession, organizationId);
      
      // Process completed call with AI if it has a transcript
      if (callSession.status === 'completed' && callSession.transcript) {
        console.log('🤖 Processing completed call with AI...');
        
        // Pass the organization ID to the call processor
        const callSessionWithOrg = { ...callSession, organizationId };
        await processCompletedCall(callSessionWithOrg);
        
        console.log('✅ Completed AI processing for call:', callSession.id);
        console.log('📅 Check calendar for any new appointments from this call');
      }
      
      console.log('📊 Total call sessions now:', realCallSessions.length);
    } else {
      console.error('❌ Call not found in Vapi API:', event.callId);
    }
    
  } catch (error) {
    console.error('❌ Error processing call ended webhook:', error);
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
    
    // Store transcript entry in real data and save to database
    realTranscripts.push(transcriptEntry);
    await saveTranscript(transcriptEntry);
    
    console.log('✅ Real transcript received for call:', callSession.id);
    console.log('📊 Total transcripts now:', realTranscripts.length);
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
  console.log('🗓️ Scheduling appointment for call:', callId, parameters);
  
  const callSession = realCallSessions.find(session => session.callId === callId);
  if (callSession && typeof parameters === 'object' && parameters !== null) {
    const params = parameters as Record<string, unknown>;
    
    // Ensure metadata exists
    if (!callSession.metadata) {
      callSession.metadata = {};
    }
    
    // Update call session with appointment details
    callSession.metadata.appointmentType = params.appointmentType as any;
    callSession.metadata.urgencyLevel = params.urgency as number;
    callSession.metadata.preferredDates = params.preferredDates as string[];
    callSession.metadata.preferredTimes = params.preferredTimes as string[];
    callSession.metadata.schedulingStatus = 'requested';
    callSession.callType = 'appointment_request';
    
    console.log('✅ Updated call session with appointment request');

    // NEW: Try to book the appointment in real-time if we have enough info
    try {
      await attemptRealTimeBooking(callId, params);
    } catch (error) {
      console.error('❌ Error during real-time booking:', error);
      // Continue - the appointment will be processed later when the call ends
    }
  }
}

// NEW: Real-time booking function for Vapi function calls
async function attemptRealTimeBooking(callId: string, params: Record<string, unknown>) {
  console.log('🤖 Attempting real-time booking for call:', callId);
  
  // Import calendar service functions
  const { findAvailableSlotsForOrganization, bookAppointment } = await import('@/lib/calendar-service');
  const { OrganizationResolver } = await import('@/lib/organization-resolver');
  
  // Get organization ID
  const organizationId = await OrganizationResolver.resolve({
    assistantId: '', // We'll need to get this from the call
    phoneNumber: undefined,
    request: undefined,
    fallbackToDefault: true
  });
  
  if (!organizationId) {
    console.log('❌ Could not resolve organization for real-time booking');
    return;
  }
  
  // Check if we have enough info for booking
  const preferredDates = params.preferredDates as string[];
  if (!preferredDates || preferredDates.length === 0) {
    console.log('⏭️ No preferred dates provided for real-time booking');
    return;
  }
  
  // Try to find an available slot
  for (const dateStr of preferredDates) {
    try {
      const availableSlots = await findAvailableSlotsForOrganization(organizationId, dateStr, 60);
      
      if (availableSlots.length > 0) {
        const slot = availableSlots[0];
        
        // For real-time booking during the call, we'll create a tentative booking
        // The client name and phone will be filled in when the call ends
        console.log(`📅 Found available slot: ${slot.date} at ${slot.startTime}`);
        
        // For now, just log that we found availability
        // The actual booking will happen when the call ends and we have full client info
        console.log('✅ Real-time availability confirmed - will book when call completes');
        
        // Update the call session to indicate booking is possible
        const callSession = realCallSessions.find(session => session.callId === callId);
        if (callSession?.metadata) {
          callSession.metadata.schedulingStatus = 'available';
          callSession.metadata.suggestedSlot = {
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            therapistId: slot.therapistId
          };
        }
        
        return; // Found a slot, exit
      }
    } catch (error) {
      console.error(`❌ Error checking availability for ${dateStr}:`, error);
    }
  }
  
  console.log('📅 No available slots found for real-time booking');
}

async function handleCollectIntakeInfo(callId: string, parameters: unknown) {
  console.log('Collecting intake info for call:', callId, parameters);
  
  const callSession = realCallSessions.find(session => session.callId === callId);
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
  
  const callSession = realCallSessions.find(session => session.callId === callId);
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
