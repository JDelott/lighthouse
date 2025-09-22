-- Lighthouse Psychology SaaS Database Schema

-- Organizations Table (Multi-tenant support)
CREATE TABLE organizations (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    plan_type VARCHAR(50) NOT NULL DEFAULT 'trial', -- trial, starter, professional, enterprise
    phone_number VARCHAR(50),
    address TEXT,
    website VARCHAR(255),
    vapi_assistant_id VARCHAR(255),
    vapi_phone_number VARCHAR(50),
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    trial_ends_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users Table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- null for OAuth users
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin', -- admin, coordinator, provider, viewer
    organization_id VARCHAR(255) REFERENCES organizations(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE subscriptions (
    id VARCHAR(255) PRIMARY KEY,
    organization_id VARCHAR(255) REFERENCES organizations(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL, -- active, canceled, past_due, trialing
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Usage Tracking Table (for billing limits)
CREATE TABLE usage_tracking (
    id VARCHAR(255) PRIMARY KEY,
    organization_id VARCHAR(255) REFERENCES organizations(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- YYYY-MM format
    calls_count INTEGER DEFAULT 0,
    minutes_used INTEGER DEFAULT 0,
    transcription_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(organization_id, month_year)
);

-- Call Sessions Table
CREATE TABLE call_sessions (
    id VARCHAR(255) PRIMARY KEY,
    call_id VARCHAR(255) UNIQUE NOT NULL,
    organization_id VARCHAR(255) REFERENCES organizations(id) ON DELETE CASCADE,
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
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_subscriptions_organization_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_usage_tracking_org_month ON usage_tracking(organization_id, month_year);
CREATE INDEX idx_call_sessions_call_id ON call_sessions(call_id);
CREATE INDEX idx_call_sessions_organization_id ON call_sessions(organization_id);
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
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON usage_tracking 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_sessions_updated_at BEFORE UPDATE ON call_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointment_requests_updated_at BEFORE UPDATE ON appointment_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapist_notes_updated_at BEFORE UPDATE ON therapist_notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
