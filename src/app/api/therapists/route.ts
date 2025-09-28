import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTherapists, createDefaultTherapist } from '@/lib/calendar-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const therapists = await getTherapists(session.user.organizationId);

    return NextResponse.json({ 
      success: true, 
      data: therapists
    });

  } catch (error) {
    console.error('❌ Error getting therapists:', error);
    return NextResponse.json({ 
      error: 'Failed to get therapists',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Name is required and must be a non-empty string' 
      }, { status: 400 });
    }

    const therapist = await createDefaultTherapist(
      session.user.organizationId, 
      name.trim()
    );

    console.log(`✅ Created therapist: ${therapist.name} for org: ${session.user.organizationId}`);

    return NextResponse.json({ 
      success: true, 
      data: therapist,
      message: `Therapist ${therapist.name} created successfully`
    });

  } catch (error) {
    console.error('❌ Error creating therapist:', error);
    return NextResponse.json({ 
      error: 'Failed to create therapist',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
