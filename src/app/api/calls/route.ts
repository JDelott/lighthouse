import { NextRequest, NextResponse } from 'next/server';
import { 
  getCallSessions,
  getAppointmentRequests, 
  getTherapistNotes,
  testConnection
} from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🐘 Loading calls from PostgreSQL database...');
    
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    
    const callSessions = await getCallSessions();
    const appointmentRequests = await getAppointmentRequests();
    const therapistNotes = await getTherapistNotes();
    
    return NextResponse.json({
      success: true,
      data: {
        callSessions,
        appointmentRequests,
        therapistNotes,
        counts: {
          callSessions: callSessions.length,
          appointmentRequests: appointmentRequests.length,
          therapistNotes: therapistNotes.length
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error loading calls from database:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to load calls from database',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
