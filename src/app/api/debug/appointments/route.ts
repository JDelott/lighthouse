import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAppointments } from '@/lib/calendar-service';
import { getAppointmentRequests } from '@/lib/call-processor';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Debug: Checking appointments and requests...');

    // Get appointment requests (from call processing)
    const appointmentRequests = getAppointmentRequests();
    console.log('📋 Found appointment requests:', appointmentRequests.length);

    // Get confirmed appointments (from calendar)
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const appointments = await getAppointments(session.user.organizationId, startDate, endDate);
    console.log('📅 Found confirmed appointments:', appointments.length);

    return NextResponse.json({ 
      success: true, 
      data: {
        organizationId: session.user.organizationId,
        appointmentRequests: appointmentRequests.map(req => ({
          id: req.id,
          clientName: req.clientInfo?.fullName || 'Unknown',
          status: req.status,
          preferredDates: req.appointmentDetails?.preferredDates || [],
          createdAt: req.createdAt
        })),
        confirmedAppointments: appointments.map(appt => ({
          id: appt.id,
          clientName: appt.clientName,
          date: appt.appointmentDate,
          time: appt.startTime,
          status: appt.status,
          createdAt: appt.createdAt
        })),
        summary: {
          totalRequests: appointmentRequests.length,
          totalConfirmed: appointments.length,
          pendingReview: appointmentRequests.filter(r => r.status === 'pending_review').length,
          scheduled: appointmentRequests.filter(r => r.status === 'scheduled').length
        }
      }
    });

  } catch (error) {
    console.error('❌ Error in debug appointments:', error);
    return NextResponse.json({ 
      error: 'Failed to debug appointments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
