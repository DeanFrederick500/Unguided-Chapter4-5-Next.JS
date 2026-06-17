import postgres from "postgres";
import { processSimulatedFlights, getTrackingDescription } from "@/app/lib/db-utils";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// =====================================================
// GET
// =====================================================

export async function GET(req: Request) {
  try {
    // Process any active simulations first
    await processSimulatedFlights();

    const url = new URL(req.url);
    const awb = url.searchParams.get("awb");

    const shipments = awb
      ? await sql`
          SELECT DISTINCT ON (shipments.id)
            shipments.id,
            shipments.awb_number,
            shipments.shipment_date,
            shipments.sender_name,
            shipments.receiver_name,
            shipments.phone_number,
            shipments.receiver_phone_number,
            shipments.origin_city,
            shipments.destination_city,
            shipments.shipping_type,
            shipments.shipment_status,
            products.item_name,
            products.item_type,
            products.item_description,
            products.quantity,
            products.weight,
            products.item_status,
            transactions.shipping_price,
            transactions.admin_fee,
            transactions.total_price,
            transactions.payment_method,
            transactions.payment_date,
            transactions.transaction_status,
            vehicles.vehicle_name,
            vehicles.vehicle_type,
            vehicles.vehicle_code,
            flights.flight_number,
            flights.etd,
            flights.status AS flight_status
          FROM shipments
          LEFT JOIN products ON products.shipment_id = shipments.id
          LEFT JOIN transactions ON transactions.shipment_id = shipments.id
          LEFT JOIN vehicles ON vehicles.id = shipments.vehicle_id
          LEFT JOIN flights ON flights.id = shipments.flight_id
          WHERE shipments.awb_number = ${awb}
          ORDER BY shipments.id DESC
        `
      : await sql`
          SELECT DISTINCT ON (shipments.id)
            shipments.id,
            shipments.awb_number,
            shipments.shipment_date,
            shipments.sender_name,
            shipments.receiver_name,
            shipments.phone_number,
            shipments.receiver_phone_number,
            shipments.origin_city,
            shipments.destination_city,
            shipments.shipping_type,
            shipments.shipment_status,
            products.item_name,
            products.item_type,
            products.item_description,
            products.quantity,
            products.weight,
            products.item_status,
            transactions.shipping_price,
            transactions.admin_fee,
            transactions.total_price,
            transactions.payment_method,
            transactions.payment_date,
            transactions.transaction_status,
            vehicles.vehicle_name,
            vehicles.vehicle_type,
            vehicles.vehicle_code,
            flights.flight_number,
            flights.etd,
            flights.status AS flight_status
          FROM shipments
          LEFT JOIN products ON products.shipment_id = shipments.id
          LEFT JOIN transactions ON transactions.shipment_id = shipments.id
          LEFT JOIN vehicles ON vehicles.id = shipments.vehicle_id
          LEFT JOIN flights ON flights.id = shipments.flight_id
          ORDER BY shipments.id DESC
        `;

    // If querying by AWB, also fetch tracking history
    if (awb && shipments.length > 0) {
      const shipmentId = shipments[0].id;
      const tracking = await sql`
        SELECT id, location, status, description, tracked_at
        FROM tracking
        WHERE shipment_id = ${shipmentId}
        ORDER BY tracked_at ASC
      `;
      const result = { ...shipments[0], tracking_history: tracking };
      return Response.json([result]);
    }

    return Response.json(shipments);
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}


// =====================================================
// POST
// =====================================================

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      awb_number, shipment_date,
      sender_name, receiver_name,
      phone_number, receiver_phone_number,
      origin_city, destination_city,
      shipping_type, shipment_status,
      vehicle_name, flight_number,
      item_name, item_type, item_description,
      quantity, weight, item_status,
      shipping_price, admin_fee, total_price,
      payment_method, payment_date, transaction_status,
    } = body;

    const vehicle = await sql`SELECT id FROM vehicles WHERE vehicle_name = ${vehicle_name}`;
    if (vehicle.length === 0) {
      return Response.json({ error: "Vehicle tidak ditemukan" }, { status: 400 });
    }

    let flightData: any[] = [];
    if (flight_number) {
      flightData = await sql`SELECT id, status, origin, destination FROM flights WHERE flight_number = ${flight_number}`;
    }

    // Determine initial shipment status
    let initialStatus = shipment_status;
    if (flightData.length > 0 && flightData[0].status) {
      const syncableStatuses = ["Scheduled", "Departed", "Delayed", "In Transit", "Landed"];
      if (syncableStatuses.includes(flightData[0].status)) {
        initialStatus = flightData[0].status;
      }
    }

    const shipment = await sql`
      INSERT INTO shipments (
        awb_number, shipment_date,
        sender_name, receiver_name,
        phone_number, receiver_phone_number,
        origin_city, destination_city,
        shipping_type, shipment_status,
        vehicle_id, flight_id
      )
      VALUES (
        ${awb_number}, ${shipment_date},
        ${sender_name}, ${receiver_name},
        ${phone_number}, ${receiver_phone_number},
        ${origin_city}, ${destination_city},
        ${shipping_type}, ${initialStatus},
        ${vehicle[0].id},
        ${flightData.length > 0 ? flightData[0].id : null}
      )
      RETURNING id
    `;

    const shipment_id = shipment[0].id;

    // Insert initial tracking event: Received
    const { location: recLoc, description: recDesc } = getTrackingDescription("Received", origin_city, destination_city);
    await sql`
      INSERT INTO tracking (shipment_id, location, status, description, tracked_at)
      VALUES (${shipment_id}, ${recLoc}, 'Received', ${recDesc}, NOW())
    `;

    // Insert additional tracking event if status is beyond Received
    if (initialStatus !== "Received" && initialStatus !== shipment_status) {
      const { location, description } = getTrackingDescription(initialStatus, origin_city, destination_city);
      await sql`
        INSERT INTO tracking (shipment_id, location, status, description, tracked_at)
        VALUES (${shipment_id}, ${location}, ${initialStatus}, ${description}, NOW())
      `;
    }

    await sql`
      INSERT INTO products (shipment_id, item_name, item_type, item_description, quantity, weight, item_status)
      VALUES (${shipment_id}, ${item_name}, ${item_type}, ${item_description}, ${quantity}, ${weight}, ${item_status})
    `;

    await sql`
      INSERT INTO transactions (shipment_id, shipping_price, admin_fee, total_price, payment_method, payment_date, transaction_status)
      VALUES (${shipment_id}, ${shipping_price}, ${admin_fee}, ${total_price}, ${payment_method}, ${payment_date}, ${transaction_status})
    `;

    return Response.json({ message: "Shipment berhasil ditambahkan" });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}


// =====================================================
// DELETE
// =====================================================

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return Response.json({ error: "ID shipment diperlukan" }, { status: 400 });
    }

    await sql`DELETE FROM tracking WHERE shipment_id = ${id}`;
    await sql`DELETE FROM products WHERE shipment_id = ${id}`;
    await sql`DELETE FROM transactions WHERE shipment_id = ${id}`;
    await sql`DELETE FROM shipments WHERE id = ${id}`;

    return Response.json({ message: "Shipment berhasil dihapus" });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}


// =====================================================
// PUT
// =====================================================

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id, shipment_date,
      sender_name, receiver_name,
      phone_number, receiver_phone_number,
      origin_city, destination_city,
      shipping_type, shipment_status,
      vehicle_name, flight_number,
      item_name, item_type, item_description,
      quantity, weight, item_status,
      shipping_price, admin_fee, total_price,
      payment_method, payment_date, transaction_status,
    } = body;

    const vehicle = await sql`SELECT id FROM vehicles WHERE vehicle_name = ${vehicle_name}`;
    if (vehicle.length === 0) {
      return Response.json({ error: "Vehicle tidak ditemukan" }, { status: 400 });
    }

    let flightData: any[] = [];
    if (flight_number) {
      flightData = await sql`SELECT id FROM flights WHERE flight_number = ${flight_number}`;
    }

    // Get old status to detect changes
    const oldShipment = await sql`SELECT shipment_status, origin_city, destination_city FROM shipments WHERE id = ${id}`;
    const oldStatus = oldShipment[0]?.shipment_status;

    await sql`
      UPDATE shipments
      SET
        shipment_date = ${shipment_date},
        sender_name = ${sender_name},
        receiver_name = ${receiver_name},
        phone_number = ${phone_number},
        receiver_phone_number = ${receiver_phone_number},
        origin_city = ${origin_city},
        destination_city = ${destination_city},
        shipping_type = ${shipping_type},
        shipment_status = ${shipment_status},
        vehicle_id = ${vehicle[0].id},
        flight_id = ${flightData.length > 0 ? flightData[0].id : null}
      WHERE id = ${id}
    `;

    // If status changed, add a new tracking event
    if (oldStatus !== shipment_status) {
      const { location, description } = getTrackingDescription(
        shipment_status,
        origin_city,
        destination_city
      );

      // Check if tracking entry for this status already exists
      const existing = await sql`
        SELECT id FROM tracking
        WHERE shipment_id = ${id} AND LOWER(status) = LOWER(${shipment_status})
      `;
      if (existing.length === 0) {
        await sql`
          INSERT INTO tracking (shipment_id, location, status, description, tracked_at)
          VALUES (${id}, ${location}, ${shipment_status}, ${description}, NOW())
        `;
      }
    }

    await sql`
      UPDATE products
      SET item_name = ${item_name}, item_type = ${item_type}, item_description = ${item_description},
          quantity = ${quantity}, weight = ${weight}, item_status = ${item_status}
      WHERE shipment_id = ${id}
    `;

    await sql`
      UPDATE transactions
      SET shipping_price = ${shipping_price}, admin_fee = ${admin_fee}, total_price = ${total_price},
          payment_method = ${payment_method}, payment_date = ${payment_date},
          transaction_status = ${transaction_status}
      WHERE shipment_id = ${id}
    `;

    return Response.json({ message: "Shipment berhasil diupdate" });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}