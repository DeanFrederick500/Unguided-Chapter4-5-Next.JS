import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// =====================================================
// FLIGHT STATUS ORDER
// =====================================================

export const FLIGHT_STATUS_ORDER = ["Scheduled", "Departed", "In Transit", "Landed"];

// =====================================================
// GET COMPUTED FLIGHT STATUS FROM SIMULATION
// =====================================================

export function computeSimulatedStatus(
  simulationStartedAt: Date | string | null,
  intervalSeconds: number,
  currentStatus: string
): string {
  if (!simulationStartedAt) return currentStatus;

  const startTime = new Date(simulationStartedAt).getTime();
  const nowTime = Date.now();
  const elapsedMs = nowTime - startTime;
  const elapsedSec = elapsedMs / 1000;

  if (elapsedSec < intervalSeconds) return "Scheduled";
  if (elapsedSec < intervalSeconds * 2) return "Departed";
  if (elapsedSec < intervalSeconds * 3) return "In Transit";
  return "Landed";
}

// =====================================================
// GET TRACKING DESCRIPTION BY STATUS
// =====================================================

export function getTrackingDescription(
  status: string,
  origin: string,
  destination: string
): { location: string; description: string } {
  switch (status.toLowerCase()) {
    case "received":
      return {
        location: `${origin} Hub`,
        description: `Cargo diterima di ${origin}. Siap untuk diproses.`,
      };
    case "scheduled":
      return {
        location: `${origin} Airport`,
        description: `Cargo dijadwalkan untuk dikirim via penerbangan dari ${origin} ke ${destination}.`,
      };
    case "departed":
      return {
        location: `${origin} Airport`,
        description: `Pesawat cargo telah berangkat dari ${origin} menuju ${destination}.`,
      };
    case "in transit":
      return {
        location: `In Transit (${origin} → ${destination})`,
        description: `Cargo sedang dalam perjalanan di udara menuju ${destination}.`,
      };
    case "landed":
      return {
        location: `${destination} Airport`,
        description: `Pesawat cargo telah mendarat di ${destination}. Cargo siap diserahkan.`,
      };
    case "delayed":
      return {
        location: `${origin} Airport`,
        description: `Penerbangan mengalami keterlambatan. Cargo menunggu jadwal baru.`,
      };
    case "delivered":
      return {
        location: `${destination}`,
        description: `Cargo telah berhasil diserahkan kepada penerima di ${destination}.`,
      };
    default:
      return {
        location: origin,
        description: `Status cargo: ${status}`,
      };
  }
}

// =====================================================
// SYNC FLIGHT STATUS TO SHIPMENTS + TRACKING
// =====================================================

export async function syncFlightStatusToShipments(
  flightId: number,
  newStatus: string,
  origin: string,
  destination: string
) {
  // Only sync flight-controlled statuses
  const syncableStatuses = ["Scheduled", "Departed", "Delayed", "In Transit", "Landed"];
  if (!syncableStatuses.includes(newStatus)) return;

  // Get shipments linked to this flight
  const shipments = await sql`
    SELECT id, shipment_status, origin_city, destination_city
    FROM shipments
    WHERE flight_id = ${flightId}
    AND shipment_status NOT IN ('Delivered')
  `;

  for (const shipment of shipments) {
    const shipOrigin = shipment.origin_city || origin;
    const shipDest = shipment.destination_city || destination;

    // Update shipment status
    await sql`
      UPDATE shipments
      SET shipment_status = ${newStatus}
      WHERE id = ${shipment.id}
    `;

    // Check if a tracking entry for this status already exists
    const existing = await sql`
      SELECT id FROM tracking
      WHERE shipment_id = ${shipment.id}
      AND LOWER(status) = LOWER(${newStatus})
    `;

    if (existing.length === 0) {
      const { location, description } = getTrackingDescription(newStatus, shipOrigin, shipDest);

      await sql`
        INSERT INTO tracking (shipment_id, location, status, description, tracked_at)
        VALUES (${shipment.id}, ${location}, ${newStatus}, ${description}, NOW())
      `;
    }
  }
}

// =====================================================
// PROCESS SIMULATED FLIGHTS (CALLED ON GET)
// =====================================================

export async function processSimulatedFlights() {
  // Get all flights that are currently in simulation mode
  const simFlights = await sql`
    SELECT id, status, origin, destination, simulation_started_at, simulation_interval
    FROM flights
    WHERE simulation_started_at IS NOT NULL
  `;

  for (const flight of simFlights) {
    const newStatus = computeSimulatedStatus(
      flight.simulation_started_at,
      flight.simulation_interval || 60,
      flight.status
    );

    if (newStatus !== flight.status) {
      await sql`
        UPDATE flights SET status = ${newStatus} WHERE id = ${flight.id}
      `;

      await syncFlightStatusToShipments(
        flight.id,
        newStatus,
        flight.origin,
        flight.destination
      );

      // Stop simulation when Landed
      if (newStatus === "Landed") {
        await sql`
          UPDATE flights SET simulation_started_at = NULL WHERE id = ${flight.id}
        `;
      }
    }
  }
}
