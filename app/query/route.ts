import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET() {
  try {
    const flights = await sql`SELECT * FROM flights`
    const shipments = await sql`SELECT * FROM shipments`
    const tracking = await sql`SELECT * FROM tracking`

    return Response.json({
      flights,
      shipments,
      tracking
    })
  } catch (error) {
    console.error(error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}