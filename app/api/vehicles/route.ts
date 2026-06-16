import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: "require",
});

export async function GET() {
  try {
    const vehicles = await sql`
      SELECT id, vehicle_name, vehicle_code, load_capacity, vehicle_status
      FROM vehicles
      ORDER BY vehicle_name ASC
    `;

    return Response.json(vehicles);
  } catch (error) {
    return Response.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}