import { z } from 'zod';

// Phone number validation regex (US format)
const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$/;

// Email validation
const emailSchema = z.string().email('Invalid email address');

// Phone validation
const phoneSchema = z.string().regex(phoneRegex, 'Phone must be in format (XXX) XXX-XXXX');

// Address schema
const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters (e.g., MA)'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be 5 digits or 5+4 format')
});

// Emergency contact schema
const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Emergency contact name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: phoneSchema
});

// Patient validation schema
export const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  phone: phoneSchema,
  email: emailSchema,
  address: addressSchema,
  insuranceProvider: z.string().optional(),
  insuranceId: z.string().optional(),
  emergencyContact: emergencyContactSchema
});

// Referral form validation schema
export const referralFormSchema = z.object({
  // Patient Information
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  phone: phoneSchema,
  email: emailSchema,
  address: addressSchema,
  
  // Insurance Information
  insuranceProvider: z.string().optional(),
  insuranceId: z.string().optional(),
  
  // Emergency Contact
  emergencyContact: emergencyContactSchema,
  
  // Referral Details
  referralReason: z.string().min(10, 'Please provide a detailed reason (at least 10 characters)').max(500, 'Reason too long'),
  symptoms: z.array(z.string()).min(1, 'Please select at least one symptom'),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Please select a priority level' })
  }),
  preferredContactMethod: z.enum(['phone', 'email', 'fax'], {
    errorMap: () => ({ message: 'Please select a contact method' })
  }),
  urgencyLevel: z.number().min(1, 'Urgency level must be between 1-10').max(10, 'Urgency level must be between 1-10'),
  notes: z.string().max(1000, 'Notes too long').optional(),
  
  // Provider Preferences
  preferredProvider: z.string().optional(),
  specialtyPreference: z.array(z.string()).optional()
});

// Provider validation schema
export const providerSchema = z.object({
  name: z.string().min(1, 'Provider name is required').max(100, 'Name too long'),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
  licenseNumber: z.string().min(1, 'License number is required').max(50, 'License number too long'),
  phone: phoneSchema,
  email: emailSchema,
  address: addressSchema,
  acceptedInsurance: z.array(z.string()).min(1, 'At least one insurance provider is required'),
  availability: z.object({
    days: z.array(z.string()).min(1, 'At least one day is required'),
    hours: z.string().min(1, 'Hours are required')
  }),
  isAcceptingNewPatients: z.boolean()
});

// Referral status update schema
export const referralStatusSchema = z.object({
  status: z.enum(['pending', 'assigned', 'contacted', 'scheduled', 'completed', 'cancelled']),
  providerId: z.string().optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
  scheduledAppointment: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    time: z.string().regex(/^\d{1,2}:\d{2}\s(AM|PM)$/, 'Time must be in format HH:MM AM/PM'),
    type: z.enum(['in-person', 'telehealth'])
  }).optional()
});

// Data sanitization functions
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const sanitizePhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  return phone; // Return original if not 10 digits
};

export const validateAge = (dateOfBirth: string): boolean => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  
  // Must be at least 18 years old
  return age >= 18;
};

export const validateInsurance = (provider: string, id: string): boolean => {
  if (!provider && !id) return true; // Optional fields
  if (provider && !id) return false; // If provider given, ID required
  if (!provider && id) return false; // If ID given, provider required
  return true;
};

// HIPAA compliance validation
export const validateHIPAACompliance = (data: any): string[] => {
  const violations: string[] = [];
  
  // Check for required audit fields
  if (!data.userId) violations.push('User ID required for audit trail');
  if (!data.timestamp) violations.push('Timestamp required for audit trail');
  if (!data.ipAddress) violations.push('IP address required for audit trail');
  
  // Check for PHI (Protected Health Information) handling
  if (data.dateOfBirth && !data.encrypted) {
    violations.push('Date of birth must be encrypted');
  }
  
  if (data.phone && !data.encrypted) {
    violations.push('Phone number must be encrypted');
  }
  
  if (data.email && !data.encrypted) {
    violations.push('Email address must be encrypted');
  }
  
  return violations;
};
