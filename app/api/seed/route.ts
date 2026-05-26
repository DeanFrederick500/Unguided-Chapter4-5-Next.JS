// import postgres from 'postgres';

// const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// export async function GET() {
//   try {
//     // ✈️ Flights
//     await sql`
//       INSERT INTO flights (flight_number, origin, destination, etd, eta, status)
//       VALUES
//       ('EA-101', 'Jakarta (CGK)', 'Singapore (SIN)', '13:20', '15:45', 'departed'),
//       ('EA-205', 'Surabaya (SUB)', 'Bangkok (BKK)', '15:30', '18:00', 'on-time'),
//       ('EA-312', 'Bali (DPS)', 'Tokyo (NRT)', '16:45', '23:30', 'delayed'),
//       ('EA-408', 'Jakarta (CGK)', 'Hong Kong (HKG)', '18:00', '21:45', 'on-time'),
//       ('EA-156', 'Medan (KNO)', 'Kuala Lumpur (KUL)', '19:15', '20:30', 'on-time'),
//       ('EA-523', 'Jakarta (CGK)', 'Sydney (SYD)', '20:30', '06:15', 'on-time'),
//       ('EA-777', 'Bali (DPS)', 'Dubai (DXB)', '21:00', '03:45', 'on-time'),
//       ('EA-889', 'Surabaya (SUB)', 'Seoul (ICN)', '22:10', '05:00', 'delayed'),
//       ('EA-990', 'Jakarta (CGK)', 'Tokyo (NRT)', '23:00', '06:30', 'on-time'),
//       ('EA-321', 'Medan (KNO)', 'Singapore (SIN)', '12:00', '13:45', 'departed')
//       ON CONFLICT (flight_number) DO NOTHING;
//     `;

//     // 📦 Shipments
//     await sql`
// INSERT INTO shipments 
// (
//   awb,

//   shipping_date,

//   sender_name,
//   receiver_name,
//   phone_number,

//   origin,
//   destination,

//   item_type,

//   weight,

//   shipping_cost,

//   vehicle_type,

//   shipping_type,

//   description,

//   status,

//   flight_id
// )

// VALUES

// (
//   'AWB001234567',
//   '2026-05-01',
//   'Budi',
//   'Andi',
//   '081234567890',
//   'Jakarta (CGK)',
//   'Singapore (SIN)',
//   'Elektronik',
//   25.5,
//   1500000,
//   'Pesawat Cargo',
//   'Cepat',
//   'Laptop dan aksesoris',
//   'In Transit',
//   (SELECT id FROM flights WHERE flight_number='EA-101')
// ),

// (
//   'AWB002345678',
//   '2026-05-02',
//   'Rina',
//   'Siska',
//   '081298765432',
//   'Surabaya (SUB)',
//   'Bangkok (BKK)',
//   'Pakaian',
//   18.2,
//   1200000,
//   'Pesawat Cargo',
//   'Biasa',
//   'Baju impor',
//   'Received',
//   (SELECT id FROM flights WHERE flight_number='EA-205')
// ),

// (
//   'AWB003456789',
//   '2026-05-03',
//   'Doni',
//   'Kevin',
//   '082211223344',
//   'Bali (DPS)',
//   'Tokyo (NRT)',
//   'Makanan',
//   32.8,
//   2500000,
//   'Pesawat Cargo',
//   'VVIP',
//   'Frozen food',
//   'Delivered',
//   (SELECT id FROM flights WHERE flight_number='EA-312')
// ),

// (
//   'AWB004567890',
//   '2026-05-04',
//   'Agus',
//   'Mira',
//   '081377788899',
//   'Jakarta (CGK)',
//   'Hong Kong (HKG)',
//   'Furniture',
//   100.5,
//   5000000,
//   'Pesawat Besar',
//   'Cepat',
//   'Kursi dan meja',
//   'In Transit',
//   (SELECT id FROM flights WHERE flight_number='EA-408')
// ),

// (
//   'AWB005678901',
//   '2026-05-05',
//   'Sari',
//   'Lina',
//   '081355566677',
//   'Medan (KNO)',
//   'Kuala Lumpur (KUL)',
//   'Kosmetik',
//   12.4,
//   900000,
//   'Pesawat Cargo',
//   'Biasa',
//   'Produk skincare',
//   'Received',
//   (SELECT id FROM flights WHERE flight_number='EA-156')
// ),

// (
//   'AWB006789012',
//   '2026-05-06',
//   'Robby',
//   'Aldo',
//   '082244455566',
//   'Jakarta (CGK)',
//   'Sydney (SYD)',
//   'Elektronik',
//   45.7,
//   4200000,
//   'Pesawat Besar',
//   'Cepat',
//   'TV dan monitor',
//   'In Transit',
//   (SELECT id FROM flights WHERE flight_number='EA-523')
// ),

// (
//   'AWB007890123',
//   '2026-05-07',
//   'Nina',
//   'Clara',
//   '081399900011',
//   'Bali (DPS)',
//   'Dubai (DXB)',
//   'Aksesoris',
//   28.9,
//   3100000,
//   'Pesawat Cargo',
//   'VVIP',
//   'Jam tangan',
//   'Received',
//   (SELECT id FROM flights WHERE flight_number='EA-777')
// ),

// (
//   'AWB008901234',
//   '2026-05-08',
//   'Hendra',
//   'Rio',
//   '082122233344',
//   'Surabaya (SUB)',
//   'Seoul (ICN)',
//   'Dokumen',
//   16.3,
//   1800000,
//   'Pesawat Cargo',
//   'Cepat',
//   'Dokumen penting',
//   'In Transit',
//   (SELECT id FROM flights WHERE flight_number='EA-889')
// ),

// (
//   'AWB009012345',
//   '2026-05-09',
//   'Fajar',
//   'Dimas',
//   '081233344455',
//   'Jakarta (CGK)',
//   'Tokyo (NRT)',
//   'Sparepart',
//   22.6,
//   2600000,
//   'Pesawat Besar',
//   'Biasa',
//   'Sparepart motor',
//   'Received',
//   (SELECT id FROM flights WHERE flight_number='EA-990')
// ),

// (
//   'AWB010123456',
//   '2026-05-10',
//   'Tono',
//   'Reza',
//   '082200011122',
//   'Medan (KNO)',
//   'Singapore (SIN)',
//   'Obat-obatan',
//   30.1,
//   1400000,
//   'Pesawat Cargo',
//   'Cepat',
//   'Obat rumah sakit',
//   'Delivered',
//   (SELECT id FROM flights WHERE flight_number='EA-321')
// )

// ON CONFLICT (awb) DO NOTHING;
// `;
//     // 📍 Tracking
//     await sql`
//       INSERT INTO tracking (shipment_id, location, status)
//       VALUES
//       ((SELECT id FROM shipments WHERE awb='AWB001234567'),'Jakarta Hub','received'),
//       ((SELECT id FROM shipments WHERE awb='AWB001234567'),'Jakarta Airport','departed'),
//       ((SELECT id FROM shipments WHERE awb='AWB002345678'),'Surabaya Hub','received'),
//       ((SELECT id FROM shipments WHERE awb='AWB002345678'),'Surabaya Airport','loaded'),
//       ((SELECT id FROM shipments WHERE awb='AWB003456789'),'Tokyo Airport','arrived'),
//       ((SELECT id FROM shipments WHERE awb='AWB004567890'),'Jakarta Hub','received'),
//       ((SELECT id FROM shipments WHERE awb='AWB005678901'),'Medan Hub','received'),
//       ((SELECT id FROM shipments WHERE awb='AWB006789012'),'Sydney Airport','arrived'),
//       ((SELECT id FROM shipments WHERE awb='AWB007890123'),'Bali Hub','received'),
//       ((SELECT id FROM shipments WHERE awb='AWB008901234'),'Seoul Airport','arrived')
//     `;

//     return Response.json({ message: "Seed success 🚀" });
//   } catch (error) {
//     console.error(error);
//     return Response.json({ error: String(error) }, { status: 500 });
//   }
// }

import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: 'require',
});

export async function GET() {
  try {
    // =====================================================
    // VEHICLES
    // =====================================================

    await sql`
      INSERT INTO vehicles
      (
        vehicle_name,
        vehicle_type,
        vehicle_code,
        load_capacity,
        vehicle_status,
        created_at
      )
      VALUES
      ('Cargo Aircraft Boeing 737', 'Aircraft', 'AIR-001', 25000, 'active', NOW()),
      ('Cargo Aircraft Airbus A320', 'Aircraft', 'AIR-002', 22000, 'active', NOW()),
      ('Cargo Aircraft Boeing 777F', 'Aircraft', 'AIR-003', 35000, 'active', NOW()),
      ('Cargo Aircraft ATR 72', 'Aircraft', 'AIR-004', 12000, 'maintenance', NOW()),
      ('Cargo Aircraft Cessna Caravan', 'Aircraft', 'AIR-005', 5000, 'active', NOW()),
      ('Cargo Aircraft Boeing 747F', 'Aircraft', 'AIR-006', 50000, 'active', NOW()),
      ('Cargo Aircraft Airbus Beluga', 'Aircraft', 'AIR-007', 47000, 'active', NOW()),
      ('Cargo Aircraft Embraer E190F', 'Aircraft', 'AIR-008', 18000, 'active', NOW()),
      ('Cargo Aircraft Antonov AN-124', 'Aircraft', 'AIR-009', 75000, 'active', NOW()),
      ('Cargo Aircraft Airbus A330F', 'Aircraft', 'AIR-010', 40000, 'active', NOW())
      ON CONFLICT DO NOTHING;
    `;

    // =====================================================
    // FLIGHTS
    // =====================================================

    await sql`
      INSERT INTO flights
      (
        flight_number,
        origin,
        destination,
        etd,
        eta,
        status
      )
      VALUES
      ('GA-101', 'Soekarno Hatta International Airport', 'Singapore Changi Airport', '08:00', '10:00', 'Scheduled'),
      ('GA-202', 'Juanda International Airport', 'Suvarnabhumi Airport', '10:00', '13:00', 'Departed'),
      ('GA-303', 'Ngurah Rai International Airport', 'Narita International Airport', '13:00', '21:00', 'Delayed'),
      ('GA-404', 'Soekarno Hatta International Airport', 'Hong Kong International Airport', '15:00', '20:00', 'In Transit'),
      ('GA-505', 'Kualanamu International Airport', 'Kuala Lumpur International Airport', '18:00', '20:00', 'Landed')
      ON CONFLICT (flight_number) DO NOTHING;
    `;

    // =====================================================
    // SHIPMENTS
    // =====================================================

    await sql`
      INSERT INTO shipments
      (
        awb_number,
        shipment_date,

        sender_name,
        receiver_name,
        phone_number,

        origin_city,
        destination_city,

        shipping_type,
        shipment_status,

        vehicle_id,
        flight_id,

        created_at
      )
      VALUES

      (
        'AWB00000001',
        '2026-05-01',
        'Budi Santoso',
        'Andi Wijaya',
        '081234567890',
        'Jakarta',
        'Bandung',
        'Small Cargo',
        'Delivered',
        1,
        NULL,
        NOW()
      ),

      (
        'AWB00000002',
        '2026-05-02',
        'Siti Rahma',
        'Dewi Lestari',
        '081355566677',
        'Surabaya',
        'Malang',
        'Medium Cargo',
        'In Transit',
        2,
        NULL,
        NOW()
      ),

      (
        'AWB00000003',
        '2026-05-03',
        'Robby Saputra',
        'Kevin Jonathan',
        '082211223344',
        'Jakarta',
        'Singapore',
        'Large Cargo',
        'Delivered',
        6,
        1,
        NOW()
      ),

      (
        'AWB00000004',
        '2026-05-04',
        'Agus Salim',
        'Clara Monica',
        '081377788899',
        'Bali',
        'Tokyo',
        'Heavy Cargo',
        'In Transit',
        7,
        3,
        NOW()
      ),

      (
        'AWB00000005',
        '2026-05-05',
        'Tono Setiawan',
        'Rio Saputra',
        '081288899900',
        'Medan',
        'Kuala Lumpur',
        'Medium Cargo',
        'Pending',
        3,
        5,
        NOW()
      ),

      (
        'AWB00000006',
        '2026-05-06',
        'Lina Marlina',
        'Rina Putri',
        '081277766655',
        'Yogyakarta',
        'Semarang',
        'Small Cargo',
        'Delivered',
        10,
        NULL,
        NOW()
      ),

      (
        'AWB00000007',
        '2026-05-07',
        'Fajar Nugroho',
        'Aldo Pratama',
        '082233344455',
        'Jakarta',
        'Hongkong',
        'Heavy Cargo',
        'In Transit',
        6,
        4,
        NOW()
      ),

      (
        'AWB00000008',
        '2026-05-08',
        'Nina Oktavia',
        'Mira Angel',
        '081399988877',
        'Surabaya',
        'Bangkok',
        'Medium Cargo',
        'Delivered',
        2,
        2,
        NOW()
      ),

      (
        'AWB00000009',
        '2026-05-09',
        'Dimas Prakoso',
        'Reza Mahendra',
        '081244455566',
        'Bandung',
        'Jakarta',
        'Small Cargo',
        'Pending',
        5,
        NULL,
        NOW()
      ),

      (
        'AWB00000010',
        '2026-05-10',
        'Salsa Putri',
        'Cindy Natalia',
        '081366677788',
        'Solo',
        'Semarang',
        'Large Cargo',
        'In Transit',
        3,
        NULL,
        NOW()
      )
      ON CONFLICT (awb_number) DO NOTHING;
    `;

    // =====================================================
    // PRODUCTS
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
        item_status,
        created_at
      )
      VALUES

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000001'), 'Medical Equipment', 'Healthcare Cargo', 'Peralatan medis rumah sakit', 3, 45.0, 'fragile', NOW()),
      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000001'), 'Vaccines Container', 'Pharmaceutical Cargo', 'Kontainer vaksin suhu dingin', 2, 60.0, 'priority', NOW()),

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000002'), 'Electronic Components', 'Electronic Cargo', 'Komponen server dan komputer', 15, 180.0, 'safe', NOW()),
      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000002'), 'Networking Devices', 'Technology Cargo', 'Perangkat jaringan perusahaan', 10, 140.0, 'safe', NOW()),

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000003'), 'Luxury Watches', 'Luxury Cargo', 'Jam tangan premium internasional', 8, 25.0, 'high-security', NOW()),
      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000003'), 'Jewelry Package', 'Valuable Cargo', 'Perhiasan emas dan berlian', 5, 15.0, 'high-security', NOW()),

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000004'), 'Industrial Machine Parts', 'Industrial Cargo', 'Suku cadang mesin industri', 4, 950.0, 'heavy', NOW()),
      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000004'), 'Factory Equipment', 'Heavy Equipment Cargo', 'Peralatan pabrik', 2, 1200.0, 'heavy', NOW()),

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000005'), 'Frozen Seafood', 'Perishable Cargo', 'Makanan laut beku ekspor', 25, 400.0, 'cold-storage', NOW()),

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000006'), 'Official Documents', 'Document Cargo', 'Dokumen legal perusahaan', 5, 8.0, 'priority', NOW()),

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000007'), 'Aircraft Turbine Parts', 'Aviation Cargo', 'Komponen mesin pesawat', 3, 1500.0, 'heavy', NOW()),

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000008'), 'Premium Fashion Products', 'Fashion Cargo', 'Produk fashion premium', 20, 120.0, 'safe', NOW()),

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000009'), 'Automotive Batteries', 'Hazardous Cargo', 'Baterai kendaraan listrik', 10, 600.0, 'restricted', NOW()),

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000010'), 'Urgent Medical Supplies', 'Emergency Cargo', 'Logistik medis darurat', 12, 95.0, 'priority', NOW());
    `;

    // =====================================================
    // TRANSACTIONS
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
        transaction_status,
        created_at
      )
      VALUES

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000001'), 150000, 5000, 155000, 'Transfer Bank', '2026-05-01', 'paid', NOW()),
      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000002'), 200000, 5000, 205000, 'QRIS', '2026-05-02', 'paid', NOW()),
      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000003'), 3500000, 10000, 3510000, 'Credit Card', '2026-05-03', 'paid', NOW()),
      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000004'), 5000000, 10000, 5010000, 'Transfer Bank', '2026-05-04', 'paid', NOW()),
      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000005'), 750000, 5000, 755000, 'Cash', '2026-05-05', 'pending', NOW()),
      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000006'), 100000, 5000, 105000, 'QRIS', '2026-05-06', 'paid', NOW()),
      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000007'), 6500000, 10000, 6510000, 'Transfer Bank', '2026-05-07', 'paid', NOW()),
      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000008'), 2200000, 10000, 2210000, 'Credit Card', '2026-05-08', 'paid', NOW()),
      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000009'), 180000, 5000, 185000, 'Cash', '2026-05-09', 'pending', NOW()),
      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000010'), 120000, 5000, 125000, 'QRIS', '2026-05-10', 'paid', NOW());
    `;

    // =====================================================
    // TRACKING
    // =====================================================

    await sql`
      INSERT INTO tracking
      (
        shipment_id,
        location,
        status,
        description,
        tracked_at
      )
      VALUES

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000001'), 'Soekarno Hatta Cargo Terminal', 'Cargo Received', 'Cargo diterima di terminal cargo', NOW()),
      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000001'), 'Husein Sastranegara Airport', 'Completed', 'Cargo berhasil diterima penerima', NOW()),

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000002'), 'Juanda Cargo Warehouse', 'Cargo Checked', 'Pemeriksaan cargo selesai', NOW()),
      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000002'), 'In Air Transit', 'In Air Transit', 'Cargo sedang dalam penerbangan', NOW()),

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000003'), 'Soekarno Hatta International Airport', 'Departed', 'Pesawat cargo telah berangkat', NOW()),
      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000003'), 'Singapore Changi Cargo Terminal', 'Completed', 'Cargo telah diterima penerima', NOW()),

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000004'), 'Ngurah Rai International Airport', 'In Air Transit', 'Cargo menuju Tokyo', NOW()),

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000005'), 'Kualanamu Cargo Terminal', 'Awaiting Departure', 'Menunggu jadwal keberangkatan', NOW()),

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000006'), 'Yogyakarta International Airport', 'Cargo Received', 'Cargo diterima di bandara', NOW()),
      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000006'), 'Jenderal Ahmad Yani Airport', 'Completed', 'Cargo selesai dikirim', NOW()),

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000007'), 'Soekarno Hatta International Airport', 'Loaded to Aircraft', 'Cargo telah dimuat ke pesawat', NOW()),

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000008'), 'Suvarnabhumi Cargo Terminal', 'Completed', 'Cargo telah diterima', NOW()),

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000009'), 'Husein Sastranegara Cargo Area', 'Cargo Checked', 'Cargo sedang proses pemeriksaan', NOW()),

      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000010'), 'Adi Soemarmo International Airport', 'Cargo Received', 'Cargo diterima petugas', NOW()),
      ((SELECT id FROM shipments WHERE awb_number = 'AWB00000010'), 'In Air Transit', 'In Air Transit', 'Cargo sedang dalam penerbangan', NOW());
    `;

    return Response.json({
      message: 'Database seeded successfully!',
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: 'Failed to seed database',
      },
      {
        status: 500,
      }
    );
  }}