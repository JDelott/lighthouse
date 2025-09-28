import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { findAvailableSlotsForOrganization, getAppointments, getTherapists } from '@/lib/calendar-service';

// Helper function to convert "10:00 AM" to "10:00" 24-hour format
function convertTo24Hour(timeStr: string): string {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return timeStr; // Return as-is if can't parse
  
  let [, hours, minutes, ampm] = match;
  let hour = parseInt(hours);
  
  if (ampm.toUpperCase() === 'PM' && hour !== 12) {
    hour += 12;
  } else if (ampm.toUpperCase() === 'AM' && hour === 12) {
    hour = 0;
  }
  
  return `${hour.toString().padStart(2, '0')}:${minutes}`;
}

// Helper function to add minutes to time string
function addMinutes(timeStr: string, minutes: number): string {
  const [hours, mins] = timeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
}

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

    // Get booked appointments for this date (temporarily disabled to focus on appointment requests)
    // const appointments = await getAppointments(session.user.organizationId, date, date);
    const appointments: any[] = []; // Disable dummy appointments for now
    
    // Get appointment requests that have preferred dates for this date
    const { getAppointmentRequests } = await import('@/lib/database');
    const appointmentRequests = await getAppointmentRequests(session.user.organizationId);
    const requestsForDate = appointmentRequests.filter(req => 
      // Include pending, scheduled, and confirmed follow-ups, but exclude cancelled
      (req.status === 'info_gathered' || req.status === 'pending_therapist_review' || req.status === 'follow_up_scheduled' || req.status === 'appointment_booked') && 
      req.status !== 'cancelled' &&
      req.appointmentDetails?.preferredDates?.includes(date)
    );
    
    
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

    // Convert appointment requests to pending follow-up slots
    const pendingSlots = requestsForDate.flatMap(request => {
      const preferredTimes = request.appointmentDetails?.preferredTimes || [];
      const defaultTherapist = therapists[0]; // Use first therapist as default
      
      return preferredTimes.map(timeStr => {
        // Convert "10:00 AM" to "10:00" format
        const time24 = convertTo24Hour(timeStr);
        const endTime = addMinutes(time24, request.appointmentDetails?.duration || 60);
        
        return {
          date: date,
          startTime: time24,
          endTime: endTime,
          therapistId: defaultTherapist?.id || 'default',
          therapistName: defaultTherapist?.name || 'Available Therapist',
          durationMinutes: request.appointmentDetails?.duration || 60,
          isBooked: true, // Mark as booked so it shows with action buttons
          appointmentRequestId: request.id,
          clientName: request.clientInfo?.fullName || 'Pending Client',
          clientPhone: request.clientInfo?.phone || '',
          appointmentType: request.appointmentDetails?.type || 'follow_up',
          status: request.status // Use actual status from database
        };
      });
    });

    // Filter out available slots that conflict with pending appointment requests
    const pendingTimes = new Set(pendingSlots.map(slot => slot.startTime));
    const availableSlotsFiltered = availableSlots.filter(slot => !pendingTimes.has(slot.startTime));
    
    // Mark available slots as not booked
    const availableSlotsWithStatus = availableSlotsFiltered.map(slot => ({
      ...slot,
      isBooked: false
    }));

    // Combine all slots and remove duplicates based on startTime and therapistId
    const combinedSlots = [...availableSlotsWithStatus, ...bookedSlots, ...pendingSlots];
    
    // Deduplicate slots - prefer booked/pending over available for same time slot
    const slotMap = new Map();
    combinedSlots.forEach(slot => {
      const key = `${slot.therapistId}-${slot.startTime}`;
      const existing = slotMap.get(key);
      
      if (!existing) {
        slotMap.set(key, slot);
      } else {
        // Prefer booked/pending slots over available slots
        if (slot.isBooked && !existing.isBooked) {
          slotMap.set(key, slot);
        }
        // If both are booked, keep the first one (avoid duplicates)
      }
    });
    
    // Convert back to array and sort
    const allSlots = Array.from(slotMap.values()).sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });

    console.log(`📊 Slots summary for ${date}:`, {
      available: availableSlotsWithStatus.length,
      booked: bookedSlots.length,
      pending: pendingSlots.length,
      total: allSlots.length
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        date,
        duration,
        allSlots,
        availableSlots: availableSlotsWithStatus,
        bookedSlots,
        pendingSlots,
        totalSlots: allSlots.length,
        availableCount: availableSlotsWithStatus.length,
        bookedCount: bookedSlots.length,
        pendingCount: pendingSlots.length,
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
