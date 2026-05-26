import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: "require",
});

export async function GET() {
  try {
    const flights = await sql`
      SELECT id, flight_number, origin, destination, etd, eta, status
      FROM flights
      ORDER BY flight_number
    `;

    return Response.json(flights.map((flight: any) => ({
      id: flight.id,
      flight_number: flight.flight_number,
      origin: flight.origin,
      destination: flight.destination,
      etd: flight.etd,
      eta: flight.eta,
      status: flight.status,
    })));
  } catch (error) {
    return Response.json(
      {
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return Response.json(
        {
          error: "Missing id or status",
        },
        {
          status: 400,
        }
      );
    }

    const updatedFlights = await sql`
      UPDATE flights
      SET status = ${status}
      WHERE id = ${id}
      RETURNING id, flight_number, origin, destination, etd, eta, status
    `;

    if (!updatedFlights || updatedFlights.length === 0) {
      return Response.json(
        {
          error: "Flight not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(updatedFlights[0]);
  } catch (error) {
    return Response.json(
      {
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}
