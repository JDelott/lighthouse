import { Patient, Provider, Referral, AuditLog, User, VapiCallSession, VapiTranscriptEntry, TherapistNote, AppointmentRequest } from './types';

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

// Vapi AI Call Sessions Dummy Data - Appointment Scheduling Focus
export const dummyVapiCallSessions: VapiCallSession[] = [
  {
    id: 'vapi-call-001',
    callId: 'vapi_12345678-1234-5678-9012-123456789012',
    clientPhone: '+15551234567',
    status: 'completed',
    startedAt: '2024-01-20T14:30:00Z',
    endedAt: '2024-01-20T14:45:00Z',
    duration: 900, // 15 minutes
    transcript: 'Full appointment scheduling conversation transcript...',
    summary: 'New client called to schedule initial consultation. Completed intake questionnaire and scheduled appointment for next week. Client seeking help with anxiety and work stress.',
    assistantId: 'asst_appointment_scheduler',
    recordingUrl: 'https://recordings.vapi.ai/call_12345678',
    callType: 'appointment_request',
    metadata: {
      clientName: 'Sarah Johnson',
      appointmentType: 'initial_consultation',
      urgencyLevel: 3,
      schedulingStatus: 'scheduled',
      preferredDates: ['2024-01-27', '2024-01-28', '2024-01-29'],
      preferredTimes: ['10:00 AM', '2:00 PM', '4:00 PM'],
      keyTopics: ['anxiety', 'work stress', 'initial consultation'],
      followUpRequired: false,
      intakeCompleted: true,
      insuranceVerified: true
    },
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z'
  },
  {
    id: 'vapi-call-002',
    callId: 'vapi_87654321-4321-8765-2109-876543210987',
    clientPhone: '+15552345678',
    status: 'completed',
    startedAt: '2024-01-21T10:15:00Z',
    endedAt: '2024-01-21T10:35:00Z',
    duration: 1200, // 20 minutes
    transcript: 'Couples therapy scheduling and intake conversation...',
    summary: 'Couple called to schedule couples therapy session. Both partners participated in intake. Relationship issues and communication problems discussed. Scheduled for next available slot.',
    assistantId: 'asst_appointment_scheduler',
    recordingUrl: 'https://recordings.vapi.ai/call_87654321',
    callType: 'appointment_request',
    metadata: {
      clientName: 'David and Lisa Chen',
      appointmentType: 'couples_therapy',
      urgencyLevel: 4,
      schedulingStatus: 'pending_confirmation',
      preferredDates: ['2024-01-25', '2024-01-26'],
      preferredTimes: ['6:00 PM', '7:00 PM'],
      keyTopics: ['couples therapy', 'communication issues', 'relationship counseling'],
      followUpRequired: true,
      intakeCompleted: true,
      insuranceVerified: false
    },
    createdAt: '2024-01-21T10:15:00Z',
    updatedAt: '2024-01-21T10:35:00Z'
  },
  {
    id: 'vapi-call-003',
    callId: 'vapi_11223344-5566-7788-9900-112233445566',
    clientPhone: '+15553456789',
    status: 'completed',
    startedAt: '2024-01-21T16:20:00Z',
    endedAt: '2024-01-21T16:32:00Z',
    duration: 720, // 12 minutes
    transcript: 'Urgent consultation request conversation...',
    summary: 'Existing client called requesting urgent consultation due to recent panic attacks. Prioritized scheduling and offered earlier available slot. Provided interim coping strategies.',
    assistantId: 'asst_appointment_scheduler',
    recordingUrl: 'https://recordings.vapi.ai/call_11223344',
    callType: 'appointment_request',
    patientId: 'pat-003',
    metadata: {
      clientName: 'Maria Rodriguez',
      appointmentType: 'urgent_consultation',
      urgencyLevel: 5,
      schedulingStatus: 'scheduled',
      preferredDates: ['2024-01-22', '2024-01-23'],
      preferredTimes: ['as soon as possible'],
      keyTopics: ['panic attacks', 'urgent consultation', 'existing client'],
      followUpRequired: false,
      intakeCompleted: false, // existing client
      insuranceVerified: true
    },
    createdAt: '2024-01-21T16:20:00Z',
    updatedAt: '2024-01-21T16:32:00Z'
  },
  {
    id: 'vapi-call-004',
    callId: 'vapi_55667788-9900-1122-3344-556677889900',
    clientPhone: '+15554567890',
    status: 'completed',
    startedAt: '2024-01-22T09:30:00Z',
    endedAt: '2024-01-22T09:42:00Z',
    duration: 720, // 12 minutes
    transcript: 'General inquiry about services and availability...',
    summary: 'Potential client called asking about therapy services, insurance coverage, and availability. Provided information about services offered and scheduling process. Did not schedule appointment yet.',
    assistantId: 'asst_appointment_scheduler',
    recordingUrl: 'https://recordings.vapi.ai/call_55667788',
    callType: 'general_inquiry',
    metadata: {
      clientName: 'Michael Thompson',
      urgencyLevel: 2,
      schedulingStatus: 'requested',
      keyTopics: ['service inquiry', 'insurance questions', 'availability'],
      followUpRequired: true,
      intakeCompleted: false,
      insuranceVerified: false
    },
    createdAt: '2024-01-22T09:30:00Z',
    updatedAt: '2024-01-22T09:42:00Z'
  }
];

export const dummyVapiTranscripts: VapiTranscriptEntry[] = [
  {
    id: 'transcript-001-1',
    callSessionId: 'vapi-call-001',
    speaker: 'assistant',
    text: 'Hello, thank you for calling Lighthouse Psychology. I\'m the scheduling assistant. Dr. Martinez is currently with a client, but I\'m here to help you schedule an appointment. How can I assist you today?',
    timestamp: '2024-01-20T14:30:05Z',
    confidence: 0.98
  },
  {
    id: 'transcript-001-2',
    callSessionId: 'vapi-call-001',
    speaker: 'user',
    text: 'Hi, I\'d like to schedule an appointment. I\'ve been dealing with a lot of anxiety lately, especially at work, and I think I need to talk to someone.',
    timestamp: '2024-01-20T14:30:12Z',
    confidence: 0.95,
    emotions: {
      sentiment: 'neutral',
      confidence: 0.87,
      emotions: ['concern', 'hope']
    }
  },
  {
    id: 'transcript-001-3',
    callSessionId: 'vapi-call-001',
    speaker: 'assistant',
    text: 'I\'m glad you\'re reaching out for support. That takes courage. I can definitely help you schedule an appointment with Dr. Martinez. Since this would be your first visit, we\'ll want to schedule an initial consultation. Can I get your full name and phone number first?',
    timestamp: '2024-01-20T14:30:18Z',
    confidence: 0.99
  },
  {
    id: 'transcript-001-4',
    callSessionId: 'vapi-call-001',
    speaker: 'user',
    text: 'Sure, it\'s Sarah Johnson, and my phone number is 555-123-4567.',
    timestamp: '2024-01-20T14:30:25Z',
    confidence: 0.97
  },
  {
    id: 'transcript-001-5',
    callSessionId: 'vapi-call-001',
    speaker: 'assistant',
    text: 'Thank you, Sarah. Now, to help Dr. Martinez prepare for your session, can you tell me a bit more about what\'s been going on? You mentioned anxiety at work - how long has this been affecting you?',
    timestamp: '2024-01-20T14:30:30Z',
    confidence: 0.98
  },
  {
    id: 'transcript-002-1',
    callSessionId: 'vapi-call-002',
    speaker: 'assistant',
    text: 'Hello, thank you for calling Lighthouse Psychology. I\'m the scheduling assistant. How can I help you today?',
    timestamp: '2024-01-21T10:15:05Z',
    confidence: 0.98
  },
  {
    id: 'transcript-002-2',
    callSessionId: 'vapi-call-002',
    speaker: 'user',
    text: 'Hi, my wife and I would like to schedule couples therapy. We\'ve been having some communication issues and we want to work on them before they get worse.',
    timestamp: '2024-01-21T10:15:15Z',
    confidence: 0.93,
    emotions: {
      sentiment: 'neutral',
      confidence: 0.85,
      emotions: ['concern', 'determination']
    }
  },
  {
    id: 'transcript-002-3',
    callSessionId: 'vapi-call-002',
    speaker: 'assistant',
    text: 'That\'s wonderful that you\'re both committed to working on your relationship together. I can help you schedule a couples therapy session with Dr. Martinez. Can I get both of your names and a contact number?',
    timestamp: '2024-01-21T10:15:22Z',
    confidence: 0.99
  },
  {
    id: 'transcript-003-1',
    callSessionId: 'vapi-call-003',
    speaker: 'assistant',
    text: 'Hello, thank you for calling Lighthouse Psychology. How can I assist you today?',
    timestamp: '2024-01-21T16:20:05Z',
    confidence: 0.98
  },
  {
    id: 'transcript-003-2',
    callSessionId: 'vapi-call-003',
    speaker: 'user',
    text: 'Hi, this is Maria Rodriguez. I\'m an existing patient of Dr. Martinez, and I need to schedule an urgent appointment. I\'ve been having panic attacks almost daily this week.',
    timestamp: '2024-01-21T16:20:12Z',
    confidence: 0.94,
    emotions: {
      sentiment: 'negative',
      confidence: 0.90,
      emotions: ['anxiety', 'urgency', 'distress']
    }
  },
  {
    id: 'transcript-003-3',
    callSessionId: 'vapi-call-003',
    speaker: 'assistant',
    text: 'I\'m sorry to hear you\'re experiencing increased panic attacks, Maria. Let me check Dr. Martinez\'s schedule to see what urgent appointments we have available. Are you safe right now and able to wait for an appointment, or do you need immediate crisis support?',
    timestamp: '2024-01-21T16:20:18Z',
    confidence: 0.97
  }
];

// Appointment Requests from AI Calls
export const dummyAppointmentRequests: AppointmentRequest[] = [
  {
    id: 'appt-req-001',
    callSessionId: 'vapi-call-001',
    clientInfo: {
      fullName: 'Sarah Johnson',
      phone: '+15551234567',
      email: 'sarah.johnson@email.com',
      dateOfBirth: '1985-03-15'
    },
    appointmentDetails: {
      type: 'initial_consultation',
      urgency: 3,
      duration: 60,
      preferredDates: ['2024-01-27', '2024-01-28', '2024-01-29'],
      preferredTimes: ['10:00 AM', '2:00 PM', '4:00 PM'],
      notes: 'Client experiencing work-related anxiety, first time seeking therapy'
    },
    intakeInfo: {
      reasonForSeeking: 'Work-related anxiety and stress management',
      previousTherapy: false,
      currentMedications: 'None',
      insuranceInfo: {
        provider: 'Blue Cross Blue Shield',
        memberId: 'BCBS123456789'
      }
    },
    status: 'scheduled',
    scheduledAppointment: {
      date: '2024-01-27',
      time: '10:00 AM',
      duration: 60,
      location: 'Office - Room 1',
      therapistId: 'prov-001'
    },
    createdAt: '2024-01-20T14:45:00Z',
    updatedAt: '2024-01-20T15:00:00Z'
  },
  {
    id: 'appt-req-002',
    callSessionId: 'vapi-call-002',
    clientInfo: {
      fullName: 'David and Lisa Chen',
      phone: '+15552345678',
      email: 'david.chen@email.com'
    },
    appointmentDetails: {
      type: 'couples_therapy',
      urgency: 4,
      duration: 90,
      preferredDates: ['2024-01-25', '2024-01-26'],
      preferredTimes: ['6:00 PM', '7:00 PM'],
      notes: 'Couple seeking help with communication issues'
    },
    intakeInfo: {
      reasonForSeeking: 'Communication problems and relationship conflicts',
      previousTherapy: false,
      insuranceInfo: {
        provider: 'Aetna',
        memberId: 'AETNA987654321'
      }
    },
    status: 'pending_review',
    therapistNotes: 'Need to verify insurance coverage for couples therapy sessions',
    createdAt: '2024-01-21T10:35:00Z',
    updatedAt: '2024-01-21T11:15:00Z'
  },
  {
    id: 'appt-req-003',
    callSessionId: 'vapi-call-003',
    clientInfo: {
      fullName: 'Maria Rodriguez',
      phone: '+15553456789',
      email: 'maria.rodriguez@email.com'
    },
    appointmentDetails: {
      type: 'urgent_consultation',
      urgency: 5,
      duration: 60,
      preferredDates: ['2024-01-22', '2024-01-23'],
      preferredTimes: ['as soon as possible'],
      notes: 'Existing client experiencing increased panic attacks'
    },
    status: 'confirmed',
    scheduledAppointment: {
      date: '2024-01-22',
      time: '2:00 PM',
      duration: 60,
      location: 'Office - Room 1',
      therapistId: 'prov-001'
    },
    therapistNotes: 'Priority client - increased anxiety symptoms, may need medication review',
    createdAt: '2024-01-21T16:32:00Z',
    updatedAt: '2024-01-21T17:00:00Z'
  }
];

export const dummyTherapistNotes: TherapistNote[] = [
  {
    id: 'note-001',
    callSessionId: 'vapi-call-001',
    therapistId: 'prov-001',
    note: 'New client intake completed successfully by AI assistant. Client reports work-related anxiety, no previous therapy experience. Good candidate for CBT approach. Scheduled for initial consultation.',
    actionItems: [
      'Review intake information before appointment',
      'Prepare CBT materials for anxiety management',
      'Verify insurance coverage'
    ],
    followUpDate: '2024-01-27T10:00:00Z',
    priority: 'medium',
    tags: ['new client', 'work anxiety', 'CBT', 'initial consultation'],
    createdAt: '2024-01-20T15:30:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: 'note-002',
    callSessionId: 'vapi-call-002',
    therapistId: 'prov-001',
    note: 'Couples therapy request - both partners motivated for treatment. Need to verify insurance coverage for couples sessions. AI assistant handled intake professionally.',
    actionItems: [
      'Contact insurance to verify couples therapy coverage',
      'Send intake paperwork to both partners',
      'Schedule appointment once insurance confirmed'
    ],
    followUpDate: '2024-01-22T09:00:00Z',
    priority: 'medium',
    tags: ['couples therapy', 'insurance verification', 'intake completed'],
    createdAt: '2024-01-21T11:00:00Z',
    updatedAt: '2024-01-21T11:00:00Z'
  },
  {
    id: 'note-003',
    callSessionId: 'vapi-call-003',
    therapistId: 'prov-001',
    note: 'Existing client Maria - increased panic attacks this week. Scheduled urgent appointment. May need medication consultation with psychiatrist. AI appropriately prioritized this call.',
    actionItems: [
      'Review previous treatment notes',
      'Assess current coping strategies',
      'Consider psychiatric referral for medication evaluation',
      'Safety assessment during appointment'
    ],
    followUpDate: '2024-01-22T14:00:00Z',
    priority: 'high',
    tags: ['existing client', 'panic attacks', 'urgent', 'medication review'],
    createdAt: '2024-01-21T17:00:00Z',
    updatedAt: '2024-01-21T17:00:00Z'
  }
];

// Utility functions for Vapi data
export const findVapiCallSessionById = (id: string): VapiCallSession | undefined => {
  return dummyVapiCallSessions.find(session => session.id === id);
};

export const getVapiCallSessionsByPatient = (patientId: string): VapiCallSession[] => {
  return dummyVapiCallSessions.filter(session => session.patientId === patientId);
};

export const getVapiCallSessionsByStatus = (status: VapiCallSession['status']): VapiCallSession[] => {
  return dummyVapiCallSessions.filter(session => session.status === status);
};

export const getTranscriptsByCallSession = (callSessionId: string): VapiTranscriptEntry[] => {
  return dummyVapiTranscripts.filter(entry => entry.callSessionId === callSessionId);
};

export const getTherapistNotesByCallSession = (callSessionId: string): TherapistNote[] => {
  return dummyTherapistNotes.filter(note => note.callSessionId === callSessionId);
};

export const getRecentVapiCallSessions = (limit: number = 10): VapiCallSession[] => {
  return dummyVapiCallSessions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};
