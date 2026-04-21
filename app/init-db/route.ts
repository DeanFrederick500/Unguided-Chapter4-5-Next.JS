import postgres from "postgres"

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" })

export async function GET() {
  try {
    // ✈️ Flights
    await sql`
      CREATE TABLE IF NOT EXISTS flights (
        id SERIAL PRIMARY KEY,
        flight_number VARCHAR(10) UNIQUE,
        origin VARCHAR(50),
        destination VARCHAR(50),
        etd TIME,
        eta TIME,
        status VARCHAR(20)
      );
    `

    // 📦 Shipments
    await sql`
      CREATE TABLE IF NOT EXISTS shipments (
        id SERIAL PRIMARY KEY,
        awb VARCHAR(20) UNIQUE,
        weight DECIMAL,
        flight_id INTEGER REFERENCES flights(id),
        origin VARCHAR(50),
        destination VARCHAR(50),
        status VARCHAR(20)
      );
    `

    // 📍 Tracking
    await sql`
      CREATE TABLE IF NOT EXISTS tracking (
        id SERIAL PRIMARY KEY,
        shipment_id INTEGER REFERENCES shipments(id),
        location VARCHAR(100),
        status VARCHAR(50),
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `

    return Response.json({ message: "Tables created ✅" })
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Failed ❌" }, { status: 500 })
  }
}