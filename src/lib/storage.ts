import { VapiCallSession, AppointmentRequest, TherapistNote, VapiTranscriptEntry } from './types';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Storage paths (in a real app, you'd use a database)
const DATA_DIR = join(process.cwd(), 'data');
const CALLS_FILE = join(DATA_DIR, 'call-sessions.json');
const APPOINTMENTS_FILE = join(DATA_DIR, 'appointment-requests.json');
const NOTES_FILE = join(DATA_DIR, 'therapist-notes.json');
const TRANSCRIPTS_FILE = join(DATA_DIR, 'transcripts.json');

// Ensure data directory exists
try {
  if (!existsSync(DATA_DIR)) {
    require('fs').mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (error) {
  console.error('Error creating data directory:', error);
}

// Load data from files
export function loadCallSessions(): VapiCallSession[] {
  try {
    if (existsSync(CALLS_FILE)) {
      const data = readFileSync(CALLS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading call sessions:', error);
  }
  return [];
}

export function saveCallSessions(sessions: VapiCallSession[]): void {
  try {
    writeFileSync(CALLS_FILE, JSON.stringify(sessions, null, 2));
    console.log('💾 Saved', sessions.length, 'call sessions to storage');
  } catch (error) {
    console.error('Error saving call sessions:', error);
  }
}

export function loadAppointmentRequests(): AppointmentRequest[] {
  try {
    if (existsSync(APPOINTMENTS_FILE)) {
      const data = readFileSync(APPOINTMENTS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading appointment requests:', error);
  }
  return [];
}

export function saveAppointmentRequests(requests: AppointmentRequest[]): void {
  try {
    writeFileSync(APPOINTMENTS_FILE, JSON.stringify(requests, null, 2));
    console.log('💾 Saved', requests.length, 'appointment requests to storage');
  } catch (error) {
    console.error('Error saving appointment requests:', error);
  }
}

export function loadTherapistNotes(): TherapistNote[] {
  try {
    if (existsSync(NOTES_FILE)) {
      const data = readFileSync(NOTES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading therapist notes:', error);
  }
  return [];
}

export function saveTherapistNotes(notes: TherapistNote[]): void {
  try {
    writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
    console.log('💾 Saved', notes.length, 'therapist notes to storage');
  } catch (error) {
    console.error('Error saving therapist notes:', error);
  }
}

export function loadTranscripts(): VapiTranscriptEntry[] {
  try {
    if (existsSync(TRANSCRIPTS_FILE)) {
      const data = readFileSync(TRANSCRIPTS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading transcripts:', error);
  }
  return [];
}

export function saveTranscripts(transcripts: VapiTranscriptEntry[]): void {
  try {
    writeFileSync(TRANSCRIPTS_FILE, JSON.stringify(transcripts, null, 2));
    console.log('💾 Saved', transcripts.length, 'transcripts to storage');
  } catch (error) {
    console.error('Error saving transcripts:', error);
  }
}
