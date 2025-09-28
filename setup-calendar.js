const { Pool } = require("pg");

// Load environment variables first
require("dotenv").config({ path: ".env" });

// Database configuration
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
};

console.log("🔧 Database configuration:", {
  user: dbConfig.user,
  host: dbConfig.host,
  database: dbConfig.database,
  port: dbConfig.port,
  // Don't log password for security
});

const pool = new Pool(dbConfig);

async function setupCalendar() {
  console.log("🗓️ Setting up calendar system...");

  const client = await pool.connect();
  try {
    // 1. Run the calendar migration (create tables)
    console.log("📋 Creating calendar tables...");

    await client.query(`
      -- Simple therapists table
      CREATE TABLE IF NOT EXISTS therapists (
          id VARCHAR(255) PRIMARY KEY,
          organization_id VARCHAR(255) REFERENCES organizations(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          is_active BOOLEAN DEFAULT true,
          working_hours JSONB DEFAULT '{
              "monday": {"start": "09:00", "end": "17:00", "enabled": true},
              "tuesday": {"start": "09:00", "end": "17:00", "enabled": true},
              "wednesday": {"start": "09:00", "end": "17:00", "enabled": true},
              "thursday": {"start": "09:00", "end": "17:00", "enabled": true},
              "friday": {"start": "09:00", "end": "17:00", "enabled": true},
              "saturday": {"start": "09:00", "end": "17:00", "enabled": false},
              "sunday": {"start": "09:00", "end": "17:00", "enabled": false}
          }',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      -- Simple appointments table (confirmed bookings)
      CREATE TABLE IF NOT EXISTS appointments (
          id VARCHAR(255) PRIMARY KEY,
          organization_id VARCHAR(255) REFERENCES organizations(id) ON DELETE CASCADE,
          appointment_request_id VARCHAR(255) REFERENCES appointment_requests(id),
          therapist_id VARCHAR(255) REFERENCES therapists(id),
          client_name VARCHAR(255) NOT NULL,
          client_phone VARCHAR(50),
          client_email VARCHAR(255),
          appointment_type VARCHAR(100) NOT NULL,
          appointment_date DATE NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          duration_minutes INTEGER NOT NULL DEFAULT 60,
          status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 2. Create indexes
    console.log("📊 Creating indexes...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_therapists_organization_id ON therapists(organization_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_organization_id ON appointments(organization_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_therapist_date ON appointments(therapist_id, appointment_date);
      CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(appointment_date, start_time);
    `);

    // 3. Create triggers (check if function exists first)
    console.log("⚡ Creating triggers...");
    const functionExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
      );
    `);

    if (functionExists.rows[0].exists) {
      await client.query(`
        DROP TRIGGER IF EXISTS update_therapists_updated_at ON therapists;
        CREATE TRIGGER update_therapists_updated_at BEFORE UPDATE ON therapists 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);

      await client.query(`
        DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
        CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    // 4. Create default therapists for each organization
    console.log("👨‍⚕️ Creating default therapists...");
    const orgsResult = await client.query(
      "SELECT id, name FROM organizations WHERE is_active = true"
    );

    for (const org of orgsResult.rows) {
      // Check if therapist already exists
      const existingTherapist = await client.query(
        "SELECT id FROM therapists WHERE organization_id = $1",
        [org.id]
      );

      if (existingTherapist.rows.length === 0) {
        const therapistId = `therapist-${org.id}-${Date.now()}`;
        const therapistName = `Dr. ${org.name.split(" ")[0]} Therapist`;

        await client.query(
          `
          INSERT INTO therapists (id, organization_id, name, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())
        `,
          [therapistId, org.id, therapistName]
        );

        console.log(
          `  ✅ Created therapist "${therapistName}" for ${org.name}`
        );
      } else {
        console.log(`  ⏭️ Therapist already exists for ${org.name}`);
      }
    }

    // 5. Create a few sample appointments for demo (optional)
    console.log("📅 Creating sample appointments...");
    const therapists = await client.query(
      "SELECT id, organization_id, name FROM therapists LIMIT 2"
    );

    for (const therapist of therapists.rows) {
      // Create a sample appointment for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const appointmentDate = tomorrow.toISOString().split("T")[0];

      const existingAppt = await client.query(
        "SELECT id FROM appointments WHERE therapist_id = $1 AND appointment_date = $2",
        [therapist.id, appointmentDate]
      );

      if (existingAppt.rows.length === 0) {
        const appointmentId = `appt-sample-${therapist.id}-${Date.now()}`;

        await client.query(
          `
          INSERT INTO appointments (
            id, organization_id, therapist_id, client_name, client_phone,
            appointment_type, appointment_date, start_time, end_time, duration_minutes,
            status, notes, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        `,
          [
            appointmentId,
            therapist.organization_id,
            therapist.id,
            "Sample Client",
            "+1234567890",
            "initial_consultation",
            appointmentDate,
            "10:00",
            "11:00",
            60,
            "scheduled",
            "Sample appointment created during calendar setup",
          ]
        );

        console.log(
          `  📋 Created sample appointment for ${therapist.name} on ${appointmentDate}`
        );
      }
    }

    console.log("\n🎉 Calendar setup complete!");
    console.log("\n📋 Summary:");
    console.log("  ✅ Calendar tables created");
    console.log("  ✅ Indexes and triggers configured");
    console.log("  ✅ Default therapists created for all organizations");
    console.log("  ✅ Sample appointments added");
    console.log("\n🚀 Your calendar system is ready to use!");
    console.log("\n📖 Next steps:");
    console.log("  1. Visit your dashboard to see the new calendar section");
    console.log("  2. Add more therapists via the API or dashboard");
    console.log("  3. Configure working hours for each therapist");
    console.log("  4. Test booking appointments through the UI");
  } catch (error) {
    console.error("❌ Error setting up calendar:", error);
    console.error("Stack trace:", error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

// Check if this script is being run directly
if (require.main === module) {
  setupCalendar()
    .then(() => {
      console.log("\n✨ Setup script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Setup script failed:", error);
      process.exit(1);
    });
}

module.exports = { setupCalendar };
