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
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
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
