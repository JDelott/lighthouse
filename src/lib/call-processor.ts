import { VapiCallSession, VapiTranscriptEntry, AppointmentRequest, TherapistNote } from './types';

// Real call session storage (replaces dummy data)
export const realCallSessions: VapiCallSession[] = [];
export const realTranscripts: VapiTranscriptEntry[] = [];
export const realAppointmentRequests: AppointmentRequest[] = [];
export const realTherapistNotes: TherapistNote[] = [];

// AI-powered call summarization using Anthropic Claude
export async function summarizeCallForTherapist(transcript: string, callMetadata: any): Promise<string> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        temperature: 0.3,
        system: `You are a clinical assistant helping therapists review AI-assisted appointment scheduling calls. 
        
        Create a concise, professional summary for the therapist that includes:
        1. Client's main concerns/reasons for seeking therapy
        2. Appointment type and urgency level
        3. Key clinical insights or red flags
        4. Insurance/scheduling details
        5. Recommended next steps or follow-up actions
        
        Keep it clinical, objective, and actionable. Focus on what the therapist needs to know.`,
        messages: [
          {
            role: 'user',
            content: `Please summarize this therapy appointment scheduling call:
            
            Transcript: ${transcript}
            
            Call Metadata: ${JSON.stringify(callMetadata, null, 2)}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || 'Summary generation failed';
    
  } catch (error) {
    console.error('Error generating call summary:', error);
    return 'Unable to generate summary - please review transcript manually';
  }
}

// Extract structured appointment data from transcript using Anthropic Claude
export async function parseAppointmentDetails(transcript: string): Promise<Partial<AppointmentRequest>> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 800,
        temperature: 0.1,
        system: `You are a data extraction assistant. Extract structured appointment information from therapy scheduling call transcripts.

        Return a JSON object with this exact structure:
        {
          "clientInfo": {
            "fullName": "extracted name or null",
            "phone": "extracted phone or null", 
            "email": "extracted email or null",
            "dateOfBirth": "extracted DOB or null"
          },
          "appointmentDetails": {
            "type": "initial_consultation|follow_up|couples_therapy|family_therapy|urgent_consultation",
            "urgency": 1-5,
            "preferredDates": ["YYYY-MM-DD"],
            "preferredTimes": ["time strings"],
            "notes": "relevant appointment notes"
          },
          "intakeInfo": {
            "reasonForSeeking": "main reason for therapy",
            "previousTherapy": true/false,
            "currentMedications": "medications or 'None'",
            "insuranceInfo": {
              "provider": "insurance provider or null",
              "memberId": "member ID or null"
            }
          }
        }

        Only extract information that is clearly stated. Use null for missing data.`,
        messages: [
          {
            role: 'user',
            content: `Extract appointment details from this transcript:\n\n${transcript}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text;
    
    if (content) {
      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error('Error parsing appointment details JSON:', parseError);
        return {};
      }
    }
    
    return {};
    
  } catch (error) {
    console.error('Error extracting appointment details:', error);
    return {};
  }
}

// Process completed call and generate therapist materials
export async function processCompletedCall(callSession: VapiCallSession): Promise<void> {
  try {
    console.log('Processing completed call:', callSession.id);
    
    // 1. Generate AI summary for therapist
    if (callSession.transcript) {
      const aiSummary = await summarizeCallForTherapist(
        callSession.transcript, 
        callSession.metadata
      );
      
      // Update the call session with AI-generated summary
      callSession.summary = aiSummary;
    }

    // 2. Extract structured appointment data
    if (callSession.transcript) {
      const appointmentData = await parseAppointmentDetails(callSession.transcript);
      
      if (appointmentData.clientInfo || appointmentData.appointmentDetails) {
        // Create appointment request
        const appointmentRequest: AppointmentRequest = {
          id: `appt-req-${Date.now()}`,
          callSessionId: callSession.id,
          clientInfo: appointmentData.clientInfo || {},
          appointmentDetails: appointmentData.appointmentDetails || {},
          intakeInfo: appointmentData.intakeInfo || {},
          status: 'pending_review',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        realAppointmentRequests.push(appointmentRequest);
        console.log('Created appointment request:', appointmentRequest.id);
      }
    }

    // 3. Generate therapist note with action items
    const therapistNote: TherapistNote = {
      id: `note-${Date.now()}`,
      callSessionId: callSession.id,
      therapistId: 'prov-001', // Default therapist for now
      note: callSession.summary || 'Call completed - review transcript for details',
      actionItems: generateActionItems(callSession),
      followUpDate: calculateFollowUpDate(callSession),
      priority: determinePriority(callSession),
      tags: extractTags(callSession),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    realTherapistNotes.push(therapistNote);
    console.log('Created therapist note:', therapistNote.id);
    
    // 4. Update call session status
    callSession.updatedAt = new Date().toISOString();
    
  } catch (error) {
    console.error('Error processing completed call:', error);
  }
}

// Generate action items based on call content
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
  
  if (!callSession.metadata?.insuranceVerified) {
    actionItems.push('Verify insurance coverage and benefits');
  }
  
  // Always add basic review action
  actionItems.push('Review complete call transcript before appointment');
  
  return actionItems;
}

// Calculate appropriate follow-up date
function calculateFollowUpDate(callSession: VapiCallSession): string {
  const now = new Date();
  const urgency = callSession.metadata?.urgencyLevel || 3;
  
  // More urgent = sooner follow-up
  const daysToAdd = urgency >= 4 ? 1 : urgency >= 3 ? 2 : 7;
  
  const followUpDate = new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
  return followUpDate.toISOString();
}

// Determine note priority based on call content
function determinePriority(callSession: VapiCallSession): 'low' | 'medium' | 'high' {
  const urgency = callSession.metadata?.urgencyLevel || 3;
  
  if (urgency >= 5) return 'high';
  if (urgency >= 3) return 'medium';
  return 'low';
}

// Extract relevant tags from call
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
  
  tags.push('ai-processed');
  
  return tags;
}

// Utility functions to replace dummy data access
export function getAllCallSessions(): VapiCallSession[] {
  return [...realCallSessions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getCallSessionById(id: string): VapiCallSession | undefined {
  return realCallSessions.find(session => session.id === id);
}

export function getTranscriptsByCallId(callSessionId: string): VapiTranscriptEntry[] {
  return realTranscripts.filter(entry => entry.callSessionId === callSessionId);
}

export function getAppointmentRequests(): AppointmentRequest[] {
  return [...realAppointmentRequests].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getTherapistNotes(): TherapistNote[] {
  return [...realTherapistNotes].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
