import { VapiCallSession, VapiTranscriptEntry, AppointmentRequest, TherapistNote } from './types';

// Real call session storage (in-memory for server-side operations)
export let realCallSessions: VapiCallSession[] = [];
export let realTranscripts: VapiTranscriptEntry[] = [];
export let realAppointmentRequests: AppointmentRequest[] = [];
export let realTherapistNotes: TherapistNote[] = [];

// Database functions (only available on server)
let dbModule: any = null;
function getDbModule() {
  if (typeof window === 'undefined' && !dbModule) {
    try {
      dbModule = require('./database');
      console.log('🐘 Database module loaded');
    } catch (error) {
      console.error('Error loading database module:', error);
    }
  }
  return dbModule;
}

// Helper function to save data to database (only works on server-side)
async function saveToDatabase(type: string, data: any) {
  if (typeof window === 'undefined') {
    const db = getDbModule();
    if (db) {
      try {
        switch (type) {
          case 'appointment':
            await db.saveAppointmentRequest(data);
            break;
          case 'note':
            await db.saveTherapistNote(data);
            break;
        }
      } catch (error) {
        console.error(`Error saving ${type} to database:`, error);
      }
    }
  }
}

// AI-powered call summarization using Anthropic Claude
export async function summarizeCallForTherapist(transcript: string, callMetadata: any): Promise<string> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error('❌ ANTHROPIC_API_KEY environment variable is not set');
      return 'Unable to generate summary - API key not configured';
    }
    
    console.log('🤖 Calling Anthropic API for call summarization...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
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
      const errorText = await response.text();
      console.error('❌ Anthropic API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Successfully generated call summary via Anthropic API');
    return data.content[0]?.text || 'Summary generation failed';
    
  } catch (error) {
    console.error('Error generating call summary:', error);
    return 'Unable to generate summary - please review transcript manually';
  }
}

// Extract structured appointment data from transcript using Anthropic Claude
export async function parseAppointmentDetails(transcript: string): Promise<Partial<AppointmentRequest>> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error('❌ ANTHROPIC_API_KEY environment variable is not set');
      return {};
    }
    
    console.log('🤖 Calling Anthropic API for appointment data extraction...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        temperature: 0.1,
        system: `Extract basic appointment information from this therapy call transcript.

        Return ONLY a JSON object with this structure:
        {
          "clientInfo": {
            "fullName": "client name if mentioned",
            "phone": "phone number if mentioned"
          },
          "appointmentDetails": {
            "preferredDates": ["dates mentioned in YYYY-MM-DD format"],
            "preferredTimes": ["times mentioned"],
            "notes": "brief summary of what client wants"
          }
        }

        IMPORTANT: 
        - Today's date is ${new Date().toISOString().split('T')[0]}
        - Convert relative dates like "tomorrow", "next week", "Monday" to actual YYYY-MM-DD dates
        - If no specific date is mentioned but they want to schedule, use tomorrow's date
        - Only extract information that is explicitly mentioned. Use null for missing data.`,
        messages: [
          {
            role: 'user',
            content: `Extract appointment info from this call:\n\n${transcript}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Anthropic API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text;
    
    if (content) {
      try {
        console.log('✅ Successfully extracted appointment details via Anthropic API');
        
        // Extract JSON from the response (handle cases where there's explanatory text after JSON)
        let jsonContent = content.trim();
        
        // Find the first { and last } to extract just the JSON part
        const firstBrace = jsonContent.indexOf('{');
        const lastBrace = jsonContent.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonContent = jsonContent.substring(firstBrace, lastBrace + 1);
        }
        
        return JSON.parse(jsonContent);
      } catch (parseError) {
        console.error('❌ Error parsing appointment details JSON:', parseError);
        console.error('Raw content:', content);
        
        // Try to extract JSON manually as fallback
        try {
          const match = content.match(/\{[\s\S]*\}/);
          if (match) {
            return JSON.parse(match[0]);
          }
        } catch (fallbackError) {
          console.error('❌ Fallback JSON extraction also failed:', fallbackError);
        }
        
        return {};
      }
    }
    
    return {};
    
  } catch (error) {
    console.error('Error extracting appointment details:', error);
    return {};
  }
}

// Helper function to extract client name from transcript (same as in vapi-api.ts)
function extractClientNameFromTranscript(transcript?: string): string | undefined {
  if (!transcript) return undefined;
  
  // Common patterns for name extraction from therapy appointment calls
  const patterns = [
    // "Hi, my name is John Smith" or "My name is Jane Doe"
    /(?:hi|hello),?\s*(?:my\s+name\s+is|i'm|i\s+am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    // "This is John Smith calling" or "John Smith here"
    /(?:this\s+is|it's)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?:\s+calling|\s+here)?/i,
    // "I'm calling for John Smith" or direct name mention
    /(?:i'm\s+calling\s+for|calling\s+for|my\s+name\s+is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    // "Jacob Bilott" at the start of a sentence (as in the example)
    /^([A-Z][a-z]+\s+[A-Z][a-z]+),?\s+(?:a\s+new\s+client|called|is\s+calling)/i,
    // Name followed by common appointment phrases
    /([A-Z][a-z]+\s+[A-Z][a-z]+)(?:,\s*(?:a\s+new\s+client|called|is\s+calling|wants\s+to\s+schedule))/i
  ];
  
  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      // Basic validation - should be 2-4 words, each starting with capital
      const words = name.split(/\s+/);
      if (words.length >= 2 && words.length <= 4 && 
          words.every(word => /^[A-Z][a-z]+$/.test(word))) {
        return name;
      }
    }
  }
  
  return undefined;
}

// Process completed call and generate therapist materials
export async function processCompletedCall(callSession: VapiCallSession & { organizationId?: string }): Promise<void> {
  try {
    console.log('🚀 PROCESSING COMPLETED CALL:', callSession.id);
    console.log('🏢 Organization ID:', callSession.organizationId);
    console.log('📞 Call has transcript:', !!callSession.transcript);
    console.log('📞 Transcript length:', callSession.transcript?.length || 0);
    
    // 0. Extract client name if not already set
    if (!callSession.metadata?.clientName && callSession.transcript) {
      const extractedName = extractClientNameFromTranscript(callSession.transcript);
      if (extractedName) {
        if (!callSession.metadata) {
          callSession.metadata = {};
        }
        callSession.metadata.clientName = extractedName;
        console.log('✅ Extracted client name:', extractedName);
      }
    }
    
    // 1. Generate AI summary for therapist
    if (callSession.transcript) {
      const aiSummary = await summarizeCallForTherapist(
        callSession.transcript, 
        callSession.metadata
      );
      
      // Update the call session with AI-generated summary
      callSession.summary = aiSummary;
    }

    // 2. Extract appointment data and book directly
    if (callSession.transcript) {
      console.log('📝 TRANSCRIPT FOUND - Extracting appointment data...');
      console.log('📄 Transcript preview:', callSession.transcript.substring(0, 200) + '...');
      
      const appointmentData = await parseAppointmentDetails(callSession.transcript);
      
      console.log('🔍 AI EXTRACTION RESULT:', {
        hasClientInfo: !!appointmentData.clientInfo,
        hasAppointmentDetails: !!appointmentData.appointmentDetails,
        clientName: appointmentData.clientInfo?.fullName,
        preferredDates: appointmentData.appointmentDetails?.preferredDates,
        fullExtractedData: appointmentData
      });
      
      // Update client name in metadata if extracted from appointment data
      if (appointmentData.clientInfo?.fullName && !callSession.metadata?.clientName) {
        if (!callSession.metadata) {
          callSession.metadata = {};
        }
        callSession.metadata.clientName = appointmentData.clientInfo.fullName;
        console.log('✅ Set client name from appointment data:', appointmentData.clientInfo.fullName);
      }
      
      // If we have client info and they want to schedule, book it directly
      if (appointmentData.clientInfo?.fullName && appointmentData.appointmentDetails?.preferredDates?.length > 0) {
        console.log('📅 Booking appointment directly for:', appointmentData.clientInfo.fullName);
        console.log('📅 Preferred dates:', appointmentData.appointmentDetails.preferredDates);
        await bookAppointmentDirectly(appointmentData, callSession.organizationId);
      } else {
        console.log('❌ Not enough info to book appointment:', {
          hasName: !!appointmentData.clientInfo?.fullName,
          hasDates: !!appointmentData.appointmentDetails?.preferredDates?.length,
          clientInfo: appointmentData.clientInfo,
          appointmentDetails: appointmentData.appointmentDetails
        });
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
    await saveToDatabase('note', therapistNote);
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

// Test function to verify Anthropic API key is working
export async function testAnthropicAPI(): Promise<{ success: boolean; message: string; error?: any }> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        message: 'ANTHROPIC_API_KEY environment variable is not set'
      };
    }
    
    console.log('🧪 Testing Anthropic API connection...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 50,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: 'Hello, please respond with "API test successful" if you can read this message.'
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Anthropic API error: ${response.status} ${response.statusText}`,
        error: errorText
      };
    }

    const data = await response.json();
    const responseText = data.content[0]?.text || '';
    
    return {
      success: true,
      message: `Anthropic API is working! Response: "${responseText}"`
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Error testing Anthropic API',
      error: error instanceof Error ? error.message : String(error)
    };
  }
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

export function removeCallSessionById(id: string): boolean {
  const initialLength = realCallSessions.length;
  realCallSessions = realCallSessions.filter(session => session.id !== id);
  const removed = realCallSessions.length < initialLength;
  if (removed) {
    console.log('🗑️ Removed call from in-memory storage:', id);
  }
  return removed;
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

// Simple function to book appointments directly
async function bookAppointmentDirectly(appointmentData: any, organizationId?: string): Promise<void> {
  try {
    console.log('🚀 Starting direct appointment booking...');
    const { findAvailableSlotsForOrganization, bookAppointment } = await import('./calendar-service');
    
    const clientInfo = appointmentData.clientInfo;
    const appointmentDetails = appointmentData.appointmentDetails;
    
    console.log('📋 Client info:', clientInfo);
    console.log('📋 Appointment details:', appointmentDetails);
    
    // Get organization ID
    let orgId = organizationId;
    if (!orgId) {
      console.log('🔍 Looking up organization ID...');
      const db = getDbModule();
      if (!db?.pool) {
        console.log('❌ Database not available');
        return;
      }
      const orgResult = await db.pool.query('SELECT id FROM organizations LIMIT 1');
      orgId = orgResult.rows[0]?.id;
      console.log('🏢 Found organization ID:', orgId);
    }
    
    if (!orgId) {
      console.log('❌ No organization ID available');
      return;
    }

    // Try to book on the first preferred date
    const preferredDate = appointmentDetails.preferredDates[0];
    const dateStr = new Date(preferredDate).toISOString().split('T')[0];
    
    console.log('📅 Looking for slots on:', dateStr);
    
    // Get available slots
    const availableSlots = await findAvailableSlotsForOrganization(orgId, dateStr, 60);
    
    console.log('🎯 Found', availableSlots.length, 'available slots');
    
    if (availableSlots.length > 0) {
      const slot = availableSlots[0];
      
      console.log('📝 Booking slot:', slot);
      
      const appointment = await bookAppointment({
        organizationId: orgId,
        appointmentRequestId: null,
        therapistId: slot.therapistId,
        clientName: clientInfo.fullName,
        clientPhone: clientInfo.phone || 'Unknown',
        clientEmail: clientInfo.email,
        appointmentType: 'initial_consultation',
        appointmentDate: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        durationMinutes: 60,
        status: 'scheduled',
        notes: appointmentDetails.notes || 'Booked from call transcript'
      });

      console.log('🎉 SUCCESS! Appointment booked:', {
        appointmentId: appointment.id,
        client: clientInfo.fullName,
        date: slot.date,
        time: slot.startTime,
        therapist: slot.therapistName
      });
    } else {
      console.log('❌ No available slots found for date:', dateStr);
    }
    
  } catch (error) {
    console.error('💥 Error booking appointment:', error);
    console.error('💥 Error stack:', error.stack);
  }
}
