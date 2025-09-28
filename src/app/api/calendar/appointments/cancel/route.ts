import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { slotId } = await request.json();
    
    if (!slotId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Slot ID is required' 
      }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      // Update appointment request status to cancelled
      const result = await client.query(`
        UPDATE appointment_requests 
        SET status = 'cancelled',
            updated_at = NOW()
        WHERE id = $1 OR call_session_id = $1
      `, [slotId]);

      // Also try to delete/cancel any actual appointments (if appointments table exists)
      await client.query(`
        UPDATE appointments 
        SET status = 'cancelled',
            updated_at = NOW()
        WHERE id = $1 OR appointment_request_id = $1
      `, [slotId]).catch(err => {
        // Ignore if appointments table doesn't exist
        console.log('Note: appointments table may not exist:', err.message);
      });

      // Optionally, we could delete the appointment entirely
      // await client.query(`DELETE FROM appointments WHERE id = $1 OR "appointmentRequestId" = $1`, [slotId]);

      console.log('❌ Appointment cancelled:', { slotId, rowCount: result.rowCount });

      return NextResponse.json({ 
        success: true, 
        message: 'Appointment cancelled successfully',
        slotId 
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error cancelling appointment:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to cancel appointment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
