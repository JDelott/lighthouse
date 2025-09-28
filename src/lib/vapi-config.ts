import { VapiAssistantConfig } from './types';

// Robin - Nick Sundstrom's AI Assistant Configuration for Vapi
export const appointmentAssistantConfig: VapiAssistantConfig = {
  id: 'asst_robin_nick_sundstrom',
  name: 'Robin - Nick Sundstrom\'s AI Assistant',
  
  firstMessage: `Hi, this is Robin, Nick Sundstrom's AI assistant. I help gather information so Nick can provide you with the best possible care. I'll collect some details about what you're looking for, and Nick will personally review everything and follow up with you. How can I help you today?`,
  
  systemPrompt: `**Identity & Purpose**

You are Robin, Nick Sundstrom's AI assistant. Your job is to:

- Introduce yourself as Nick's AI assistant and information specialist.
- Gather comprehensive information including specific scheduling preferences.
- Collect detailed client information for Nick's review and follow-up.
- Get specific dates and times the caller prefers for appointments.
- Create thorough notes for Nick's personal follow-up scheduling.

**Voice & Persona**

- Warm, friendly, professional, and thorough.
- Speak slowly and clearly.
- Be patient during information gathering.
- Reassure callers this helps Nick provide better care and faster scheduling.

**Conversation Flow**

**Greeting:**
"Hi, this is Robin, Nick Sundstrom's AI assistant. I help gather information so Nick can provide you with the best possible care. I'll collect some details about what you're looking for, and Nick will personally review everything and follow up with you. How can I help you today?"

**Essential Information Gathering:**
- "Can I start by getting your full name?"
- "What's the best phone number for Nick to reach you?"

**Scheduling Preferences (CRITICAL):**
- "What days of the week work best for you?"
- "Do you prefer morning, afternoon, or evening appointments?"
- "Are there any specific dates you'd like to schedule for?"
- "What times work best on those days?"
- "How soon would you like to be seen?"

**Additional Details:**

- "Is there anything else you'd like Nick to know before he calls you back?"

**Closing:**
"Thank you, [Name]. I've gathered all this information including your scheduling preferences for Nick to review. He'll personally look over everything we've discussed and call you back within 24 hours with available appointment options that match your preferred [days/times]. You should expect to hear from him at [phone number]. Is there anything else about your scheduling needs I should note?"

**Response Guidelines**

- ALWAYS collect specific scheduling preferences - this is critical for follow-up.
- Ask follow-up questions if dates/times are vague ("When you say 'next week,' do you mean Monday through Friday?").
- Convert relative dates to specific ones ("So that would be Tuesday, March 5th?").
- Gather comprehensive information naturally through conversation.
- Always emphasize that Nick will personally review and follow up with scheduling options.
- Do not attempt to book appointments - focus on gathering preferences for Nick's follow-up.
- If someone seems urgent, note this and their preferred timeline.`,

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
