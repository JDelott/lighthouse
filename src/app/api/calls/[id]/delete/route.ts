import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { pool } from '@/lib/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user session to ensure they're authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.organizationId) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
      }, { status: 401 });
    }

    const callId = params.id;
    
    if (!callId) {
      return NextResponse.json({
        success: false,
        message: 'Call ID is required',
      }, { status: 400 });
    }

    console.log('🗑️ Deleting call:', callId, 'for org:', session.user.organizationId);
    
    const client = await pool.connect();
    try {
      // First, check if the call exists and belongs to the user's organization
      const checkResult = await client.query(
        'SELECT id, call_id, client_phone FROM call_sessions WHERE id = $1 AND organization_id = $2',
        [callId, session.user.organizationId]
      );
      
      if (checkResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'Call not found or access denied',
        }, { status: 404 });
      }
      
      const callData = checkResult.rows[0];
      console.log('📞 Found call to delete:', callData.call_id, 'Phone:', callData.client_phone);
      
      // Delete related transcripts first (foreign key constraint)
      const transcriptDeleteResult = await client.query(
        'DELETE FROM transcripts WHERE call_session_id = $1',
        [callId]
      );
      console.log('📝 Deleted transcripts:', transcriptDeleteResult.rowCount);
      
      // Delete related appointment requests
      const appointmentDeleteResult = await client.query(
        'DELETE FROM appointment_requests WHERE call_session_id = $1',
        [callId]
      );
      console.log('📅 Deleted appointment requests:', appointmentDeleteResult.rowCount);
      
      // Delete related therapist notes
      const notesDeleteResult = await client.query(
        'DELETE FROM therapist_notes WHERE call_session_id = $1',
        [callId]
      );
      console.log('📋 Deleted therapist notes:', notesDeleteResult.rowCount);
      
      // Finally, delete the call session
      const callDeleteResult = await client.query(
        'DELETE FROM call_sessions WHERE id = $1 AND organization_id = $2',
        [callId, session.user.organizationId]
      );
      
      if (callDeleteResult.rowCount === 0) {
        return NextResponse.json({
          success: false,
          message: 'Failed to delete call',
        }, { status: 500 });
      }
      
      console.log('✅ Call deleted successfully:', callId);
      
      // Get updated call count
      const countResult = await client.query(
        'SELECT COUNT(*) as count FROM call_sessions WHERE organization_id = $1',
        [session.user.organizationId]
      );
      const remainingCalls = parseInt(countResult.rows[0].count);
      
      return NextResponse.json({
        success: true,
        message: 'Call deleted successfully',
        data: {
          deletedCallId: callId,
          deletedCallData: {
            callId: callData.call_id,
            clientPhone: callData.client_phone
          },
          remainingCalls,
          deletedRelatedRecords: {
            transcripts: transcriptDeleteResult.rowCount,
            appointmentRequests: appointmentDeleteResult.rowCount,
            therapistNotes: notesDeleteResult.rowCount
          }
        },
        timestamp: new Date().toISOString()
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error deleting call:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete call',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
