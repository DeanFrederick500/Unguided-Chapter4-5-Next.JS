import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// async function listInvoices() {
// 	const data = await sql`
//     SELECT invoices.amount, customers.name
//     FROM invoices
//     JOIN customers ON invoices.customer_id = customers.id
//     WHERE invoices.amount = 666;
//   `;

// 	return data;
// }

export async function GET() {
  try {
    // ✈️ Flights
    await sql`
      INSERT INTO flights (flight_number, origin, destination, etd, eta, status)
      VALUES
      ('EA-101', 'Jakarta (CGK)', 'Singapore (SIN)', '13:20', '15:45', 'departed'),
      ('EA-205', 'Surabaya (SUB)', 'Bangkok (BKK)', '15:30', '18:00', 'on-time'),
      ('EA-312', 'Bali (DPS)', 'Tokyo (NRT)', '16:45', '23:30', 'delayed')
      ON CONFLICT (flight_number) DO NOTHING;
    `

    // 📦 Shipments (pakai subquery biar aman)
    await sql`
      INSERT INTO shipments (awb, weight, flight_id, origin, destination, status)
      VALUES
      (
        'AWB001234567',
        25.5,
        (SELECT id FROM flights WHERE flight_number = 'EA-101'),
        'Jakarta (CGK)',
        'Singapore (SIN)',
        'in transit'
      ),
      (
        'AWB002345678',
        18.2,
        (SELECT id FROM flights WHERE flight_number = 'EA-205'),
        'Surabaya (SUB)',
        'Bangkok (BKK)',
        'received'
      )
      ON CONFLICT (awb) DO NOTHING;
    `

    // 📍 Tracking
    await sql`
      INSERT INTO tracking (shipment_id, location, status)
      VALUES
      (
        (SELECT id FROM shipments WHERE awb = 'AWB001234567'),
        'Jakarta Hub',
        'received'
      ),
      (
        (SELECT id FROM shipments WHERE awb = 'AWB001234567'),
        'Jakarta Hub',
        'sortation'
      ),
      (
        (SELECT id FROM shipments WHERE awb = 'AWB001234567'),
        'Jakarta Airport',
        'loaded to aircraft'
      ),
      (
        (SELECT id FROM shipments WHERE awb = 'AWB001234567'),
        'Jakarta Airport',
        'departed'
      ),
      (
        (SELECT id FROM shipments WHERE awb = 'AWB001234567'),
        'Singapore Airport',
        'arrived'
      ),
      (
        (SELECT id FROM shipments WHERE awb = 'AWB002345678'),
        'Surabaya Hub',
        'received'
      )
    `

    return Response.json({ message: "Seed success 🚀" })
  } catch (error) {
    console.error(error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}