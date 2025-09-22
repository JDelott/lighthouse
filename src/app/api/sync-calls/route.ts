import { NextRequest, NextResponse } from 'next/server';
import { fetchAndProcessCalls } from '@/lib/vapi-api';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Syncing calls from Vapi API...');
    
    const result = await fetchAndProcessCalls();
    
    // Save to database
    if (typeof window === 'undefined') {
      console.log('💾 Saving to database...');
      const { saveCallSession, saveAppointmentRequest, saveTherapistNote } = await import('@/lib/database');
      
      // Save all call sessions
      for (const callSession of result.callSessions) {
        await saveCallSession(callSession);
      }
      
      // Save all appointment requests
      for (const appointmentRequest of result.appointmentRequests) {
        await saveAppointmentRequest(appointmentRequest);
      }
      
      // Save all therapist notes
      for (const therapistNote of result.therapistNotes) {
        await saveTherapistNote(therapistNote);
      }
      
      console.log('✅ All data saved to database!');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Calls synced and processed successfully',
      data: {
        callSessions: result.callSessions.length,
        appointmentRequests: result.appointmentRequests.length,
        therapistNotes: result.therapistNotes.length,
        calls: result.callSessions,
        appointments: result.appointmentRequests,
        notes: result.therapistNotes
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error syncing calls:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to sync and process calls',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Same as GET for now - just sync calls
  return GET(request);
}
