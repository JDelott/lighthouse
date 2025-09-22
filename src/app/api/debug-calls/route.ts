import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllCallSessions, 
  getAppointmentRequests, 
  getTherapistNotes,
  realCallSessions,
  realTranscripts,
  realAppointmentRequests,
  realTherapistNotes
} from '@/lib/call-processor';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Checking all call data...');
    
    const allCallSessions = getAllCallSessions();
    const appointmentRequests = getAppointmentRequests();
    const therapistNotes = getTherapistNotes();
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      callSessions: {
        count: allCallSessions.length,
        data: allCallSessions
      },
      transcripts: {
        count: realTranscripts.length,
        data: realTranscripts
      },
      appointmentRequests: {
        count: appointmentRequests.length,
        data: appointmentRequests
      },
      therapistNotes: {
        count: therapistNotes.length,
        data: therapistNotes
      },
      rawArrays: {
        realCallSessionsCount: realCallSessions.length,
        realTranscriptsCount: realTranscripts.length,
        realAppointmentRequestsCount: realAppointmentRequests.length,
        realTherapistNotesCount: realTherapistNotes.length
      }
    };
    
    console.log('📊 Debug Info:', debugInfo);
    
    return NextResponse.json({
      success: true,
      message: 'Debug information retrieved',
      data: debugInfo
    });
    
  } catch (error) {
    console.error('❌ Error getting debug info:', error);
    return NextResponse.json({
      success: false,
      message: 'Error retrieving debug information',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
