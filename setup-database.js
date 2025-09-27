const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || process.env.USER || "jacobdelott",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "mental_health_hub_db",
  password: process.env.DB_PASSWORD || "",
  port: parseInt(process.env.DB_PORT || "5432"),
});

async function setupDatabase() {
  const client = await pool.connect();

  try {
    console.log("🚀 Setting up The Mental Health Hub SaaS database...");

    // Read and execute the schema file
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split by semicolon and execute each statement
    const statements = schema
      .split(";")
      .filter((stmt) => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        console.log("Executing:", statement.trim().substring(0, 50) + "...");
        await client.query(statement);
      }
    }

    console.log("✅ Database schema created successfully!");

    // Create a sample organization and user for testing
    const orgId = "org-demo-" + Date.now();
    const userId = "user-demo-" + Date.now();
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    await client.query(
      `INSERT INTO organizations (id, name, plan_type, phone_number, trial_ends_at, is_active, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [orgId, "Demo Practice", "trial", "(555) 123-4567", trialEndsAt, true]
    );

    // Note: In production, you'd hash the password
    await client.query(
      `INSERT INTO users (id, email, name, role, organization_id, is_active, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [userId, "demo@mentalhealthhub.com", "Demo User", "admin", orgId, true]
    );

    // Create initial usage tracking
    const currentMonth = new Date().toISOString().substring(0, 7);
    await client.query(
      `INSERT INTO usage_tracking (id, organization_id, month_year, calls_count, minutes_used, transcription_minutes, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [`usage-${orgId}-${currentMonth}`, orgId, currentMonth, 0, 0, 0]
    );

    console.log("✅ Sample data created successfully!");
    console.log("📧 Demo login: demo@mentalhealthhub.com");
    console.log("🏢 Demo organization:", orgId);
  } catch (error) {
    console.error("❌ Error setting up database:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the setup
setupDatabase().catch(console.error);
