import { NextRequest, NextResponse } from 'next/server';
import { getAllCallSessions, getCallSessionById } from '@/lib/call-processor';

// GET /api/vapi/calls - Retrieve call sessions with filtering
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as 'in-progress' | 'completed' | 'failed' | 'cancelled' | null;
    const patientId = url.searchParams.get('patientId');
    const limit = url.searchParams.get('limit');
    const callId = url.searchParams.get('callId');

    // Get real call sessions only (no dummy data)
    let callSessions = getAllCallSessions();

    // Filter by specific call ID
    if (callId) {
      const session = getCallSessionById(callId);
      return NextResponse.json({
        success: true,
        data: session ? [session] : [],
        total: session ? 1 : 0,
        source: 'real'
      });
    }

    // Filter by status
    if (status && ['in-progress', 'completed', 'failed', 'cancelled'].includes(status)) {
      callSessions = callSessions.filter(session => session.status === status);
    }

    // Filter by patient
    if (patientId) {
      callSessions = callSessions.filter(session => session.patientId === patientId);
    }

    // Apply limit
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        callSessions = callSessions.slice(0, limitNum);
      }
    }

    // Sort by most recent first
    callSessions = callSessions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: callSessions,
      total: callSessions.length,
      source: 'real',
      filters: {
        status,
        patientId,
        limit: limit ? parseInt(limit) : undefined
      }
    });

  } catch (error) {
    console.error('Error fetching Vapi call sessions:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch call sessions' 
      },
      { status: 500 }
    );
  }
}
