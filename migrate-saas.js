const { Pool } = require("pg");

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || process.env.USER || "jacobdelott",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "mental_health_hub_db",
  password: process.env.DB_PASSWORD || "",
  port: parseInt(process.env.DB_PORT || "5432"),
});

async function migrateSaasFeatures() {
  const client = await pool.connect();

  try {
    console.log("🚀 Migrating to SaaS features...");

    // Create organizations table
    console.log("Creating organizations table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        plan_type VARCHAR(50) NOT NULL DEFAULT 'trial',
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
    `);

    // Create users table
    console.log("Creating users table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        organization_id VARCHAR(255) REFERENCES organizations(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT true,
        last_login_at TIMESTAMP,
        email_verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create subscriptions table
    console.log("Creating subscriptions table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id VARCHAR(255) PRIMARY KEY,
        organization_id VARCHAR(255) REFERENCES organizations(id) ON DELETE CASCADE,
        plan_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        stripe_subscription_id VARCHAR(255),
        stripe_customer_id VARCHAR(255),
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        cancel_at_period_end BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create usage tracking table
    console.log("Creating usage_tracking table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS usage_tracking (
        id VARCHAR(255) PRIMARY KEY,
        organization_id VARCHAR(255) REFERENCES organizations(id) ON DELETE CASCADE,
        month_year VARCHAR(7) NOT NULL,
        calls_count INTEGER DEFAULT 0,
        minutes_used INTEGER DEFAULT 0,
        transcription_minutes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(organization_id, month_year)
      );
    `);

    // Add organization_id to call_sessions if it doesn't exist
    console.log("Adding organization_id to call_sessions...");
    try {
      await client.query(`
        ALTER TABLE call_sessions 
        ADD COLUMN IF NOT EXISTS organization_id VARCHAR(255) REFERENCES organizations(id) ON DELETE CASCADE;
      `);
    } catch (error) {
      console.log("Column organization_id may already exist in call_sessions");
    }

    // Create indexes
    console.log("Creating indexes...");
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
      "CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id)",
      "CREATE INDEX IF NOT EXISTS idx_subscriptions_organization_id ON subscriptions(organization_id)",
      "CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)",
      "CREATE INDEX IF NOT EXISTS idx_usage_tracking_org_month ON usage_tracking(organization_id, month_year)",
      "CREATE INDEX IF NOT EXISTS idx_call_sessions_organization_id ON call_sessions(organization_id)",
    ];

    for (const index of indexes) {
      await client.query(index);
    }

    // Create triggers for updated_at
    console.log("Creating triggers...");
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    const triggers = [
      "DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations",
      "CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
      "DROP TRIGGER IF EXISTS update_users_updated_at ON users",
      "CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
      "DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions",
      "CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
      "DROP TRIGGER IF EXISTS update_usage_tracking_updated_at ON usage_tracking",
      "CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON usage_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
    ];

    for (const trigger of triggers) {
      await client.query(trigger);
    }

    // Create sample organization and user
    console.log("Creating sample data...");
    const orgId = "org-demo-" + Date.now();
    const userId = "user-demo-" + Date.now();
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    await client.query(
      `INSERT INTO organizations (id, name, plan_type, phone_number, trial_ends_at, is_active, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [orgId, "Demo Practice", "trial", "(555) 123-4567", trialEndsAt, true]
    );

    await client.query(
      `INSERT INTO users (id, email, name, role, organization_id, is_active, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT (email) DO NOTHING`,
      [userId, "demo@mentalhealthhub.com", "Demo User", "admin", orgId, true]
    );

    // Create initial usage tracking
    const currentMonth = new Date().toISOString().substring(0, 7);
    await client.query(
      `INSERT INTO usage_tracking (id, organization_id, month_year, calls_count, minutes_used, transcription_minutes, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT (organization_id, month_year) DO NOTHING`,
      [`usage-${orgId}-${currentMonth}`, orgId, currentMonth, 0, 0, 0]
    );

    console.log("✅ SaaS migration completed successfully!");
    console.log("📧 Demo login: demo@mentalhealthhub.com");
    console.log("🏢 Demo organization:", orgId);
    console.log("");
    console.log("🚀 Next steps:");
    console.log(
      "1. Set up environment variables for NextAuth and Google OAuth"
    );
    console.log("2. Install dependencies: npm install");
    console.log("3. Start the development server: npm run dev");
    console.log("4. Visit http://localhost:3000 to see your SaaS application!");
  } catch (error) {
    console.error("❌ Error during migration:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
migrateSaasFeatures().catch(console.error);
