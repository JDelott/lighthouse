import { Pool, PoolClient } from 'pg';
import { VapiCallSession, VapiTranscriptEntry, AppointmentRequest, TherapistNote } from './types';

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('🐘 Connected to PostgreSQL database');
  console.log('🔍 Database connection details:', {
    connectionString: process.env.DATABASE_URL ? 'Using DATABASE_URL' : 'Using individual params',
    host: process.env.DB_HOST || 'localhost'
  });
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

// Export the pool for use in other files
export { pool };

// Call Sessions
export async function saveCallSession(session: VapiCallSession, organizationId?: string): Promise<void> {
  const client = await pool.connect();
  try {
    // If no organizationId provided, try to find the first available organization (for demo)
    let orgId = organizationId;
    if (!orgId) {
      const orgResult = await client.query('SELECT id FROM organizations LIMIT 1');
      orgId = orgResult.rows[0]?.id;
      console.log('🏢 Using default organization for call:', orgId);
    }

    await client.query(`
      INSERT INTO call_sessions (
        id, call_id, organization_id, client_phone, status, started_at, ended_at, duration,
        transcript, summary, recording_url, assistant_id, call_type, metadata,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (call_id) DO UPDATE SET
        status = EXCLUDED.status, 
        ended_at = EXCLUDED.ended_at, 
        duration = EXCLUDED.duration, 
        transcript = EXCLUDED.transcript, 
        summary = EXCLUDED.summary,
        recording_url = EXCLUDED.recording_url, 
        metadata = EXCLUDED.metadata, 
        updated_at = EXCLUDED.updated_at
    `, [
      session.id, session.callId, orgId, session.clientPhone, session.status,
      session.startedAt, session.endedAt, session.duration, session.transcript,
      session.summary, session.recordingUrl, session.assistantId, session.callType,
      JSON.stringify(session.metadata), session.createdAt, session.updatedAt
    ]);
    
    console.log('✅ Call session saved to database:', session.id, 'for org:', orgId);
  } catch (error) {
    console.error('❌ Error saving call session to database:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getCallSessions(organizationId?: string): Promise<VapiCallSession[]> {
  const client = await pool.connect();
  try {
    let query = `
      SELECT * FROM call_sessions 
    `;
    let params: any[] = [];
    
    if (organizationId) {
      query += ` WHERE organization_id = $1`;
      params.push(organizationId);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const result = await client.query(query, params);
    
    return result.rows.map(row => ({
      id: row.id,
      callId: row.call_id,
      clientPhone: row.client_phone,
      status: row.status,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      duration: row.duration,
      transcript: row.transcript,
      summary: row.summary,
      recordingUrl: row.recording_url,
      assistantId: row.assistant_id,
      callType: row.call_type,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } finally {
    client.release();
  }
}

export async function getCallSessionById(id: string): Promise<VapiCallSession | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM call_sessions WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      callId: row.call_id,
      clientPhone: row.client_phone,
      status: row.status,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      duration: row.duration,
      transcript: row.transcript,
      summary: row.summary,
      recordingUrl: row.recording_url,
      assistantId: row.assistant_id,
      callType: row.call_type,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  } finally {
    client.release();
  }
}

// Transcripts
export async function saveTranscript(transcript: VapiTranscriptEntry): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      INSERT INTO transcripts (
        id, call_session_id, speaker, text, timestamp, confidence, emotions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING
    `, [
      transcript.id, transcript.callSessionId, transcript.speaker, transcript.text,
      transcript.timestamp, transcript.confidence, JSON.stringify(transcript.emotions)
    ]);
  } finally {
    client.release();
  }
}

export async function getTranscriptsByCallId(callSessionId: string): Promise<VapiTranscriptEntry[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM transcripts 
      WHERE call_session_id = $1 
      ORDER BY timestamp ASC
    `, [callSessionId]);
    
    return result.rows.map(row => ({
      id: row.id,
      callSessionId: row.call_session_id,
      speaker: row.speaker,
      text: row.text,
      timestamp: row.timestamp,
      confidence: row.confidence,
      emotions: row.emotions
    }));
  } finally {
    client.release();
  }
}

// Appointment Requests
export async function saveAppointmentRequest(request: AppointmentRequest): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      INSERT INTO appointment_requests (
        id, call_session_id, client_info, appointment_details, intake_info, status,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        client_info = $3, appointment_details = $4, intake_info = $5, status = $6,
        updated_at = $8
    `, [
      request.id, request.callSessionId, JSON.stringify(request.clientInfo),
      JSON.stringify(request.appointmentDetails), JSON.stringify(request.intakeInfo),
      request.status, request.createdAt, request.updatedAt
    ]);
  } finally {
    client.release();
  }
}

export async function getAppointmentRequests(organizationId?: string): Promise<AppointmentRequest[]> {
  const client = await pool.connect();
  try {
    let query = `
      SELECT ar.* FROM appointment_requests ar
    `;
    let params: any[] = [];
    
    if (organizationId) {
      query += `
        JOIN call_sessions cs ON ar.call_session_id = cs.id 
        WHERE cs.organization_id = $1
      `;
      params.push(organizationId);
    }
    
    query += ` ORDER BY ar.created_at DESC`;
    
    const result = await client.query(query, params);
    
    return result.rows.map(row => ({
      id: row.id,
      callSessionId: row.call_session_id,
      clientInfo: row.client_info,
      appointmentDetails: row.appointment_details,
      intakeInfo: row.intake_info,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } finally {
    client.release();
  }
}

// Therapist Notes
export async function saveTherapistNote(note: TherapistNote): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      INSERT INTO therapist_notes (
        id, call_session_id, therapist_id, note, action_items, follow_up_date,
        priority, tags, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        note = $4, action_items = $5, follow_up_date = $6, priority = $7,
        tags = $8, updated_at = $10
    `, [
      note.id, note.callSessionId, note.therapistId, note.note, note.actionItems,
      note.followUpDate, note.priority, note.tags, note.createdAt, note.updatedAt
    ]);
  } finally {
    client.release();
  }
}

export async function getTherapistNotes(organizationId?: string): Promise<TherapistNote[]> {
  const client = await pool.connect();
  try {
    let query = `
      SELECT tn.* FROM therapist_notes tn
    `;
    let params: any[] = [];
    
    if (organizationId) {
      query += `
        JOIN call_sessions cs ON tn.call_session_id = cs.id 
        WHERE cs.organization_id = $1
      `;
      params.push(organizationId);
    }
    
    query += ` ORDER BY tn.created_at DESC`;
    
    const result = await client.query(query, params);
    
    return result.rows.map(row => ({
      id: row.id,
      callSessionId: row.call_session_id,
      therapistId: row.therapist_id,
      note: row.note,
      actionItems: row.action_items,
      followUpDate: row.follow_up_date,
      priority: row.priority,
      tags: row.tags,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } finally {
    client.release();
  }
}

// Utility functions
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🐘 Closing PostgreSQL connection pool...');
  pool.end();
});

process.on('SIGTERM', () => {
  console.log('🐘 Closing PostgreSQL connection pool...');
  pool.end();
});
