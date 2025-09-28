import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { findAvailableSlotsForOrganization, getTherapists } from '@/lib/calendar-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD
    const duration = parseInt(searchParams.get('duration') || '60');
    const therapistId = searchParams.get('therapistId'); // Optional - filter by specific therapist

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    // Don't allow booking in the past
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      return NextResponse.json({ error: 'Cannot book appointments in the past' }, { status: 400 });
    }

    console.log(`🗓️ Getting availability for org ${session.user.organizationId} on ${date}`);

    let availableSlots;
    
    if (therapistId) {
      // Get slots for specific therapist
      const { findAvailableSlots } = await import('@/lib/calendar-service');
      availableSlots = await findAvailableSlots(therapistId, date, duration);
    } else {
      // Get slots for all therapists in organization
      availableSlots = await findAvailableSlotsForOrganization(
        session.user.organizationId, 
        date, 
        duration
      );
    }

    // Get therapist info for context
    const therapists = await getTherapists(session.user.organizationId);

    return NextResponse.json({ 
      success: true, 
      data: {
        date,
        duration,
        availableSlots,
        totalSlots: availableSlots.length,
        therapists: therapists.map(t => ({ id: t.id, name: t.name }))
      }
    });

  } catch (error) {
    console.error('❌ Error getting availability:', error);
    return NextResponse.json({ 
      error: 'Failed to get availability',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
