import { neon } from "@netlify/neon";

export default async (request) => {
  try {
    const body = await request.json();
    const { title, event_date, location = "", description = "" } = body;

    if (!title || !event_date) {
      return new Response(JSON.stringify({ error: "Missing title or event_date" }), { status: 400 });
    }

    const sql = neon();

    const [row] = await sql`
      INSERT INTO events (title, event_date, location, description)
      VALUES (${title}, ${event_date}, ${location}, ${description})
      RETURNING id, title, event_date, location, description;
    `;

    return Response.json({ event: row });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
};