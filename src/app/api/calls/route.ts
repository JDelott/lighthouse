import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { 
  getCallSessions,
  getAppointmentRequests, 
  getTherapistNotes,
  testConnection
} from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get user session to filter by organization
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.organizationId) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
      }, { status: 401 });
    }

    console.log('🐘 Loading calls from PostgreSQL database for org:', session.user.organizationId);
    
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    
    // Get calls filtered by organization
    const callSessions = await getCallSessions(session.user.organizationId);
    const appointmentRequests = await getAppointmentRequests(session.user.organizationId);
    const therapistNotes = await getTherapistNotes(session.user.organizationId);
    
    console.log('📊 API /calls response data:', {
      callSessions: callSessions.length,
      appointmentRequests: appointmentRequests.length,
      therapistNotes: therapistNotes.length,
      appointmentRequestsPreview: appointmentRequests.slice(0, 2)
    });
    
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
