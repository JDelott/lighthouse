import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAppointments } from '@/lib/calendar-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`📅 Getting appointments for org ${session.user.organizationId} from ${startDate} to ${endDate}`);

    const appointments = await getAppointments(session.user.organizationId, startDate, endDate);

    return NextResponse.json({ 
      success: true, 
      data: {
        appointments,
        count: appointments.length,
        dateRange: { startDate, endDate }
      }
    });

  } catch (error) {
    console.error('❌ Error getting appointments:', error);
    return NextResponse.json({ 
      error: 'Failed to get appointments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
