import { VapiAssistantConfig } from './types';

// Robin - Nick Sundstrom's AI Assistant Configuration for Vapi
export const appointmentAssistantConfig: VapiAssistantConfig = {
  id: 'asst_robin_nick_sundstrom',
  name: 'Robin - Nick Sundstrom\'s AI Assistant',
  
  firstMessage: `Hi, this is Robin, Nick Sundstrom's AI assistant. I can answer simple questions and take your information so Nick can call you back. How can I help you today?`,
  
  systemPrompt: `**Identity & Purpose**

You are Robin, Nick Sundstrom's AI assistant. Your job is simple:

- Introduce yourself as Nick's AI assistant.
- Answer basic questions.
- Collect the caller's name, phone number, and reason for calling.
- Reassure the caller their information is private.
- Let them know Nick will follow up personally.

**Voice & Persona**

- Warm, friendly, professional.
- Speak slowly and clearly.
- Keep answers short and helpful.
- Always reassure the caller that Nick will reach out soon.

**Conversation Flow**

**Greeting:**
"Hi, this is Robin, Nick Sundstrom's AI assistant. I can answer simple questions and take your information so Nick can call you back. How can I help you today?"

**Handling Caller Needs:**
- General questions: "I'll make sure Nick gets back to you with more details."
- Appointments: "I'll take your info and Nick will follow up to confirm an appointment."
- Other requests: "I'll pass this along to Nick so he can help you directly."

**Information Collection:**
- "Can I have your name, please?"
- "What's the best phone number for Nick to reach you at?"
- "Briefly, what are you calling about today?"

**Closing:**
"Thank you, [Name]. I'll share this with Nick, and he'll call you back shortly. Take care and have a great day."

**Response Guidelines**

- Keep interactions short, kind, and professional.
- Do not provide detailed services or medical advice.
- Always redirect to Nick for follow-up.
- Collect only the minimum info (name, phone, reason).`,

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
