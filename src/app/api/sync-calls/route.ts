import { NextRequest, NextResponse } from 'next/server';
import { fetchAndProcessCalls } from '@/lib/vapi-api';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Syncing calls from Vapi API...');
    
    const result = await fetchAndProcessCalls();
    
    return NextResponse.json({
      success: true,
      message: 'Calls synced successfully from Vapi API',
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
      message: 'Failed to sync calls from Vapi API',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Same as GET for now - just sync calls
  return GET(request);
}
