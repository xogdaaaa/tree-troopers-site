const { neon } = require("@netlify/neon");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { title, event_date, location = "", description = "" } = body;

    if (!title || !event_date) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing title or event_date" }) };
    }

    const sql = neon();
    const [row] = await sql`
      INSERT INTO events (title, event_date, location, description)
      VALUES (${title}, ${event_date}, ${location}, ${description})
      RETURNING id, title, event_date, location, description;
    `;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: row }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};