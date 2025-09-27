// Application configuration
export const config = {
  // Vapi Configuration
  vapi: {
    publicKey: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '',
    phoneNumber: process.env.NEXT_PUBLIC_VAPI_PHONE_NUMBER || '(555) 123-4567',
    assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '',
  },
  
  // Practice Information
  practice: {
    name: 'The Mental Health Hub',
    therapistName: 'Dr. Martinez',
    address: '123 Main Street, Suite 200, Boston, MA 02101',
    email: 'info@mentalhealthhub.com',
    website: 'https://mentalhealthhub.com',
  },
  
  // App Configuration
  app: {
    name: 'The Mental Health Hub',
    description: 'Professional mental health services with AI-powered appointment scheduling',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  // Feature Flags
  features: {
    vapiIntegration: process.env.NODE_ENV === 'production' ? true : true, // Always enabled for demo
    appointmentScheduling: true,
    intakeManagement: true,
    transcriptAnalysis: true,
  }
};

// Helper function to format phone number for display
export function formatPhoneForDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// Helper function to get phone number for tel: links
export function getPhoneLink(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  return phone;
}
