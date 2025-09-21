import { NextRequest, NextResponse } from 'next/server';
import { dummyReferrals, dummyPatients, dummyProviders, findReferralById, findPatientById, findProviderById } from '@/lib/dummy-data';
import { referralStatusSchema } from '@/lib/validation';

// GET /api/referrals/[id] - Get specific referral
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const referralId = params.id;
    const referral = findReferralById(referralId);

    if (!referral) {
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      );
    }

    // Enrich with patient and provider information
    const patient = findPatientById(referral.patientId);
    const provider = referral.providerId ? findProviderById(referral.providerId) : null;

    const enrichedReferral = {
      ...referral,
      patient: patient ? {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        insuranceProvider: patient.insuranceProvider,
        insuranceId: patient.insuranceId,
        emergencyContact: patient.emergencyContact
      } : null,
      provider: provider ? {
        id: provider.id,
        name: provider.name,
        title: provider.title,
        specialties: provider.specialties,
        phone: provider.phone,
        email: provider.email,
        address: provider.address
      } : null
    };

    return NextResponse.json({ referral: enrichedReferral });

  } catch (error) {
    console.error('Error fetching referral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/referrals/[id] - Update referral status and details
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const referralId = params.id;
    const body = await request.json();

    // Find the referral
    const referralIndex = dummyReferrals.findIndex(r => r.id === referralId);
    if (referralIndex === -1) {
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      );
    }

    // Validate the update data
    const validationResult = referralStatusSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;
    const currentReferral = dummyReferrals[referralIndex];

    // Update the referral
    const updatedReferral = {
      ...currentReferral,
      status: updateData.status,
      providerId: updateData.providerId || currentReferral.providerId,
      notes: updateData.notes || currentReferral.notes,
      scheduledAppointment: updateData.scheduledAppointment || currentReferral.scheduledAppointment,
      updatedAt: new Date().toISOString(),
      ...(updateData.status === 'completed' && { completedAt: new Date().toISOString() })
    };

    // Replace in dummy data
    dummyReferrals[referralIndex] = updatedReferral;

    // Log the update for audit trail
    console.log('Referral updated:', {
      referralId,
      changes: {
        status: { from: currentReferral.status, to: updateData.status },
        providerId: updateData.providerId,
        scheduledAppointment: updateData.scheduledAppointment
      },
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // TODO: Send notifications based on status change
    // TODO: Update provider availability if appointment scheduled
    // TODO: Trigger follow-up workflows

    return NextResponse.json({
      success: true,
      referral: updatedReferral
    });

  } catch (error) {
    console.error('Error updating referral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/referrals/[id] - Cancel/delete referral
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const referralId = params.id;
    const referralIndex = dummyReferrals.findIndex(r => r.id === referralId);

    if (referralIndex === -1) {
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      );
    }

    const referral = dummyReferrals[referralIndex];

    // Instead of deleting, mark as cancelled for audit trail
    const cancelledReferral = {
      ...referral,
      status: 'cancelled' as const,
      updatedAt: new Date().toISOString(),
      notes: `${referral.notes || ''}\n\nReferral cancelled on ${new Date().toISOString()}`
    };

    dummyReferrals[referralIndex] = cancelledReferral;

    // Log the cancellation
    console.log('Referral cancelled:', {
      referralId,
      originalStatus: referral.status,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // TODO: Notify relevant parties
    // TODO: Free up any scheduled appointments
    // TODO: Update provider availability

    return NextResponse.json({
      success: true,
      message: 'Referral cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling referral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
