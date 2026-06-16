import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: "require",
});

export async function GET() {
  try {
    // =====================================================
    // ✈️ VEHICLES
    // =====================================================

    await sql`
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,

        vehicle_name VARCHAR(100),
        vehicle_type VARCHAR(50),
        vehicle_code VARCHAR(20) UNIQUE,

        load_capacity DECIMAL,

        vehicle_status VARCHAR(30),

        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // =====================================================
    // ✈️ FLIGHTS
    // =====================================================

    await sql`
      CREATE TABLE IF NOT EXISTS flights (
        id SERIAL PRIMARY KEY,

        flight_number VARCHAR(20) UNIQUE,

        origin VARCHAR(100),
        destination VARCHAR(100),

        etd TIME,
        eta TIME,

        status VARCHAR(30),

        vehicle_id INTEGER REFERENCES vehicles(id)
      );
    `;

    await sql`
      ALTER TABLE flights ADD COLUMN IF NOT EXISTS vehicle_id INTEGER REFERENCES vehicles(id);
    `;

    // =====================================================
    // 📦 SHIPMENTS
    // =====================================================

    await sql`
      CREATE TABLE IF NOT EXISTS shipments (
        id SERIAL PRIMARY KEY,

        awb_number VARCHAR(20) UNIQUE,
        shipment_date DATE,

        sender_name VARCHAR(100),
        receiver_name VARCHAR(100),

        phone_number VARCHAR(20),
        receiver_phone_number VARCHAR(20),

        origin_city VARCHAR(100),
        destination_city VARCHAR(100),

        shipping_type VARCHAR(30),
        shipment_status VARCHAR(30),

        vehicle_id INTEGER REFERENCES vehicles(id),
        flight_id INTEGER REFERENCES flights(id),

        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // =====================================================
    // 📦 PRODUCTS
    // =====================================================

    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,

        shipment_id INTEGER REFERENCES shipments(id),

        item_name VARCHAR(100),
        item_type VARCHAR(100),
        item_description TEXT,

        quantity INTEGER,
        weight DECIMAL,

        item_status VARCHAR(50),

        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // =====================================================
    // 💳 TRANSACTIONS
    // =====================================================

    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,

        shipment_id INTEGER REFERENCES shipments(id),

        shipping_price DECIMAL,
        admin_fee DECIMAL,
        total_price DECIMAL,

        payment_method VARCHAR(50),
        payment_date DATE,

        transaction_status VARCHAR(30),

        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // =====================================================
    // 📍 TRACKING
    // =====================================================

    await sql`
      CREATE TABLE IF NOT EXISTS tracking (
        id SERIAL PRIMARY KEY,

        shipment_id INTEGER REFERENCES shipments(id),

        location VARCHAR(100),
        status VARCHAR(50),
        description TEXT,

        tracked_at TIMESTAMP DEFAULT NOW()
      );
    `;

    return Response.json({
      message: "Tables created successfully ✅",
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Failed to create tables ❌",
      },
      {
        status: 500,
      }
    );
  }
}