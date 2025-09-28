import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { findAvailableSlotsForOrganization, getAppointments, getTherapists } from '@/lib/calendar-service';

// GET /api/calendar/slots - Get all slots (available and booked) for a date
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD
    const duration = parseInt(searchParams.get('duration') || '60');

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    console.log(`🗓️ Getting all slots for org ${session.user.organizationId} on ${date}`);

    // Get available slots
    const availableSlots = await findAvailableSlotsForOrganization(
      session.user.organizationId, 
      date, 
      duration
    );

    // Get booked appointments for this date
    const appointments = await getAppointments(session.user.organizationId, date, date);
    
    // Get therapist info
    const therapists = await getTherapists(session.user.organizationId);
    const therapistMap = new Map(therapists.map(t => [t.id, t.name]));

    // Convert appointments to booked slots format
    const bookedSlots = appointments.map(appointment => ({
      date: appointment.appointmentDate,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      therapistId: appointment.therapistId,
      therapistName: therapistMap.get(appointment.therapistId) || 'Unknown',
      durationMinutes: appointment.durationMinutes,
      isBooked: true,
      appointmentId: appointment.id,
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone,
      appointmentType: appointment.appointmentType,
      status: appointment.status
    }));

    // Mark available slots as not booked
    const availableSlotsWithStatus = availableSlots.map(slot => ({
      ...slot,
      isBooked: false
    }));

    // Combine and sort all slots by time
    const allSlots = [...availableSlotsWithStatus, ...bookedSlots].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        date,
        duration,
        allSlots,
        availableSlots: availableSlotsWithStatus,
        bookedSlots,
        totalSlots: allSlots.length,
        availableCount: availableSlotsWithStatus.length,
        bookedCount: bookedSlots.length,
        therapists: therapists.map(t => ({ id: t.id, name: t.name }))
      }
    });

  } catch (error) {
    console.error('❌ Error getting slots:', error);
    return NextResponse.json({ 
      error: 'Failed to get slots',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
