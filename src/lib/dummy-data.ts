import { Patient, Provider, Referral, AuditLog, User } from './types';

export const dummyPatients: Patient[] = [
  {
    id: 'pat-001',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: '1985-03-15',
    phone: '(555) 123-4567',
    email: 'sarah.johnson@email.com',
    address: {
      street: '123 Main St',
      city: 'Boston',
      state: 'MA',
      zipCode: '02101'
    },
    insuranceProvider: 'Blue Cross Blue Shield',
    insuranceId: 'BCBS123456789',
    emergencyContact: {
      name: 'Michael Johnson',
      relationship: 'Spouse',
      phone: '(555) 987-6543'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'pat-002',
    firstName: 'David',
    lastName: 'Chen',
    dateOfBirth: '1992-07-22',
    phone: '(555) 234-5678',
    email: 'david.chen@email.com',
    address: {
      street: '456 Oak Ave',
      city: 'Cambridge',
      state: 'MA',
      zipCode: '02138'
    },
    insuranceProvider: 'Aetna',
    insuranceId: 'AETNA987654321',
    emergencyContact: {
      name: 'Lisa Chen',
      relationship: 'Mother',
      phone: '(555) 876-5432'
    },
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  },
  {
    id: 'pat-003',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    dateOfBirth: '1978-11-08',
    phone: '(555) 345-6789',
    email: 'maria.rodriguez@email.com',
    address: {
      street: '789 Pine St',
      city: 'Somerville',
      state: 'MA',
      zipCode: '02143'
    },
    insuranceProvider: 'UnitedHealthcare',
    insuranceId: 'UHC456789123',
    emergencyContact: {
      name: 'Carlos Rodriguez',
      relationship: 'Brother',
      phone: '(555) 765-4321'
    },
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:15:00Z'
  }
];

export const dummyProviders: Provider[] = [
  {
    id: 'prov-001',
    name: 'Dr. Emily Watson',
    title: 'Licensed Clinical Social Worker',
    specialties: ['Anxiety', 'Depression', 'Trauma', 'PTSD'],
    licenseNumber: 'LCSW-12345',
    phone: '(555) 111-2222',
    email: 'ewatson@therapycenter.com',
    address: {
      street: '100 Therapy Lane',
      city: 'Boston',
      state: 'MA',
      zipCode: '02115'
    },
    acceptedInsurance: ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare'],
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      hours: '9:00 AM - 5:00 PM'
    },
    rating: 4.8,
    isAcceptingNewPatients: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'prov-002',
    name: 'Dr. James Mitchell',
    title: 'Licensed Psychologist',
    specialties: ['Cognitive Behavioral Therapy', 'Couples Therapy', 'Addiction'],
    licenseNumber: 'LP-67890',
    phone: '(555) 333-4444',
    email: 'jmitchell@mindwellness.com',
    address: {
      street: '200 Wellness Way',
      city: 'Cambridge',
      state: 'MA',
      zipCode: '02139'
    },
    acceptedInsurance: ['Aetna', 'Cigna', 'Harvard Pilgrim'],
    availability: {
      days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      hours: '10:00 AM - 6:00 PM'
    },
    rating: 4.9,
    isAcceptingNewPatients: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'prov-003',
    name: 'Dr. Lisa Park',
    title: 'Licensed Marriage and Family Therapist',
    specialties: ['Family Therapy', 'Child Psychology', 'Adolescent Counseling'],
    licenseNumber: 'LMFT-11111',
    phone: '(555) 555-6666',
    email: 'lpark@familyfirst.com',
    address: {
      street: '300 Family Circle',
      city: 'Brookline',
      state: 'MA',
      zipCode: '02446'
    },
    acceptedInsurance: ['Blue Cross Blue Shield', 'UnitedHealthcare', 'Tufts Health Plan'],
    availability: {
      days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      hours: '8:00 AM - 4:00 PM'
    },
    rating: 4.7,
    isAcceptingNewPatients: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export const dummyReferrals: Referral[] = [
  {
    id: 'ref-001',
    patientId: 'pat-001',
    providerId: 'prov-001',
    status: 'scheduled',
    priority: 'medium',
    referralReason: 'Patient experiencing anxiety and panic attacks',
    symptoms: ['anxiety', 'panic attacks', 'sleep issues'],
    preferredContactMethod: 'phone',
    urgencyLevel: 6,
    notes: 'Patient prefers morning appointments',
    source: 'web',
    submittedBy: 'user-001',
    assignedTo: 'prov-001',
    scheduledAppointment: {
      date: '2024-02-01',
      time: '10:00 AM',
      type: 'in-person'
    },
    followUpRequired: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-18T14:20:00Z'
  },
  {
    id: 'ref-002',
    patientId: 'pat-002',
    status: 'pending',
    priority: 'high',
    referralReason: 'Depression and substance abuse concerns',
    symptoms: ['depression', 'substance abuse', 'isolation'],
    preferredContactMethod: 'email',
    urgencyLevel: 8,
    notes: 'Patient has history of substance abuse, needs specialized care',
    source: 'web',
    submittedBy: 'user-001',
    followUpRequired: true,
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  },
  {
    id: 'ref-003',
    patientId: 'pat-003',
    providerId: 'prov-003',
    status: 'contacted',
    priority: 'low',
    referralReason: 'Family counseling for teenage daughter',
    symptoms: ['family conflict', 'communication issues'],
    preferredContactMethod: 'phone',
    urgencyLevel: 3,
    notes: 'Family available for evening appointments only',
    source: 'phone',
    submittedBy: 'user-002',
    assignedTo: 'prov-003',
    followUpRequired: false,
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T16:45:00Z'
  }
];

export const dummyUsers: User[] = [
  {
    id: 'user-001',
    email: 'admin@lighthouse.com',
    name: 'Admin User',
    role: 'admin',
    isActive: true,
    lastLogin: '2024-01-20T08:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T08:30:00Z'
  },
  {
    id: 'user-002',
    email: 'coordinator@lighthouse.com',
    name: 'Jane Coordinator',
    role: 'coordinator',
    isActive: true,
    lastLogin: '2024-01-19T15:45:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-19T15:45:00Z'
  }
];

export const dummyAuditLogs: AuditLog[] = [
  {
    id: 'audit-001',
    entityType: 'referral',
    entityId: 'ref-001',
    action: 'create',
    userId: 'user-001',
    userEmail: 'admin@lighthouse.com',
    changes: {
      status: 'pending',
      priority: 'medium'
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    timestamp: '2024-01-15T10:30:00Z'
  },
  {
    id: 'audit-002',
    entityType: 'referral',
    entityId: 'ref-001',
    action: 'update',
    userId: 'user-002',
    userEmail: 'coordinator@lighthouse.com',
    changes: {
      status: { from: 'pending', to: 'assigned' },
      assignedTo: 'prov-001'
    },
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    timestamp: '2024-01-16T09:15:00Z'
  }
];

// Utility functions for working with dummy data
export const findPatientById = (id: string): Patient | undefined => {
  return dummyPatients.find(patient => patient.id === id);
};

export const findProviderById = (id: string): Provider | undefined => {
  return dummyProviders.find(provider => provider.id === id);
};

export const findReferralById = (id: string): Referral | undefined => {
  return dummyReferrals.find(referral => referral.id === id);
};

export const getReferralsByStatus = (status: Referral['status']): Referral[] => {
  return dummyReferrals.filter(referral => referral.status === status);
};

export const getReferralsByPriority = (priority: Referral['priority']): Referral[] => {
  return dummyReferrals.filter(referral => referral.priority === priority);
};

export const getAvailableProviders = (): Provider[] => {
  return dummyProviders.filter(provider => provider.isAcceptingNewPatients);
};
