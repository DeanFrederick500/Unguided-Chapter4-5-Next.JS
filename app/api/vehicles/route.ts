import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: "require",
});

export async function GET() {
  try {
    const vehicles = await sql`
      SELECT vehicle_name
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