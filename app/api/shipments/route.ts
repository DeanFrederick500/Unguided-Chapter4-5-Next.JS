import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: "require",
});

// =====================================================
// GET
// =====================================================

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const awb = url.searchParams.get("awb");

    const shipments = awb
      ? await sql`

          SELECT

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

            flights.flight_number

          FROM shipments

          LEFT JOIN products
          ON products.shipment_id = shipments.id

          LEFT JOIN transactions
          ON transactions.shipment_id = shipments.id

          LEFT JOIN vehicles
          ON vehicles.id = shipments.vehicle_id

          LEFT JOIN flights
          ON flights.id = shipments.flight_id

          WHERE shipments.awb_number = ${awb}

          ORDER BY shipments.id DESC
        `
      : await sql`

          SELECT

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

            flights.flight_number

          FROM shipments

          LEFT JOIN products
          ON products.shipment_id = shipments.id

          LEFT JOIN transactions
          ON transactions.shipment_id = shipments.id

          LEFT JOIN vehicles
          ON vehicles.id = shipments.vehicle_id

          LEFT JOIN flights
          ON flights.id = shipments.flight_id

          ORDER BY shipments.id DESC
        `;

    return Response.json(shipments);

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


// =====================================================
// POST
// =====================================================

export async function POST(req: Request) {
  try {

    const body = await req.json();

    const {

      awb_number,
      shipment_date,

      sender_name,
      receiver_name,

      phone_number,
      receiver_phone_number,

      origin_city,
      destination_city,

      shipping_type,
      shipment_status,

      vehicle_name,
      flight_number,

      item_name,
      item_type,
      item_description,

      quantity,
      weight,

      item_status,

      shipping_price,
      admin_fee,
      total_price,

      payment_method,
      payment_date,

      transaction_status,

    } = body;

    // =====================================================
    // GET VEHICLE
    // =====================================================

    const vehicle = await sql`

      SELECT id
      FROM vehicles
      WHERE vehicle_name = ${vehicle_name}

    `;

    if (vehicle.length === 0) {

      return Response.json(
        {
          error: "Vehicle tidak ditemukan",
        },
        {
          status: 400,
        }
      );

    }

    // =====================================================
    // GET FLIGHT
    // =====================================================

    let flightData: any[] = [];

    if (flight_number) {

      flightData = await sql`

        SELECT id
        FROM flights
        WHERE flight_number = ${flight_number}

      `;

    }

    // =====================================================
    // INSERT SHIPMENTS
    // =====================================================

    const shipment = await sql`

      INSERT INTO shipments
      (
        awb_number,
        shipment_date,

        sender_name,
        receiver_name,

        phone_number,
        receiver_phone_number,

        origin_city,
        destination_city,

        shipping_type,
        shipment_status,

        vehicle_id,
        flight_id
      )

      VALUES
      (
        ${awb_number},
        ${shipment_date},

        ${sender_name},
        ${receiver_name},

        ${phone_number},
        ${receiver_phone_number},

        ${origin_city},
        ${destination_city},

        ${shipping_type},
        ${shipment_status},

        ${vehicle[0].id},
        ${flightData.length > 0 ? flightData[0].id : null}
      )

      RETURNING id

    `;

    const shipment_id = shipment[0].id;

    // =====================================================
    // INSERT PRODUCTS
    // =====================================================

    await sql`

      INSERT INTO products
      (
        shipment_id,

        item_name,
        item_type,
        item_description,

        quantity,
        weight,

        item_status
      )

      VALUES
      (
        ${shipment_id},

        ${item_name},
        ${item_type},
        ${item_description},

        ${quantity},
        ${weight},

        ${item_status}
      )

    `;

    // =====================================================
    // INSERT TRANSACTIONS
    // =====================================================

    await sql`

      INSERT INTO transactions
      (
        shipment_id,

        shipping_price,
        admin_fee,
        total_price,

        payment_method,
        payment_date,

        transaction_status
      )

      VALUES
      (
        ${shipment_id},

        ${shipping_price},
        ${admin_fee},
        ${total_price},

        ${payment_method},
        ${payment_date},

        ${transaction_status}
      )

    `;

    return Response.json({
      message: "Shipment berhasil ditambahkan",
    });

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


// =====================================================
// DELETE
// =====================================================

export async function DELETE(req: Request) {
  try {

    const { id } = await req.json();

    if (!id) {
      return Response.json(
        { error: "ID shipment diperlukan" },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM tracking
      WHERE shipment_id = ${id}
    `;

    await sql`
      DELETE FROM products
      WHERE shipment_id = ${id}
    `;

    await sql`
      DELETE FROM transactions
      WHERE shipment_id = ${id}
    `;

    await sql`
      DELETE FROM shipments
      WHERE id = ${id}
    `;

    return Response.json({
      message: "Shipment berhasil dihapus",
    });

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


// =====================================================
// PUT
// =====================================================

export async function PUT(req: Request) {
  try {

    const body = await req.json();

    const {

      id,

      shipment_date,

      sender_name,
      receiver_name,

      phone_number,
      receiver_phone_number,

      origin_city,
      destination_city,

      shipping_type,
      shipment_status,

      vehicle_name,
      flight_number,

      item_name,
      item_type,
      item_description,

      quantity,
      weight,

      item_status,

      shipping_price,
      admin_fee,
      total_price,

      payment_method,
      payment_date,

      transaction_status,

    } = body;

    // =====================================================
    // GET VEHICLE
    // =====================================================

    const vehicle = await sql`

      SELECT id
      FROM vehicles
      WHERE vehicle_name = ${vehicle_name}

    `;

    if (vehicle.length === 0) {

      return Response.json(
        {
          error: "Vehicle tidak ditemukan",
        },
        {
          status: 400,
        }
      );

    }

    // =====================================================
    // GET FLIGHT
    // =====================================================

    let flightData: any[] = [];

    if (flight_number) {

      flightData = await sql`

        SELECT id
        FROM flights
        WHERE flight_number = ${flight_number}

      `;

    }

    // =====================================================
    // UPDATE SHIPMENTS
    // =====================================================

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

    // =====================================================
    // UPDATE PRODUCTS
    // =====================================================

    await sql`

      UPDATE products

      SET

        item_name = ${item_name},
        item_type = ${item_type},
        item_description = ${item_description},

        quantity = ${quantity},
        weight = ${weight},

        item_status = ${item_status}

      WHERE shipment_id = ${id}

    `;

    // =====================================================
    // UPDATE TRANSACTIONS
    // =====================================================

    await sql`

      UPDATE transactions

      SET

        shipping_price = ${shipping_price},
        admin_fee = ${admin_fee},
        total_price = ${total_price},

        payment_method = ${payment_method},
        payment_date = ${payment_date},

        transaction_status = ${transaction_status}

      WHERE shipment_id = ${id}

    `;

    return Response.json({
      message: "Shipment berhasil diupdate",
    });

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