#!/usr/bin/env node

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || process.env.USER || "jacobdelott",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "mental_health_hub_db",
  password: process.env.DB_PASSWORD || "",
  port: parseInt(process.env.DB_PORT || "5432"),
});

async function migrateData() {
  console.log("🚀 Starting migration from file storage to PostgreSQL...");

  const dataDir = path.join(__dirname, "data");

  try {
    // Migrate call sessions
    const callSessionsFile = path.join(dataDir, "call-sessions.json");
    if (fs.existsSync(callSessionsFile)) {
      const callSessions = JSON.parse(
        fs.readFileSync(callSessionsFile, "utf8")
      );
      console.log(`📞 Migrating ${callSessions.length} call sessions...`);

      for (const session of callSessions) {
        await pool.query(
          `
          INSERT INTO call_sessions (
            id, call_id, client_phone, status, started_at, ended_at, duration,
            transcript, summary, recording_url, assistant_id, call_type, metadata,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (id) DO NOTHING
        `,
          [
            session.id,
            session.callId,
            session.clientPhone,
            session.status,
            session.startedAt,
            session.endedAt,
            session.duration,
            session.transcript,
            session.summary,
            session.recordingUrl,
            session.assistantId,
            session.callType,
            JSON.stringify(session.metadata),
            session.createdAt,
            session.updatedAt,
          ]
        );
      }
      console.log("✅ Call sessions migrated");
    }

    // Migrate appointment requests
    const appointmentsFile = path.join(dataDir, "appointment-requests.json");
    if (fs.existsSync(appointmentsFile)) {
      const appointments = JSON.parse(
        fs.readFileSync(appointmentsFile, "utf8")
      );
      console.log(
        `📅 Migrating ${appointments.length} appointment requests...`
      );

      for (const appointment of appointments) {
        await pool.query(
          `
          INSERT INTO appointment_requests (
            id, call_session_id, client_info, appointment_details, intake_info, status,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO NOTHING
        `,
          [
            appointment.id,
            appointment.callSessionId,
            JSON.stringify(appointment.clientInfo),
            JSON.stringify(appointment.appointmentDetails),
            JSON.stringify(appointment.intakeInfo),
            appointment.status,
            appointment.createdAt,
            appointment.updatedAt,
          ]
        );
      }
      console.log("✅ Appointment requests migrated");
    }

    // Migrate therapist notes
    const notesFile = path.join(dataDir, "therapist-notes.json");
    if (fs.existsSync(notesFile)) {
      const notes = JSON.parse(fs.readFileSync(notesFile, "utf8"));
      console.log(`📝 Migrating ${notes.length} therapist notes...`);

      for (const note of notes) {
        await pool.query(
          `
          INSERT INTO therapist_notes (
            id, call_session_id, therapist_id, note, action_items, follow_up_date,
            priority, tags, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO NOTHING
        `,
          [
            note.id,
            note.callSessionId,
            note.therapistId,
            note.note,
            note.actionItems,
            note.followUpDate,
            note.priority,
            note.tags,
            note.createdAt,
            note.updatedAt,
          ]
        );
      }
      console.log("✅ Therapist notes migrated");
    }

    // Migrate transcripts
    const transcriptsFile = path.join(dataDir, "transcripts.json");
    if (fs.existsSync(transcriptsFile)) {
      const transcripts = JSON.parse(fs.readFileSync(transcriptsFile, "utf8"));
      console.log(`💬 Migrating ${transcripts.length} transcripts...`);

      for (const transcript of transcripts) {
        await pool.query(
          `
          INSERT INTO transcripts (
            id, call_session_id, speaker, text, timestamp, confidence, emotions
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING
        `,
          [
            transcript.id,
            transcript.callSessionId,
            transcript.speaker,
            transcript.text,
            transcript.timestamp,
            transcript.confidence,
            JSON.stringify(transcript.emotions),
          ]
        );
      }
      console.log("✅ Transcripts migrated");
    }

    // Show final counts
    const callCount = await pool.query("SELECT COUNT(*) FROM call_sessions");
    const appointmentCount = await pool.query(
      "SELECT COUNT(*) FROM appointment_requests"
    );
    const noteCount = await pool.query("SELECT COUNT(*) FROM therapist_notes");
    const transcriptCount = await pool.query(
      "SELECT COUNT(*) FROM transcripts"
    );

    console.log("\n🎉 Migration completed successfully!");
    console.log("📊 Database now contains:");
    console.log(`   📞 ${callCount.rows[0].count} call sessions`);
    console.log(`   📅 ${appointmentCount.rows[0].count} appointment requests`);
    console.log(`   📝 ${noteCount.rows[0].count} therapist notes`);
    console.log(`   💬 ${transcriptCount.rows[0].count} transcripts`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateData();
