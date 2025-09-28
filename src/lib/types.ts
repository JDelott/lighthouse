export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  insuranceProvider?: string;
  insuranceId?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Provider {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  licenseNumber: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  acceptedInsurance: string[];
  availability: {
    days: string[];
    hours: string;
  };
  rating: number;
  isAcceptingNewPatients: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Referral {
  id: string;
  patientId: string;
  providerId?: string;
  status: 'pending' | 'assigned' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  referralReason: string;
  symptoms: string[];
  preferredContactMethod: 'phone' | 'email' | 'fax';
  urgencyLevel: number; // 1-10 scale
  notes?: string;
  source: 'web' | 'email' | 'phone' | 'fax';
  submittedBy: string; // User ID who submitted
  assignedTo?: string; // Provider ID
  scheduledAppointment?: {
    date: string;
    time: string;
    type: 'in-person' | 'telehealth';
  };
  followUpRequired: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface AuditLog {
  id: string;
  entityType: 'patient' | 'provider' | 'referral';
  entityId: string;
  action: 'create' | 'read' | 'update' | 'delete';
  userId: string;
  userEmail: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'coordinator' | 'provider' | 'viewer';
  organizationId: string;
  isActive: boolean;
  lastLoginAt?: string;
  emailVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  planType: 'trial' | 'starter' | 'professional' | 'enterprise';
  phoneNumber?: string;
  address?: string;
  website?: string;
  vapiAssistantId?: string;
  vapiPhoneNumber?: string;
  settings: Record<string, any>;
  isActive: boolean;
  trialEndsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  organizationId: string;
  planType: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsageTracking {
  id: string;
  organizationId: string;
  monthYear: string; // YYYY-MM format
  callsCount: number;
  minutesUsed: number;
  transcriptionMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlanLimits {
  maxCallsPerMonth: number;
  overageRate: number; // cost per additional call
  features: string[];
  supportLevel: 'email' | 'chat' | 'priority' | 'dedicated';
}

export type ReferralFormData = {
  // Patient Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Insurance Information
  insuranceProvider?: string;
  insuranceId?: string;
  
  // Emergency Contact
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  
  // Referral Details
  referralReason: string;
  symptoms: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  preferredContactMethod: 'phone' | 'email' | 'fax';
  urgencyLevel: number;
  notes?: string;
  
  // Provider Preferences
  preferredProvider?: string;
  specialtyPreference?: string[];
};

// Vapi AI Integration Types
export interface VapiCallSession {
  id: string;
  callId: string; // Vapi call ID
  patientId?: string; // Link to patient if identified
  clientPhone: string;
  status: 'in-progress' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  endedAt?: string;
  duration?: number; // in seconds
  transcript?: string;
  summary?: string;
  assistantId: string;
  recordingUrl?: string;
  callType: 'appointment_request' | 'intake_call' | 'general_inquiry' | 'crisis';
  metadata?: {
    clientName?: string;
    appointmentType?: 'initial_consultation' | 'follow_up' | 'couples_therapy' | 'family_therapy' | 'psychiatric_eval' | 'urgent_consultation';
    urgencyLevel?: number; // 1-5 for appointment scheduling
    schedulingStatus?: 'requested' | 'scheduled' | 'pending_confirmation' | 'completed';
    preferredDates?: string[];
    preferredTimes?: string[];
    keyTopics?: string[];
    followUpRequired?: boolean;
    intakeCompleted?: boolean;
    insuranceVerified?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentRequest {
  id: string;
  callSessionId: string;
  clientInfo: {
    fullName: string;
    phone: string;
    email?: string;
    dateOfBirth?: string;
    address?: string;
  };
  appointmentDetails: {
    type: 'initial_consultation' | 'follow_up' | 'couples_therapy' | 'family_therapy' | 'psychiatric_eval' | 'urgent_consultation';
    urgency: number; // 1-5 scale
    duration: 45 | 60 | 90; // minutes
    preferredDates: string[];
    preferredTimes: string[];
    notes?: string;
  };
  intakeInfo?: {
    reasonForSeeking: string;
    previousTherapy: boolean;
    currentMedications?: string;
    insuranceInfo?: {
      provider: string;
      memberId: string;
      groupNumber?: string;
    };
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  status: 'pending_review' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  scheduledAppointment?: {
    date: string;
    time: string;
    duration: number;
    location: string;
    therapistId?: string;
  };
  therapistNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VapiTranscriptEntry {
  id: string;
  callSessionId: string;
  speaker: 'user' | 'assistant';
  text: string;
  timestamp: string;
  confidence?: number;
  duration?: number;
  emotions?: {
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    emotions: string[];
  };
}

export interface VapiWebhookEvent {
  type: 'call-started' | 'call-ended' | 'transcript' | 'function-call' | 'speech-update' | 'hang' | 'tool-calls';
  callId: string;
  assistantId: string;
  timestamp: string;
  data: unknown;
}

export interface TherapistNote {
  id: string;
  callSessionId: string;
  therapistId: string;
  note: string;
  actionItems?: string[];
  followUpDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VapiAssistantConfig {
  id: string;
  name: string;
  firstMessage: string;
  systemPrompt: string;
  model: string;
  voice: {
    provider: string;
    voiceId: string;
  };
  transcriber: {
    provider: string;
    model: string;
    language: string;
  };
  recordingEnabled: boolean;
  endCallMessage?: string;
  maxDurationSeconds?: number;
  silenceTimeoutSeconds?: number;
  responseDelaySeconds?: number;
}

// Calendar System Types
export interface Therapist {
  id: string;
  organizationId: string;
  name: string;
  email?: string;
  isActive: boolean;
  workingHours: {
    monday: { start: string; end: string; enabled: boolean };
    tuesday: { start: string; end: string; enabled: boolean };
    wednesday: { start: string; end: string; enabled: boolean };
    thursday: { start: string; end: string; enabled: boolean };
    friday: { start: string; end: string; enabled: boolean };
    saturday: { start: string; end: string; enabled: boolean };
    sunday: { start: string; end: string; enabled: boolean };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  organizationId: string;
  appointmentRequestId?: string;
  therapistId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  appointmentType: string;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationMinutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableSlot {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  therapistId: string;
  therapistName: string;
  durationMinutes: number;
}
