-- Lighthouse Psychology Database Schema

-- Call Sessions Table
CREATE TABLE call_sessions (
    id VARCHAR(255) PRIMARY KEY,
    call_id VARCHAR(255) UNIQUE NOT NULL,
    client_phone VARCHAR(50),
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    duration INTEGER,
    transcript TEXT,
    summary TEXT,
    recording_url TEXT,
    assistant_id VARCHAR(255),
    call_type VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Transcripts Table
CREATE TABLE transcripts (
    id VARCHAR(255) PRIMARY KEY,
    call_session_id VARCHAR(255) REFERENCES call_sessions(id),
    speaker VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMP,
    confidence DECIMAL(3,2),
    emotions JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Appointment Requests Table
CREATE TABLE appointment_requests (
    id VARCHAR(255) PRIMARY KEY,
    call_session_id VARCHAR(255) REFERENCES call_sessions(id),
    client_info JSONB,
    appointment_details JSONB,
    intake_info JSONB,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Therapist Notes Table
CREATE TABLE therapist_notes (
    id VARCHAR(255) PRIMARY KEY,
    call_session_id VARCHAR(255) REFERENCES call_sessions(id),
    therapist_id VARCHAR(255),
    note TEXT,
    action_items TEXT[],
    follow_up_date TIMESTAMP,
    priority VARCHAR(20),
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_call_sessions_call_id ON call_sessions(call_id);
CREATE INDEX idx_call_sessions_status ON call_sessions(status);
CREATE INDEX idx_call_sessions_created_at ON call_sessions(created_at DESC);
CREATE INDEX idx_transcripts_call_session_id ON transcripts(call_session_id);
CREATE INDEX idx_appointment_requests_call_session_id ON appointment_requests(call_session_id);
CREATE INDEX idx_appointment_requests_status ON appointment_requests(status);
CREATE INDEX idx_therapist_notes_call_session_id ON therapist_notes(call_session_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at updates
CREATE TRIGGER update_call_sessions_updated_at BEFORE UPDATE ON call_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointment_requests_updated_at BEFORE UPDATE ON appointment_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapist_notes_updated_at BEFORE UPDATE ON therapist_notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
