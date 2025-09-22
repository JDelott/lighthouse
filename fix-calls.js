const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || process.env.USER || "jacobdelott",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "lighthouse_db",
  password: process.env.DB_PASSWORD || "",
  port: parseInt(process.env.DB_PORT || "5432"),
});

async function fixCalls() {
  const client = await pool.connect();

  try {
    console.log("🔧 Fixing call organization assignments...");

    // Get the Wellness Center organization ID
    const orgResult = await client.query(
      "SELECT id FROM organizations WHERE name = 'Wellness Center'"
    );

    if (orgResult.rows.length === 0) {
      console.error("❌ Wellness Center organization not found");
      return;
    }

    const orgId = orgResult.rows[0].id;
    console.log("🏢 Using organization:", orgId);

    // Update all calls with null organization_id
    const updateResult = await client.query(
      `UPDATE call_sessions 
       SET organization_id = $1 
       WHERE organization_id IS NULL`,
      [orgId]
    );

    console.log(
      `✅ Updated ${updateResult.rowCount} calls to belong to ${orgId}`
    );

    // Verify the update
    const verifyResult = await client.query(
      `SELECT COUNT(*) as count FROM call_sessions WHERE organization_id = $1`,
      [orgId]
    );

    console.log(
      `📊 Total calls now assigned to your organization: ${verifyResult.rows[0].count}`
    );
  } catch (error) {
    console.error("❌ Error fixing calls:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixCalls().catch(console.error);
