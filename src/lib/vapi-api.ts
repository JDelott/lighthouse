import { VapiCallSession, VapiTranscriptEntry, AppointmentRequest, TherapistNote } from './types';
import { summarizeCallForTherapist, parseAppointmentDetails } from './call-processor';

export interface VapiCall {
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
  analysis?: {
    summary?: string;
    sentiment?: string;
    urgency?: number;
    topics?: string[];
    followUpNeeded?: boolean;
    referralRecommended?: boolean;
  };
}

// Fetch calls from Vapi API using direct REST API calls
export async function fetchVapiCalls(): Promise<VapiCall[]> {
  try {
    console.log('🔄 Fetching calls from Vapi API...');
    
    if (!process.env.VAPI_API_KEY) {
      console.error('❌ VAPI_API_KEY not configured');
      return [];
    }

    // Build query parameters
    const params = new URLSearchParams({
      limit: '10',
      // Add assistant filter if available
      ...(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID && {
        assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID
      })
    });
    
    // Fetch calls from Vapi REST API - limit to recent calls only
    const response = await fetch(`https://api.vapi.ai/call?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Vapi API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return [];
    }

    const calls = await response.json();
    console.log('✅ Fetched', calls.length, 'calls from Vapi API');
    
    // Filter to only calls from the last 7 days to avoid old test data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentCalls = calls.filter((call: VapiCall) => {
      const callDate = new Date(call.startedAt);
      return callDate >= sevenDaysAgo;
    });
    
    console.log('🎯 Filtered to', recentCalls.length, 'recent calls (last 7 days)');
    return recentCalls as VapiCall[];
    
  } catch (error) {
    console.error('❌ Error fetching calls from Vapi:', error);
    return [];
  }
}

// Convert Vapi call to our VapiCallSession format
export function convertVapiCallToSession(vapiCall: VapiCall): VapiCallSession {
  return {
    id: `vapi-${vapiCall.id}`,
    callId: vapiCall.id,
    clientPhone: vapiCall.customer?.number || 'unknown',
    status: mapVapiStatus(vapiCall.status),
    startedAt: vapiCall.startedAt,
    endedAt: vapiCall.endedAt,
    duration: vapiCall.duration,
    transcript: vapiCall.transcript,
    summary: vapiCall.analysis?.summary,
    recordingUrl: vapiCall.recordingUrl,
    assistantId: 'default',
    callType: 'appointment_request',
    metadata: vapiCall.analysis ? {
      emotionalState: vapiCall.analysis.sentiment || 'neutral',
      urgencyLevel: vapiCall.analysis.urgency || 3,
      keyTopics: vapiCall.analysis.topics || [],
      followUpRequired: vapiCall.analysis.followUpNeeded || false,
      referralNeeded: vapiCall.analysis.referralRecommended || false,
    } : undefined,
    createdAt: vapiCall.startedAt,
    updatedAt: vapiCall.endedAt || vapiCall.startedAt,
  };
}

// Map Vapi status to our status
function mapVapiStatus(vapiStatus: string): VapiCallSession['status'] {
  switch (vapiStatus.toLowerCase()) {
    case 'ended':
    case 'completed':
      return 'completed';
    case 'in-progress':
    case 'ringing':
      return 'in-progress';
    case 'failed':
    case 'busy':
    case 'no-answer':
      return 'failed';
    case 'canceled':
    case 'cancelled':
      return 'cancelled';
    default:
      return 'completed'; // Default to completed for ended calls
  }
}

// Fetch and process calls with AI
export async function fetchAndProcessCalls(): Promise<{
  callSessions: VapiCallSession[];
  appointmentRequests: AppointmentRequest[];
  therapistNotes: TherapistNote[];
}> {
  try {
    console.log('🤖 Fetching and processing calls with AI...');
    
    // Fetch calls from Vapi
    const vapiCalls = await fetchVapiCalls();
    
    // Convert to our format
    const callSessions = vapiCalls.map(convertVapiCallToSession);
    
    console.log('📊 Processing', callSessions.length, 'call sessions...');
    
    const appointmentRequests: AppointmentRequest[] = [];
    const therapistNotes: TherapistNote[] = [];
    
    // Process only the most recent 10 completed calls to avoid rate limits
    const callsToProcess = callSessions
      .filter(session => session.status === 'completed' && session.transcript)
      .slice(0, 10);
    
    console.log('🎯 Processing top', callsToProcess.length, 'completed calls with transcripts...');
    
    // Process each completed call with AI
    for (const callSession of callsToProcess) {
      try {
          // Generate AI summary if not already present
          if (!callSession.summary) {
            console.log('🤖 Generating AI summary for call:', callSession.id);
            callSession.summary = await summarizeCallForTherapist(
              callSession.transcript,
              callSession.metadata
            );
          }
          
          // Extract appointment data
          console.log('🤖 Extracting appointment data for call:', callSession.id);
          const appointmentData = await parseAppointmentDetails(callSession.transcript);
          
          if (appointmentData.clientInfo || appointmentData.appointmentDetails) {
            const appointmentRequest: AppointmentRequest = {
              id: `appt-req-${callSession.id}`,
              callSessionId: callSession.id,
              clientInfo: appointmentData.clientInfo || {},
              appointmentDetails: appointmentData.appointmentDetails || {},
              intakeInfo: appointmentData.intakeInfo || {},
              status: 'pending_review',
              createdAt: callSession.createdAt,
              updatedAt: new Date().toISOString()
            };
            
            appointmentRequests.push(appointmentRequest);
            console.log('✅ Created appointment request:', appointmentRequest.id);
          }
          
          // Create therapist note
          const therapistNote: TherapistNote = {
            id: `note-${callSession.id}`,
            callSessionId: callSession.id,
            therapistId: 'prov-001',
            note: callSession.summary || 'Call completed - review transcript for details',
            actionItems: generateActionItems(callSession),
            followUpDate: calculateFollowUpDate(callSession),
            priority: determinePriority(callSession),
            tags: extractTags(callSession),
            createdAt: callSession.createdAt,
            updatedAt: new Date().toISOString()
          };
          
          therapistNotes.push(therapistNote);
          
        } catch (error) {
          console.error('❌ Error processing call:', callSession.id, error);
        }
        
        // Add small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    
    console.log('✅ Processed calls:', {
      callSessions: callSessions.length,
      appointmentRequests: appointmentRequests.length,
      therapistNotes: therapistNotes.length
    });
    
    return {
      callSessions,
      appointmentRequests,
      therapistNotes
    };
    
  } catch (error) {
    console.error('❌ Error in fetchAndProcessCalls:', error);
    return {
      callSessions: [],
      appointmentRequests: [],
      therapistNotes: []
    };
  }
}

// Helper functions (copied from call-processor.ts)
function generateActionItems(callSession: VapiCallSession): string[] {
  const actionItems: string[] = [];
  
  if (callSession.metadata?.urgencyLevel && callSession.metadata.urgencyLevel >= 4) {
    actionItems.push('Priority scheduling - urgent client needs');
  }
  
  if (callSession.metadata?.keyTopics?.includes('anxiety')) {
    actionItems.push('Prepare anxiety management resources');
  }
  
  if (callSession.metadata?.keyTopics?.includes('couples_therapy')) {
    actionItems.push('Verify insurance coverage for couples therapy');
  }
  
  if (callSession.metadata?.followUpRequired) {
    actionItems.push('Schedule follow-up call with client');
  }
  
  actionItems.push('Review complete call transcript before appointment');
  return actionItems;
}

function calculateFollowUpDate(callSession: VapiCallSession): string {
  const now = new Date();
  const urgency = callSession.metadata?.urgencyLevel || 3;
  const daysToAdd = urgency >= 4 ? 1 : urgency >= 3 ? 2 : 7;
  const followUpDate = new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
  return followUpDate.toISOString();
}

function determinePriority(callSession: VapiCallSession): 'low' | 'medium' | 'high' {
  const urgency = callSession.metadata?.urgencyLevel || 3;
  if (urgency >= 5) return 'high';
  if (urgency >= 3) return 'medium';
  return 'low';
}

function extractTags(callSession: VapiCallSession): string[] {
  const tags: string[] = [];
  
  if (callSession.metadata?.keyTopics) {
    tags.push(...callSession.metadata.keyTopics);
  }
  
  if (callSession.callType) {
    tags.push(callSession.callType);
  }
  
  if (callSession.metadata?.urgencyLevel && callSession.metadata.urgencyLevel >= 4) {
    tags.push('urgent');
  }
  
  tags.push('ai-processed', 'vapi-api');
  return tags;
}
