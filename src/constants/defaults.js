export const DATA_DIR = 'jobflow'
export const CONTACTS_FILE = 'jobflow/contacts.json'
export const CONVERSATIONS_DIR = 'jobflow/conversations'
export const AUDIO_DIR = 'jobflow/audio'
export const SETTINGS_FILE = 'jobflow/settings.json'
export const PROFILE_DIR        = 'jobflow/profile'
export const PROFILE_INFO_FILE  = 'jobflow/profile/info.json'
export const PROFILE_RESUME_FILE = 'jobflow/profile/resume.md'
export const PROFILE_FILES_DIR  = 'jobflow/profile/files'
export const AI_CHATS_DIR       = 'jobflow/ai-chats'

export const DEFAULT_SETTINGS = {
  reminderTime: '09:00',
  notificationsEnabled: true,
  darkMode: 'system',
  appVersion: '1.0.0',
  llmProvider: {
    provider: 'nvidia',
    apiKey: '',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    model: 'meta/llama-3.1-70b-instruct',
  },
  companyTypes: [
    { value: 'startup',    label: 'Startup'    },
    { value: 'mid-size',   label: 'Mid-size'   },
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'agency',     label: 'Agency'     },
  ],
  roleTypes: [
    { value: 'fulltime',   label: 'Full-time'  },
    { value: 'contract',   label: 'Contract'   },
    { value: 'consulting', label: 'Consulting' },
  ],
  statuses: [
    { value: 'active', label: 'Active', color: 'green'  },
    { value: 'warm',   label: 'Warm',   color: 'amber'  },
    { value: 'cold',   label: 'Cold',   color: 'gray'   },
    { value: 'hired',  label: 'Hired',  color: 'teal'   },
    { value: 'closed', label: 'Closed', color: 'red'    },
  ],
}

export const DEFAULT_PROFILE = {
  name: '',
  headline: '',
  currentRole: '',
  company: '',
  skills: '',
  summary: '',
  extraNotes: '',
}

export const LLM_PRESETS = [
  { id: 'nvidia',  label: 'Nvidia NIM',    baseUrl: 'https://integrate.api.nvidia.com/v1', model: 'meta/llama-3.1-70b-instruct' },
  { id: 'openai',  label: 'OpenAI',        baseUrl: 'https://api.openai.com/v1',           model: 'gpt-4o-mini' },
  { id: 'groq',    label: 'Groq',          baseUrl: 'https://api.groq.com/openai/v1',      model: 'llama3-70b-8192' },
  { id: 'ollama',  label: 'Ollama (local)',baseUrl: 'http://localhost:11434/v1',            model: 'llama3' },
  { id: 'custom',  label: 'Custom',        baseUrl: '',                                     model: '' },
]

export const DEFAULT_CONTACT = {
  fullName: '',
  phone: '',
  email: '',
  linkedIn: '',
  company: '',
  jobTitle: '',
  companyType: 'startup',
  hasOpenPosition: false,
  targetRole: '',
  targetRoleType: 'fulltime',
  referredBy: '',
  notes: '',
  nextContactDate: '',
  nextContactPurpose: '',
  status: 'active',
}
