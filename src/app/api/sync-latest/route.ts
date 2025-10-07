import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { fetchVapiCalls, convertVapiCallToSession } from '@/lib/vapi-api';
import { saveCallSession } from '@/lib/database';
import { processCompletedCall } from '@/lib/call-processor';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.organizationId) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
      }, { status: 401 });
    }

    console.log('🔄 Syncing all recent calls from Vapi API...');

    // Fetch all calls from Vapi
    const vapiCalls = await fetchVapiCalls();
    
    if (vapiCalls.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No calls found in Vapi',
        data: { callCount: 0 }
      });
    }

    console.log(`📞 Found ${vapiCalls.length} calls from Vapi API`);

    // Get existing call sessions to avoid duplicates
    const { getCallSessions, getAppointmentRequests } = await import('@/lib/database');
    const existingCallSessions = await getCallSessions(session.user.organizationId);
    const existingCallIds = new Set(existingCallSessions.map(call => call.callId));
    const existingRequests = await getAppointmentRequests(session.user.organizationId);

    let processedCount = 0;
    let newAppointmentRequests = 0;

    // Process all calls, focusing on completed ones with transcripts
    for (const vapiCall of vapiCalls) {
      try {
        // Convert to our format
        const callSession = convertVapiCallToSession(vapiCall);

        // Save to database if not already exists
        if (!existingCallIds.has(vapiCall.id)) {
          await saveCallSession(callSession, session.user.organizationId);
          processedCount++;
          console.log(`✅ Saved new call: ${callSession.id} (${callSession.status})`);
        }

        // Process completed calls with transcripts for appointments
        if (callSession.status === 'completed' && callSession.transcript) {
          const existingRequest = existingRequests.find(req => req.callSessionId === callSession.id);
          
          if (!existingRequest) {
            console.log(`🤖 Processing completed call for appointments: ${callSession.id}`);
            const callSessionWithOrg = { ...callSession, organizationId: session.user.organizationId };
            await processCompletedCall(callSessionWithOrg);
            newAppointmentRequests++;
            console.log(`✅ Created appointment request for call: ${callSession.id}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing call ${vapiCall.id}:`, error);
      }
    }

    const latestCall = vapiCalls[0];
    console.log('📞 Latest call:', {
      id: latestCall.id,
      phone: latestCall.customer?.number,
      status: latestCall.status,
      createdAt: latestCall.createdAt
    });

    return NextResponse.json({
      success: true,
      message: `Synced ${processedCount} new calls, created ${newAppointmentRequests} appointment requests`,
      data: {
        totalCalls: vapiCalls.length,
        newCalls: processedCount,
        newAppointmentRequests: newAppointmentRequests,
        latestCallId: latestCall.id,
        latestCallStatus: latestCall.status,
        organizationId: session.user.organizationId
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Sync failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to sync latest call',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
