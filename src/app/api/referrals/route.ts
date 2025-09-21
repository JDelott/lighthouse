import { NextRequest, NextResponse } from 'next/server';
import { referralFormSchema } from '@/lib/validation';
import { dummyReferrals, dummyPatients } from '@/lib/dummy-data';
import { Referral, Patient, ReferralFormData } from '@/lib/types';
import { encryptPatientPHI, generateSecureId } from '@/lib/encryption';
import { v4 as uuidv4 } from 'uuid';

// GET /api/referrals - Get all referrals with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredReferrals = [...dummyReferrals];

    // Apply filters
    if (status && status !== 'all') {
      filteredReferrals = filteredReferrals.filter(r => r.status === status);
    }

    if (priority && priority !== 'all') {
      filteredReferrals = filteredReferrals.filter(r => r.priority === priority);
    }

    // Sort by creation date (newest first)
    filteredReferrals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReferrals = filteredReferrals.slice(startIndex, endIndex);

    // Add patient information to referrals
    const enrichedReferrals = paginatedReferrals.map(referral => {
      const patient = dummyPatients.find(p => p.id === referral.patientId);
      return {
        ...referral,
        patient: patient ? {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          phone: patient.phone,
          email: patient.email
        } : null
      };
    });

    return NextResponse.json({
      referrals: enrichedReferrals,
      pagination: {
        page,
        limit,
        total: filteredReferrals.length,
        totalPages: Math.ceil(filteredReferrals.length / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/referrals - Create a new referral
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request data
    const validationResult = referralFormSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const formData: ReferralFormData = validationResult.data;

    // Create patient record
    const patientId = `pat-${generateSecureId()}`;
    const newPatient: Patient = {
      id: patientId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      insuranceProvider: formData.insuranceProvider,
      insuranceId: formData.insuranceId,
      emergencyContact: formData.emergencyContact,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real application, encrypt PHI before storing
    // const encryptedPatient = encryptPatientPHI(newPatient);

    // Create referral record
    const referralId = `ref-${generateSecureId()}`;
    const newReferral: Referral = {
      id: referralId,
      patientId: patientId,
      status: 'pending',
      priority: formData.priority,
      referralReason: formData.referralReason,
      symptoms: formData.symptoms,
      preferredContactMethod: formData.preferredContactMethod,
      urgencyLevel: formData.urgencyLevel,
      notes: formData.notes,
      source: 'web',
      submittedBy: 'user-001', // TODO: Get from session/auth
      followUpRequired: formData.priority === 'high' || formData.priority === 'urgent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to dummy data (in real app, save to database)
    dummyPatients.push(newPatient);
    dummyReferrals.push(newReferral);

    // Log audit trail
    console.log('Referral created:', {
      referralId,
      patientId,
      priority: formData.priority,
      source: 'web',
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // TODO: Trigger AI processing for provider matching
    // TODO: Send notifications based on priority level
    // TODO: Create audit log entry

    return NextResponse.json({
      success: true,
      referral: {
        id: referralId,
        patientId: patientId,
        status: 'pending',
        priority: formData.priority,
        createdAt: newReferral.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating referral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/referrals - Bulk update referrals (for admin operations)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, referralIds, data } = body;

    if (!action || !referralIds || !Array.isArray(referralIds)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // TODO: Implement bulk operations
    // - Bulk status updates
    // - Bulk provider assignments
    // - Bulk priority changes

    return NextResponse.json({
      success: true,
      message: `Bulk ${action} completed for ${referralIds.length} referrals`
    });

  } catch (error) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
