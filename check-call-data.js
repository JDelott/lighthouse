const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || process.env.USER || "jacobdelott",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "lighthouse_db",
  password: process.env.DB_PASSWORD || "",
  port: parseInt(process.env.DB_PORT || "5432"),
});

async function checkCallData() {
  const client = await pool.connect();

  try {
    console.log("🔍 Checking call data...");

    // Get a sample call with all fields
    const result = await client.query(`
      SELECT id, call_id, client_phone, status, transcript, summary, metadata
      FROM call_sessions 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

    if (result.rows.length > 0) {
      const call = result.rows[0];
      console.log("📞 Sample call data:");
      console.log("- ID:", call.id);
      console.log("- Call ID:", call.call_id);
      console.log("- Phone:", call.client_phone);
      console.log("- Status:", call.status);
      console.log("- Has transcript:", !!call.transcript);
      console.log("- Has summary:", !!call.summary);
      console.log("- Metadata:", call.metadata);

      if (call.transcript) {
        console.log(
          "- Transcript preview:",
          call.transcript.substring(0, 200) + "..."
        );
      }

      if (call.summary) {
        console.log(
          "- Summary preview:",
          call.summary.substring(0, 200) + "..."
        );
      }
    } else {
      console.log("❌ No calls found");
    }
  } catch (error) {
    console.error("❌ Error checking call data:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkCallData().catch(console.error);
