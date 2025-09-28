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
      console.log('🔍 Attempting to confirm appointment with slotId:', slotId);
      
      // Check both appointment_requests and appointments tables
      const appointmentRequestQuery = await client.query(`
        SELECT id, call_session_id, status 
        FROM appointment_requests 
        WHERE id = $1 OR call_session_id = $1
      `, [slotId]);
      
      const appointmentQuery = await client.query(`
        SELECT id, status 
        FROM appointments 
        WHERE id = $1
      `, [slotId]);
      
      console.log('🔍 Found matching records:', {
        appointmentRequests: appointmentRequestQuery.rows,
        appointments: appointmentQuery.rows
      });
      
      let updateCount = 0;
      
      // Update appointment request status if found
      if (appointmentRequestQuery.rows.length > 0) {
        const result = await client.query(`
          UPDATE appointment_requests 
          SET status = 'appointment_booked',
              updated_at = NOW()
          WHERE id = $1 OR call_session_id = $1
        `, [slotId]);
        updateCount += result.rowCount || 0;
      }
      
      // Update appointment status if found
      if (appointmentQuery.rows.length > 0) {
        const result = await client.query(`
          UPDATE appointments 
          SET status = 'confirmed',
              updated_at = NOW()
          WHERE id = $1
        `, [slotId]);
        updateCount += result.rowCount || 0;
      }

      console.log('✅ Update result:', { slotId, totalUpdated: updateCount });

      return NextResponse.json({ 
        success: true, 
        message: 'Appointment confirmed successfully',
        slotId 
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error confirming appointment:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to confirm appointment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
