import { VapiAssistantConfig } from './types';

// Appointment Scheduling AI Assistant Configuration for Vapi
export const appointmentAssistantConfig: VapiAssistantConfig = {
  id: 'asst_appointment_scheduler',
  name: 'The Mental Health Hub Appointment Scheduling Assistant',
  
  firstMessage: `Hello, thank you for calling The Mental Health Hub. I'm the scheduling assistant. Dr. [Therapist Name] is currently with a client, but I'm here to help you schedule an appointment or answer any questions about our services. How can I assist you today?`,
  
  systemPrompt: `You are a professional AI scheduling and intake assistant for The Mental Health Hub, a private practice mental health clinic. Your role is to:

**PRIMARY RESPONSIBILITIES:**
- Help clients schedule appointments when the therapist is unavailable
- Conduct preliminary intake interviews to gather essential information
- Assess appointment urgency and type needed
- Collect contact information and availability preferences
- Provide information about services, insurance, and policies
- Prepare clients for their upcoming appointments

**COMMUNICATION STYLE:**
- Professional, warm, and welcoming tone
- Clear and organized in gathering information
- Patient and understanding of client needs
- Maintain confidentiality and HIPAA compliance
- Efficient but thorough in information collection

**APPOINTMENT SCHEDULING PROCESS:**
1. **Determine Appointment Type:**
   - Initial consultation (new clients)
   - Follow-up therapy session (existing clients)
   - Couples/family therapy
   - Psychiatric evaluation
   - Emergency/urgent consultation

2. **Assess Urgency:**
   - Rate 1-5 (1=routine, 5=urgent but not crisis)
   - Ask about timeline preferences
   - Identify any immediate concerns that need priority scheduling

3. **Collect Essential Information:**
   - Full name, date of birth, phone number, email
   - Insurance information (provider, member ID)
   - Preferred appointment days/times
   - Reason for seeking therapy (brief overview)
   - Previous therapy experience
   - Any current medications or treatments

4. **Availability and Scheduling:**
   - Offer available appointment slots
   - Confirm appointment details
   - Provide preparation instructions
   - Send confirmation information

**INTAKE QUESTIONS TO COVER:**
- "What brings you to therapy at this time?"
- "Have you been in therapy before?"
- "Are you currently taking any medications?"
- "Is this an individual, couples, or family appointment?"
- "Do you have any specific therapist preferences?"
- "What days and times work best for you?"
- "Do you have insurance coverage for mental health services?"

**BOUNDARIES AND LIMITATIONS:**
- You are NOT providing therapy or clinical advice
- You cannot diagnose or treat mental health conditions
- You cannot prescribe medications
- For crisis situations, direct to 988 or 911
- Keep intake focused on scheduling and logistics
- Limit calls to 15-20 minutes maximum

**AVAILABLE FUNCTIONS:**
- schedule_appointment: Book confirmed appointment slots
- collect_intake_info: Store preliminary client information
- check_availability: Query therapist's available times
- send_confirmation: Send appointment confirmations and prep materials

**ENDING CALLS:**
- Confirm all appointment details
- Provide next steps and preparation instructions
- Give office contact information
- Remind about cancellation policy
- Thank them for choosing The Mental Health Hub

**CRISIS PROTOCOL:**
If someone mentions suicide, self-harm, or immediate danger:
- Remain calm and supportive
- Ask if they are safe right now
- Provide crisis resources (988, 911)
- Offer to connect them with on-call therapist if available
- Document as urgent for immediate therapist review

Remember: Your goal is to make the appointment scheduling process smooth and welcoming while gathering the information the therapist needs to provide excellent care.`,

  model: 'gpt-4',
  
  voice: {
    provider: 'eleven-labs',
    voiceId: 'pNInz6obpgDQGcFmaJgB' // Adam - warm, professional voice
  },
  
  transcriber: {
    provider: 'deepgram',
    model: 'nova-2',
    language: 'en-US'
  },
  
  recordingEnabled: true,
  endCallMessage: "Thank you for calling The Mental Health Hub. Remember, you're not alone, and help is always available. Take care of yourself.",
  maxDurationSeconds: 1800, // 30 minutes max
  silenceTimeoutSeconds: 30,
  responseDelaySeconds: 1
};

// Function definitions for the appointment scheduling assistant
export const appointmentAssistantFunctions = [
  {
    name: 'schedule_appointment',
    description: 'Book an appointment slot for the client',
    parameters: {
      type: 'object',
      properties: {
        appointmentType: {
          type: 'string',
          enum: ['initial_consultation', 'follow_up', 'couples_therapy', 'family_therapy', 'psychiatric_eval', 'urgent_consultation'],
          description: 'Type of appointment being scheduled'
        },
        urgency: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'Urgency level (1=routine, 5=urgent but not crisis)'
        },
        preferredDates: {
          type: 'array',
          items: { type: 'string' },
          description: 'Client\'s preferred appointment dates'
        },
        preferredTimes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Client\'s preferred appointment times'
        },
        duration: {
          type: 'number',
          enum: [45, 60, 90],
          description: 'Appointment duration in minutes'
        },
        notes: {
          type: 'string',
          description: 'Any special scheduling notes or requirements'
        }
      },
      required: ['appointmentType', 'urgency', 'preferredDates', 'preferredTimes']
    }
  },
  {
    name: 'collect_intake_info',
    description: 'Store preliminary client intake information',
    parameters: {
      type: 'object',
      properties: {
        clientInfo: {
          type: 'object',
          properties: {
            fullName: { type: 'string' },
            dateOfBirth: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            address: { type: 'string' }
          },
          required: ['fullName', 'phone']
        },
        insuranceInfo: {
          type: 'object',
          properties: {
            provider: { type: 'string' },
            memberId: { type: 'string' },
            groupNumber: { type: 'string' }
          }
        },
        reasonForSeeking: {
          type: 'string',
          description: 'Brief description of why they\'re seeking therapy'
        },
        previousTherapy: {
          type: 'boolean',
          description: 'Whether they\'ve been in therapy before'
        },
        currentMedications: {
          type: 'string',
          description: 'Current medications or treatments'
        },
        emergencyContact: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            relationship: { type: 'string' },
            phone: { type: 'string' }
          }
        }
      },
      required: ['clientInfo', 'reasonForSeeking']
    }
  },
  {
    name: 'check_availability',
    description: 'Query available appointment times',
    parameters: {
      type: 'object',
      properties: {
        dateRange: {
          type: 'object',
          properties: {
            startDate: { type: 'string' },
            endDate: { type: 'string' }
          },
          required: ['startDate', 'endDate']
        },
        timePreferences: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['morning', 'afternoon', 'evening']
          }
        },
        appointmentType: {
          type: 'string',
          enum: ['initial_consultation', 'follow_up', 'couples_therapy', 'family_therapy']
        }
      },
      required: ['dateRange']
    }
  },
  {
    name: 'send_confirmation',
    description: 'Send appointment confirmation and preparation materials',
    parameters: {
      type: 'object',
      properties: {
        appointmentDetails: {
          type: 'object',
          properties: {
            date: { type: 'string' },
            time: { type: 'string' },
            duration: { type: 'number' },
            type: { type: 'string' },
            location: { type: 'string' }
          },
          required: ['date', 'time', 'type']
        },
        contactMethod: {
          type: 'string',
          enum: ['email', 'sms', 'both'],
          description: 'How to send confirmation'
        },
        includePrepMaterials: {
          type: 'boolean',
          description: 'Whether to include appointment preparation materials'
        }
      },
      required: ['appointmentDetails', 'contactMethod']
    }
  }
];

// Mental health resources to share with callers
export const mentalHealthResources = {
  crisis_lines: {
    '988 Suicide & Crisis Lifeline': '988',
    'Crisis Text Line': 'Text HOME to 741741',
    'National Domestic Violence Hotline': '1-800-799-7233',
    'SAMHSA National Helpline': '1-800-662-4357'
  },
  
  therapy_finder: {
    'Psychology Today': 'https://www.psychologytoday.com/us/therapists',
    'SAMHSA Treatment Locator': 'https://findtreatment.samhsa.gov/',
    'Open Path Collective': 'https://openpathcollective.org/' // Affordable therapy
  },
  
  support_groups: {
    'NAMI Support Groups': 'https://nami.org/Support-Education/Support-Groups',
    'Mental Health America': 'https://mhanational.org/find-support-groups',
    'DBSA Support Groups': 'https://www.dbsalliance.org/support/chapters-support-groups/'
  },
  
  self_help: {
    'MindShift App': 'Anxiety management app',
    'Headspace': 'Meditation and mindfulness',
    'PTSD Coach': 'PTSD symptom management',
    'Sanvello': 'Mood and anxiety tracking'
  },
  
  emergency: {
    'Emergency Services': '911',
    'Mobile Crisis Team': 'Contact local mental health services',
    'Emergency Room': 'For immediate psychiatric evaluation'
  },
  
  substance_abuse: {
    'SAMHSA National Helpline': '1-800-662-4357',
    'Alcoholics Anonymous': 'https://www.aa.org/',
    'Narcotics Anonymous': 'https://na.org/',
    'SMART Recovery': 'https://www.smartrecovery.org/'
  }
};

// Coping strategies and techniques
export const copingStrategies = {
  breathing: [
    '4-7-8 Breathing: Inhale for 4, hold for 7, exhale for 8',
    'Box Breathing: Inhale 4, hold 4, exhale 4, hold 4',
    'Diaphragmatic breathing: Breathe deeply into your belly'
  ],
  
  grounding: [
    '5-4-3-2-1 Technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste',
    'Progressive muscle relaxation: Tense and release muscle groups',
    'Cold water on wrists or face to activate parasympathetic nervous system'
  ],
  
  cognitive: [
    'Challenge negative thoughts: Is this thought helpful? Is it true?',
    'Reframe catastrophic thinking: What would I tell a friend in this situation?',
    'Focus on what you can control vs. what you cannot'
  ],
  
  distraction: [
    'Listen to calming music or nature sounds',
    'Engage in physical activity or stretching',
    'Call a supportive friend or family member',
    'Practice a hobby or creative activity'
  ]
};

// Default environment variables for Vapi configuration
export const vapiEnvConfig = {
  VAPI_API_KEY: process.env.VAPI_API_KEY || '',
  VAPI_PHONE_NUMBER: process.env.VAPI_PHONE_NUMBER || '+15551234567',
  VAPI_WEBHOOK_URL: process.env.VAPI_WEBHOOK_URL || 'https://your-domain.com/api/vapi/webhook',
  VAPI_WEBHOOK_SECRET: process.env.VAPI_WEBHOOK_SECRET || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || ''
};
