import postgres from "postgres";
import { processSimulatedFlights, syncFlightStatusToShipments } from "@/app/lib/db-utils";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// =====================================================
// POST: Start or Stop simulation for a flight
// =====================================================

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { flight_id, action, interval_seconds } = body;

    if (!flight_id || !action) {
      return Response.json({ error: "Missing flight_id or action" }, { status: 400 });
    }

    // Get current flight data
    const flights = await sql`
      SELECT id, origin, destination, status
      FROM flights
      WHERE id = ${flight_id}
    `;

    if (flights.length === 0) {
      return Response.json({ error: "Flight not found" }, { status: 404 });
    }

    const flight = flights[0];

    if (action === "start") {
      const intervalSec = Number(interval_seconds) || 60;

      // Reset flight to Scheduled and set simulation_started_at
      await sql`
        UPDATE flights
        SET
          status = 'Scheduled',
          simulation_started_at = NOW(),
          simulation_interval = ${intervalSec}
        WHERE id = ${flight_id}
      `;

      // Sync shipments to Scheduled
      await syncFlightStatusToShipments(
        flight.id,
        "Scheduled",
        flight.origin,
        flight.destination
      );

      return Response.json({
        message: "Simulation started",
        flight_id,
        interval_seconds: intervalSec,
      });
    }

    if (action === "stop") {
      await sql`
        UPDATE flights
        SET simulation_started_at = NULL
        WHERE id = ${flight_id}
      `;

      return Response.json({
        message: "Simulation stopped",
        flight_id,
      });
    }

    return Response.json({ error: "Invalid action. Use 'start' or 'stop'" }, { status: 400 });

  } catch (error) {
    console.error("Simulation error:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

// =====================================================
// GET: Trigger simulation processing (for polling)
// =====================================================

export async function GET() {
  try {
    await processSimulatedFlights();
    return Response.json({ message: "Simulation processed" });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
