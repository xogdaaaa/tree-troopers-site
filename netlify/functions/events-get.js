const { neon } = require("@netlify/neon");

exports.handler = async () => {
  try {
    const sql = neon();
    const events = await sql`
      SELECT id, title, event_date, location, description
      FROM events
      ORDER BY id DESC;
    `;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) }),
    };
  }
};