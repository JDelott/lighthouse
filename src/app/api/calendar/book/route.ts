import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { bookAppointment, timeToMinutes, minutesToTime, updateAppointmentRequestStatus } from '@/lib/calendar-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      appointmentRequestId,
      therapistId,
      clientName,
      clientPhone,
      clientEmail,
      appointmentType,
      appointmentDate,
      startTime,
      durationMinutes,
      notes
    } = body;

    // Validate required fields
    if (!therapistId || !clientName || !clientPhone || !appointmentType || !appointmentDate || !startTime) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['therapistId', 'clientName', 'clientPhone', 'appointmentType', 'appointmentDate', 'startTime']
      }, { status: 400 });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(appointmentDate)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    // Validate time format
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(startTime)) {
      return NextResponse.json({ error: 'Invalid time format. Use HH:MM' }, { status: 400 });
    }

    // Don't allow booking in the past
    const today = new Date().toISOString().split('T')[0];
    if (appointmentDate < today) {
      return NextResponse.json({ error: 'Cannot book appointments in the past' }, { status: 400 });
    }

    // Calculate end time
    const duration = durationMinutes || 60;
    const startMinutes = timeToMinutes(startTime);
    const endTime = minutesToTime(startMinutes + duration);

    console.log(`📅 Booking appointment for ${clientName} on ${appointmentDate} at ${startTime}-${endTime}`);

    // TODO: Check if slot is still available before booking
    // This prevents double-booking but requires additional validation

    const appointment = await bookAppointment({
      organizationId: session.user.organizationId,
      appointmentRequestId,
      therapistId,
      clientName,
      clientPhone,
      clientEmail,
      appointmentType,
      appointmentDate,
      startTime,
      endTime,
      durationMinutes: duration,
      status: 'scheduled',
      notes
    });

    // Update the appointment request status if provided
    if (appointmentRequestId) {
      try {
        await updateAppointmentRequestStatus(appointmentRequestId, 'scheduled', appointment.id);
      } catch (error) {
        console.warn('⚠️ Failed to update appointment request status:', error);
        // Don't fail the booking if we can't update the request
      }
    }

    console.log(`✅ Successfully booked appointment ${appointment.id}`);

    return NextResponse.json({ 
      success: true, 
      data: appointment,
      message: `Appointment scheduled for ${appointmentDate} at ${startTime}`
    });

  } catch (error) {
    console.error('❌ Error booking appointment:', error);
    
    // Check for common database errors
    if (error instanceof Error) {
      if (error.message.includes('foreign key')) {
        return NextResponse.json({ 
          error: 'Invalid therapist or organization ID' 
        }, { status: 400 });
      }
      if (error.message.includes('unique constraint')) {
        return NextResponse.json({ 
          error: 'This appointment slot may already be booked' 
        }, { status: 409 });
      }
    }

    return NextResponse.json({ 
      error: 'Failed to book appointment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
