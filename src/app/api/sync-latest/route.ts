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

    console.log('🔄 Syncing latest call from Vapi API...');

    // Fetch all calls from Vapi
    const vapiCalls = await fetchVapiCalls();
    
    if (vapiCalls.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No calls found in Vapi',
        data: { callCount: 0 }
      });
    }

    // Get the most recent call
    const latestCall = vapiCalls[0]; // They should be sorted by date already
    console.log('📞 Latest call found:', {
      id: latestCall.id,
      phone: latestCall.customer?.number,
      status: latestCall.status,
      createdAt: latestCall.createdAt
    });

    // Convert to our format
    const callSession = convertVapiCallToSession(latestCall);

    // Save to local database with user's organization
    await saveCallSession(callSession, session.user.organizationId);

    console.log('✅ Latest call synced to local database:');
    console.log('   Call ID:', callSession.id);
    console.log('   Phone:', callSession.clientPhone);
    console.log('   Status:', callSession.status);
    console.log('   Organization:', session.user.organizationId);

    // NEW: Process completed calls for appointment booking
    if (callSession.status === 'completed' && callSession.transcript) {
      console.log('🤖 Processing completed call for appointments...');
      const callSessionWithOrg = { ...callSession, organizationId: session.user.organizationId };
      await processCompletedCall(callSessionWithOrg);
      console.log('✅ Appointment processing completed');
    } else if (callSession.status === 'completed') {
      console.log('⚠️ Call completed but no transcript available');
    } else {
      console.log('ℹ️ Call not yet completed, skipping appointment processing');
    }

    return NextResponse.json({
      success: true,
      message: 'Latest call synced successfully',
      data: {
        callId: callSession.id,
        clientPhone: callSession.clientPhone,
        status: callSession.status,
        organizationId: session.user.organizationId,
        isNewCall: true // For now, assume it's new
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
