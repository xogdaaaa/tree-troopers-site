import { neon } from "@netlify/neon";

export default async () => {
  try {
    const sql = neon();

    const events = await sql`
      SELECT id, title, event_date, location, description
      FROM events
      ORDER BY id DESC;
    `;

    return Response.json({ events });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
};