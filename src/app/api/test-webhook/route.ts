import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { saveCallSession, pool } from '@/lib/database';
import { VapiCallSession } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test webhook called');
    
    // Get the current user's session
    const session = await getServerSession(authOptions);
    let organizationId = null;
    
    if (session?.user.organizationId) {
      organizationId = session.user.organizationId;
      console.log('🏢 Using user organization:', organizationId);
    } else {
      // Fallback to first organization
      const client = await pool.connect();
      try {
        const orgResult = await client.query('SELECT id FROM organizations LIMIT 1');
        organizationId = orgResult.rows[0]?.id;
        console.log('🏢 Using fallback organization:', organizationId);
      } finally {
        client.release();
      }
    }
    
    if (!organizationId) {
      throw new Error('No organization found');
    }
    
    // Create a test call session
    const testCall: VapiCallSession = {
      id: `test-call-${Date.now()}`,
      callId: `test-${Date.now()}`,
      clientPhone: '(555) 123-4567',
      status: 'completed',
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      duration: 120, // 2 minutes
      transcript: 'Test call: Hello, I would like to schedule an appointment with Dr. Smith for next week. I have anxiety and would like to discuss therapy options.',
      summary: 'Patient called to schedule appointment for anxiety treatment.',
      assistantId: 'test-assistant',
      callType: 'appointment_request',
      metadata: {
        urgencyLevel: 2,
        schedulingStatus: 'pending_confirmation'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to database with specific organization
    await saveCallSession(testCall, organizationId);
    
    console.log('✅ Test call saved successfully:', testCall.id, 'for org:', organizationId);
    
    return NextResponse.json({
      success: true,
      message: 'Test call created successfully',
      callId: testCall.id,
      organizationId,
      userSession: !!session
    });
    
  } catch (error) {
    console.error('❌ Error in test webhook:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
