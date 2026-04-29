import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET() {
  try {
    // ✈️ Flights
    await sql`
      INSERT INTO flights (flight_number, origin, destination, etd, eta, status)
      VALUES
      ('EA-101', 'Jakarta (CGK)', 'Singapore (SIN)', '13:20', '15:45', 'departed'),
      ('EA-205', 'Surabaya (SUB)', 'Bangkok (BKK)', '15:30', '18:00', 'on-time'),
      ('EA-312', 'Bali (DPS)', 'Tokyo (NRT)', '16:45', '23:30', 'delayed'),
      ('EA-408', 'Jakarta (CGK)', 'Hong Kong (HKG)', '18:00', '21:45', 'on-time'),
      ('EA-156', 'Medan (KNO)', 'Kuala Lumpur (KUL)', '19:15', '20:30', 'on-time'),
      ('EA-523', 'Jakarta (CGK)', 'Sydney (SYD)', '20:30', '06:15', 'on-time'),
      ('EA-777', 'Bali (DPS)', 'Dubai (DXB)', '21:00', '03:45', 'on-time'),
      ('EA-889', 'Surabaya (SUB)', 'Seoul (ICN)', '22:10', '05:00', 'delayed'),
      ('EA-990', 'Jakarta (CGK)', 'Tokyo (NRT)', '23:00', '06:30', 'on-time'),
      ('EA-321', 'Medan (KNO)', 'Singapore (SIN)', '12:00', '13:45', 'departed')
      ON CONFLICT (flight_number) DO NOTHING;
    `;

    // 📦 Shipments
    await sql`
      INSERT INTO shipments (awb, weight, flight_id, origin, destination, status)
      VALUES
      ('AWB001234567',25.5,(SELECT id FROM flights WHERE flight_number='EA-101'),'Jakarta (CGK)','Singapore (SIN)','in transit'),
      ('AWB002345678',18.2,(SELECT id FROM flights WHERE flight_number='EA-205'),'Surabaya (SUB)','Bangkok (BKK)','received'),
      ('AWB003456789',32.8,(SELECT id FROM flights WHERE flight_number='EA-312'),'Bali (DPS)','Tokyo (NRT)','delivered'),
      ('AWB004567890',100.5,(SELECT id FROM flights WHERE flight_number='EA-408'),'Jakarta (CGK)','Hong Kong (HKG)','in transit'),
      ('AWB005678901',12.4,(SELECT id FROM flights WHERE flight_number='EA-156'),'Medan (KNO)','Kuala Lumpur (KUL)','received'),
      ('AWB006789012',45.7,(SELECT id FROM flights WHERE flight_number='EA-523'),'Jakarta (CGK)','Sydney (SYD)','in transit'),
      ('AWB007890123',28.9,(SELECT id FROM flights WHERE flight_number='EA-777'),'Bali (DPS)','Dubai (DXB)','received'),
      ('AWB008901234',16.3,(SELECT id FROM flights WHERE flight_number='EA-889'),'Surabaya (SUB)','Seoul (ICN)','in transit'),
      ('AWB009012345',22.6,(SELECT id FROM flights WHERE flight_number='EA-990'),'Jakarta (CGK)','Tokyo (NRT)','received'),
      ('AWB010123456',30.1,(SELECT id FROM flights WHERE flight_number='EA-321'),'Medan (KNO)','Singapore (SIN)','delivered')
      ON CONFLICT (awb) DO NOTHING;
    `;

    // 📍 Tracking
    await sql`
      INSERT INTO tracking (shipment_id, location, status)
      VALUES
      ((SELECT id FROM shipments WHERE awb='AWB001234567'),'Jakarta Hub','received'),
      ((SELECT id FROM shipments WHERE awb='AWB001234567'),'Jakarta Airport','departed'),
      ((SELECT id FROM shipments WHERE awb='AWB002345678'),'Surabaya Hub','received'),
      ((SELECT id FROM shipments WHERE awb='AWB002345678'),'Surabaya Airport','loaded'),
      ((SELECT id FROM shipments WHERE awb='AWB003456789'),'Tokyo Airport','arrived'),
      ((SELECT id FROM shipments WHERE awb='AWB004567890'),'Jakarta Hub','received'),
      ((SELECT id FROM shipments WHERE awb='AWB005678901'),'Medan Hub','received'),
      ((SELECT id FROM shipments WHERE awb='AWB006789012'),'Sydney Airport','arrived'),
      ((SELECT id FROM shipments WHERE awb='AWB007890123'),'Bali Hub','received'),
      ((SELECT id FROM shipments WHERE awb='AWB008901234'),'Seoul Airport','arrived')
    `;

    return Response.json({ message: "Seed success 🚀" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}