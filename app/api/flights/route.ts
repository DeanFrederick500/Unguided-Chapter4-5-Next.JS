import postgres from "postgres";
import { processSimulatedFlights, syncFlightStatusToShipments } from "@/app/lib/db-utils";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function GET(req: Request) {
  try {
    // Process any active simulations first
    await processSimulatedFlights();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const flights = await sql`
        SELECT f.id, f.flight_number, f.origin, f.destination, f.etd, f.eta, f.status,
               f.vehicle_id, f.created_at, f.simulation_started_at, f.simulation_interval,
               v.vehicle_code, v.vehicle_name, v.load_capacity
        FROM flights f
        LEFT JOIN vehicles v ON f.vehicle_id = v.id
        WHERE f.id = ${id}
      `;

      if (flights.length === 0) {
        return Response.json({ error: "Flight not found" }, { status: 404 });
      }

      return Response.json(flights[0]);
    }

    const flights = await sql`
      SELECT f.id, f.flight_number, f.origin, f.destination, f.etd, f.eta, f.status,
             f.vehicle_id, f.created_at, f.simulation_started_at, f.simulation_interval,
             v.vehicle_code, v.vehicle_name, v.load_capacity
      FROM flights f
      LEFT JOIN vehicles v ON f.vehicle_id = v.id
      ORDER BY f.flight_number ASC
    `;

    return Response.json(flights);
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { flight_number, vehicle_id, origin, destination, etd, eta, status } = body;

    if (!vehicle_id || !origin || !destination || !status) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Auto-generate flight number if not provided
    if (!flight_number || flight_number.trim() === "") {
      let unique = false;
      while (!unique) {
        const randNum = Math.floor(100 + Math.random() * 900);
        flight_number = `EA-${randNum}`;
        const existing = await sql`SELECT id FROM flights WHERE flight_number = ${flight_number}`;
        if (existing.length === 0) {
          unique = true;
        }
      }
    }

    const result = await sql`
      INSERT INTO flights (flight_number, vehicle_id, origin, destination, etd, eta, status, created_at)
      VALUES (${flight_number}, ${vehicle_id}, ${origin}, ${destination}, ${etd || null}, ${eta || null}, ${status}, NOW())
      RETURNING id, flight_number, origin, destination, etd, eta, status, vehicle_id, simulation_started_at, simulation_interval
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("FLIGHTS ERROR FULL:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, flight_number, vehicle_id, origin, destination, etd, eta, status } = body;

    if (!id || !flight_number || !vehicle_id || !origin || !destination || !status) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get old status to check if changed
    const oldFlight = await sql`SELECT status, origin, destination FROM flights WHERE id = ${id}`;
    const oldStatus = oldFlight[0]?.status;

    const result = await sql`
      UPDATE flights
      SET flight_number = ${flight_number},
          vehicle_id = ${vehicle_id},
          origin = ${origin},
          destination = ${destination},
          etd = ${etd || null},
          eta = ${eta || null},
          status = ${status}
      WHERE id = ${id}
      RETURNING id, flight_number, origin, destination, etd, eta, status, vehicle_id, simulation_started_at, simulation_interval
    `;

    if (result.length === 0) {
      return Response.json({ error: "Flight not found" }, { status: 404 });
    }

    // Sync to shipments if status changed
    if (oldStatus !== status) {
      await syncFlightStatusToShipments(Number(id), status, origin, destination);
    }

    return Response.json(result[0]);
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return Response.json({ error: "Missing id or status" }, { status: 400 });
    }

    // Get flight info
    const flights = await sql`SELECT id, origin, destination, status FROM flights WHERE id = ${id}`;
    if (flights.length === 0) {
      return Response.json({ error: "Flight not found" }, { status: 404 });
    }
    const flight = flights[0];
    const oldStatus = flight.status;

    const result = await sql`
      UPDATE flights
      SET status = ${status}
      WHERE id = ${id}
      RETURNING id, flight_number, origin, destination, etd, eta, status, vehicle_id, simulation_started_at, simulation_interval
    `;

    if (result.length === 0) {
      return Response.json({ error: "Flight not found" }, { status: 404 });
    }

    // Sync to shipments if status changed
    if (oldStatus !== status) {
      await syncFlightStatusToShipments(Number(id), status, flight.origin, flight.destination);
    }

    return Response.json(result[0]);
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch (e) {}
    }

    if (!id) {
      return Response.json({ error: "Missing id parameter" }, { status: 400 });
    }

    // Safely update shipments referencing this flight
    await sql`
      UPDATE shipments
      SET flight_id = NULL
      WHERE flight_id = ${id}
    `;

    const result = await sql`
      DELETE FROM flights
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: "Flight not found" }, { status: 404 });
    }

    return Response.json({ message: "Flight deleted successfully", id: result[0].id });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
