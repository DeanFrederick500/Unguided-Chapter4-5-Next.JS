"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Plus, X, Trash2, Search, Filter, Eye, Pencil } from "lucide-react";

export default function ShipmentsPage() {
  const router = useRouter();

  const [flights, setFlights] = useState<{ flight_number: string; status: string }[]>([]);
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [itemTypes, setItemTypes] = useState<string[]>([]);

  const loadShipments = async () => {
    try {
      const response = await fetch("/api/shipments");
      const data = await response.json();

      // De-duplikasi data berdasarkan awb_number agar tidak muncul 2 kali
      const uniqueData = Array.isArray(data)
        ? Array.from(new Map(data.map((item: any) => [item.awb_number, item])).values())
        : [];

      const formatted = uniqueData
        .map(formatShipment);
      setShipments(formatted);
    } catch (error) {
      setShipments([]);
    }
  };

  useEffect(() => {
    loadShipments();
  }, []);

  useEffect(() => {
    fetch("/api/flights")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data || data?.rows || []);
        // De-duplikasi berdasarkan flight_number agar key di select unik, filter data kosong
        const unique = Array.from(
          new Map(
            list
              .filter((f: any) => f && f.flight_number)
              .map((f: any) => [f.flight_number, f])
          ).values()
        );
        setFlights(unique);
      })
      .catch(() => {
        setFlights([]);
      });

    fetch("/api/vehicles")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data || data?.rows || []);
        // Mengambil properti vehicle_name dari database, filter nilai null/kosong, lalu de-duplikasi
        const names = list
          .map((v: any) => (typeof v === 'string' ? v : v?.vehicle_name || v?.name))
          .filter((name: any): name is string => typeof name === 'string' && name.trim() !== '');
        
        const uniqueNames = Array.from(new Set(names));
        setVehicles(uniqueNames);
      })
      .catch(() => {
        setVehicles([]);
      });
    
    fetch("/api/item-types")
      .then((res) => res.json())
      .then((data) => {
        console.log("API /api/item-types response:", data); // Debugging: Log API response
        const list = Array.isArray(data) ? data : (data?.data || data?.rows || []);
        const types = list
          .map((t: any) => (typeof t === 'string' ? t : t?.item_type || t?.name || t?.type_name))
          .filter((t: any): t is string => typeof t === 'string' && t.trim() !== '');
        
        const uniqueTypes = Array.from(new Set(types));
        console.log("Processed unique item types:", uniqueTypes); // Debugging: Log processed types
        setItemTypes(uniqueTypes);
      })
      .catch(() => {
        setItemTypes([]);
      });
  }, []);

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [deleteData, setDeleteData] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [flightError, setFlightError] = useState("");
  const [editFlightError, setEditFlightError] = useState("");

  const getFlightStatus = (flightNumber: string) => {
    const flight = flights.find((f) => f.flight_number === flightNumber);
    return flight?.status || "Received";
  };

  const [form, setForm] = useState({
    tanggal: "",
    pengirim: "",
    penerima: "",
    telepon: "",
    teleponPenerima: "",
    asal: "",
    tujuan: "",
    jenisBarang: "",
    berat: "",
    harga: "",
    kendaraan: "",
    jenisPengiriman: "",
    flight: "",
    deskripsi: "",
  });

  const generateAWB = () => {
    const randomNumber = Math.floor(
      100000000 + Math.random() * 900000000
    );

    return `AWB${randomNumber}`;
  };

  const excludedShipmentDescriptions = new Set([
    "Logistik medis darurat",
    "Baterai kendaraan listrik",
    "Produk fashion premium",
  ]);

  const excludedShipmentTypes = new Set([
    "Emergency Cargo",
    "Hazardous Cargo",
    "Fashion Cargo",
  ]);

  const isExcludedShipment = (item: any) =>
    excludedShipmentDescriptions.has(item.item_description) ||
    excludedShipmentTypes.has(item.item_type);

  const formatShipment = (item: any) => ({
    id: item.id,
    awb: item.awb_number,
    tanggal: item.shipment_date,
    pengirim: item.sender_name,
    penerima: item.receiver_name,
    telepon: item.phone_number,
    teleponPenerima: item.receiver_phone_number,
    asal: item.origin_city,
    tujuan: item.destination_city,
    jenisBarang: item.item_type,
    berat: item.weight,
    harga: item.shipping_price,
    kendaraan: item.vehicle_name,
    jenisPengiriman: item.shipping_type,
    flight: item.flight_number,
    status: item.shipment_status,
    deskripsi: item.item_description,
    item_name: item.item_name,
    quantity: item.quantity,
    item_status: item.item_status,
    admin_fee: item.admin_fee,
    total_price: item.total_price,
    payment_method: item.payment_method,
    payment_date: item.payment_date,
    transaction_status: item.transaction_status,
  });

  // FILTER
  const filtered = shipments.filter(s => {
    const searchText = search.toLowerCase();
    const matchSearch =
      s.awb.toLowerCase().includes(searchText) ||
      s.penerima.toLowerCase().includes(searchText) ||
      s.pengirim.toLowerCase().includes(searchText);
    const matchStatus = statusFilter ? s.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedData = filtered.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const selectedFlight = flights.find((f) => f.flight_number === form.flight);
    if (!selectedFlight) {
      setFlightError("Flight tidak ditemukan");
      return;
    }

    setFlightError("");

    const newData = {

      awb_number: generateAWB(),

      shipment_date: form.tanggal,

      sender_name: form.pengirim,
      receiver_name: form.penerima,
      phone_number: form.telepon,
      receiver_phone_number: form.teleponPenerima,

      origin_city: form.asal,
      destination_city: form.tujuan,

      shipping_type: form.jenisPengiriman,
      shipment_status: selectedFlight.status || "Received",

      vehicle_name: form.kendaraan,
      flight_number: form.flight,

      item_name: form.jenisBarang,
      item_type: form.jenisBarang,
      item_description: form.deskripsi,

      quantity: 1,
      weight: Number(form.berat),

      item_status: "safe",

      shipping_price: Number(form.harga),
      admin_fee: 5000,
      total_price: Number(form.harga) + 5000,

      payment_method: "Transfer Bank",
      payment_date: form.tanggal,

      transaction_status: "paid",

    };

    const response = await fetch("/api/shipments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    });

    if (response.ok) {
      await loadShipments();
      setOpen(false);

      setForm({
        tanggal: "",

        pengirim: "",
        penerima: "",
        telepon: "",
        teleponPenerima: "",

        asal: "",
        tujuan: "",

        jenisBarang: "",

        berat: "",

        harga: "",

        kendaraan: "",

        jenisPengiriman: "",

        flight: "",

        deskripsi: "",
      });

    } else {

      const errorData = await response.json();

      console.log(errorData);

      alert(errorData.error || "Gagal menambahkan shipment");

    }
  };

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Data Shipment</h1>
          <p className="text-gray-500 text-sm">
            Kelola semua data pengiriman kargo
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-blueprimary text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} /> Tambah Shipment
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex gap-3 mb-4">

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            placeholder="Cari AWB..."
            className="w-full border rounded-lg pl-10 pr-3 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="border rounded-lg px-4 h-10 min-w-[150px] bg-white flex items-center gap-2"
          >
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm text-gray-600">
              {statusFilter || "Semua Status"}
            </span>
          </button>

          {showFilter && (
            <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow w-40 z-10">
              <button onClick={() => { setStatusFilter(""); setShowFilter(false); }} className="block w-full text-left px-3 py-2 hover:bg-gray-100">Semua Status</button>
              <button onClick={() => { setStatusFilter("Received"); setShowFilter(false); }} className="block w-full text-left px-3 py-2 hover:bg-gray-100">Received</button>
              <button onClick={() => { setStatusFilter("In Transit"); setShowFilter(false); }} className="block w-full text-left px-3 py-2 hover:bg-gray-100">In Transit</button>
              <button onClick={() => { setStatusFilter("Delivered"); setShowFilter(false); }} className="block w-full text-left px-3 py-2 hover:bg-gray-100">Delivered</button>
            </div>
          )}
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-500">
            <tr>
              <th className="p-3 text-left">AWB</th>
              <th className="p-3 text-left">Tanggal</th>
              <th className="p-3 text-left">Pengirim</th>
              <th className="p-3 text-left">Penerima</th>
              <th className="p-3 text-left">Telepon Pengirim</th>
              <th className="p-3 text-left">Telepon Penerima</th>
              <th className="p-3 text-left">Asal</th>
              <th className="p-3 text-left">Tujuan</th>
              <th className="p-3 text-left">Harga</th>
              <th className="p-3 text-left">Jenis Kendaraan</th>
              <th className="p-3 text-left">Jenis Pengiriman</th>
              <th className="p-3 text-left">No. Penerbangan</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3 text-blue-600">{s.awb}</td>

                <td className="p-3">{s.tanggal}</td>

                <td className="p-3">{s.pengirim}</td>

                <td className="p-3">{s.penerima}</td>

                <td className="p-3">{s.telepon || "-"}</td>

                <td className="p-3">{s.teleponPenerima || "-"}</td>

                <td className="p-3">{s.asal}</td>

                <td className="p-3">{s.tujuan}</td>

                <td className="p-3">Rp {s.harga}</td>

                <td className="p-3">{s.kendaraan || "-"}</td>

                <td className="p-3">{s.jenisPengiriman}</td>

                <td className="p-3">{s.flight || "-"}</td>

                <td className="p-3">
                  {s.status === "In Transit" && <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-xs">In Transit</span>}
                  {s.status === "Received" && <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs">Received</span>}
                  {s.status === "Delivered" && <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">Delivered</span>}
                  {s.status === "Scheduled" && <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">Scheduled</span>}
                  {s.status === "Departed" && <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs">Departed</span>}
                  {s.status === "Delayed" && <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs">Delayed</span>}
                  {s.status === "Landed" && <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">Landed</span>}
                  {s.status !== "In Transit" &&
                   s.status !== "Received" &&
                   s.status !== "Delivered" &&
                   s.status !== "Scheduled" &&
                   s.status !== "Departed" &&
                   s.status !== "Delayed" &&
                   s.status !== "Landed" && (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">{s.status}</span>
                  )}
                </td>

                <td className="p-3">
                  <div className="flex items-center gap-3">

                    <Eye
                      className="text-blue-500 cursor-pointer"
                      size={18}
                      onClick={() => router.push(`/admin/shipments/${s.awb}`)}
                    />

                    <Pencil
                      className="text-yellow-500 cursor-pointer"
                      size={18}
                      onClick={() => {
                        setEditData(s);
                        setNewStatus(s.status);
                      }}
                    />

                    <Trash2
                      className="text-red-600 cursor-pointer"
                      size={18}
                      onClick={() => setDeleteData(s)}
                    />

                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-4">

          <button
            className="px-3 py-1 border rounded"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;

            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded ${currentPage === page ? "bg-blue-600 text-white" : ""
                  }`}
              >
                {page}
              </button>
            );
          })}

          <button
            className="px-3 py-1 border rounded"
            onClick={() =>
              setCurrentPage(p => Math.min(totalPages, p + 1))
            }
          >
            Next
          </button>

        </div>
      )}

      {/* MODAL TAMBAH */}
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6 relative">

            <button onClick={() => setOpen(false)} className="absolute right-4 top-4">
              <X />
            </button>

            <h2 className="text-xl font-semibold mb-6">
              Tambah Shipment Baru
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* TANGGAL KIRIM */}
              <div>
                <label className="text-sm">Tanggal Kirim</label>

                <input
                  required
                  type="date"
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.tanggal}
                  onChange={(e) =>
                    setForm({ ...form, tanggal: e.target.value })
                  }
                />
              </div>

              {/* JENIS PENGIRIMAN */}
              <div>
                <label className="text-sm">Jenis Pengiriman</label>

                <select
                  required
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.jenisPengiriman}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      jenisPengiriman: e.target.value,
                    })
                  }
                >
                  <option value="">Pilih</option>
                  <option value="Biasa">Biasa</option>
                  <option value="Cepat">Cepat</option>
                  <option value="VVIP">VVIP</option>
                </select>
              </div>

              {/* PENGIRIM */}
              <div>
                <label className="text-sm">Nama Pengirim</label>

                <input
                  required
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.pengirim}
                  onChange={(e) =>
                    setForm({ ...form, pengirim: e.target.value })
                  }
                />
              </div>

              {/* PENERIMA */}
              <div>
                <label className="text-sm">Nama Penerima</label>

                <input
                  required
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.penerima}
                  onChange={(e) =>
                    setForm({ ...form, penerima: e.target.value })
                  }
                />
              </div>

              {/* TELEPON */}
              <div>
                <label className="text-sm">No Telepon Pengirim</label>

                <input
                  required
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.telepon}
                  onChange={(e) =>
                    setForm({ ...form, telepon: e.target.value })
                  }
                />
              </div>

              {/* TELEPON PENERIMA */}
              <div>
                <label className="text-sm">No Telepon Penerima</label>

                <input
                  required
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.teleponPenerima}
                  onChange={(e) =>
                    setForm({ ...form, teleponPenerima: e.target.value })
                  }
                />
              </div>

              {/* JENIS BARANG */}
              <div>
                <label className="text-sm">Jenis Barang</label>
                <select
                  required
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.jenisBarang}
                  onChange={(e) =>
                    setForm({ ...form, jenisBarang: e.target.value })
                  }
                >
                  <option value="">Pilih Jenis Barang</option>
                  {itemTypes.map((type) => (
                    <option key={`add-item-${type}`} value={type}>{type}</option>
                  ))}
                  {itemTypes.length === 0 && ( // Fallback options if API returns no item types
                    <>
                      <option value="Biasa">Biasa</option>
                      <option value="Small Cargo">Small Cargo</option>
                      <option value="Medium Cargo">Medium Cargo</option>
                      <option value="Large Cargo">Large Cargo</option>
                      <option value="Heavy Cargo">Heavy Cargo</option>
                    </>
                  )}
                </select>
              </div>

              {/* ASAL */}
              <div>
                <label className="text-sm">Asal</label>
                <input
                  required
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.asal}
                  onChange={(e) => setForm({ ...form, asal: e.target.value })}
                />
              </div>

              {/* TUJUAN */}
              <div>
                <label className="text-sm">Tujuan</label>
                <input
                  required
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.tujuan}
                  onChange={(e) => setForm({ ...form, tujuan: e.target.value })}
                />
              </div>

              {/* BERAT */}
              <div>
                <label className="text-sm">Berat (kg)</label>
                <input
                  required
                  type="number"
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.berat}
                  onChange={(e) => setForm({ ...form, berat: e.target.value })}
                />
              </div>

              {/* JENIS KENDARAAN */}
              <div>
                <label className="text-sm">Jenis Kendaraan</label>

                <select
                  required
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.kendaraan}
                  onChange={(e) =>
                    setForm({ ...form, kendaraan: e.target.value })
                  }
                >
                  <option value="">Pilih Kendaraan</option>
                  {vehicles.map((vehicle) => (
                    <option key={`add-veh-${vehicle}`} value={vehicle}>
                      {vehicle}
                    </option>
                  ))}
                </select>
              </div>

              {/* FLIGHT */}
              <div>
                <label className="text-sm">No. Penerbangan</label>
                <select
                  required
                  value={form.flight}
                  onChange={(e) => {
                    setForm({ ...form, flight: e.target.value });
                    setFlightError("");
                  }}
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${flightError ? "border-red-500" : ""}`}
                >
                  <option value="">Pilih No. Penerbangan</option>
                  {flights.map((flight) => (
                    <option key={`create-flight-${flight.flight_number}`} value={flight.flight_number}>
                      {flight.flight_number}
                    </option>
                  ))}
                </select>

                {flightError && (
                  <p className="text-red-500 text-xs mt-1">
                    {flightError}
                  </p>
                )}
              </div>


              {/* DESKRIPSI */}
              <div>
                <label className="text-sm">Deskripsi Barang</label>

                <textarea
                  required
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.deskripsi}
                  onChange={(e) =>
                    setForm({ ...form, deskripsi: e.target.value })
                  }
                />
              </div>

              {/* BUTTON */}
              <div className="md:col-span-2 grid grid-cols-2 gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="border py-2 rounded-lg">
                  Batal
                </button>
                <button type="submit" className="bg-blue-600 text-white py-2 rounded-lg">
                  Simpan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {editData && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6 relative">

            <button onClick={() => setEditData(null)} className="absolute right-4 top-4">
              <X />
            </button>

            <h2 className="text-xl font-semibold mb-6">
              Update Shipment
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* BARIS 1 */}
              <div>
                <label className="text-sm">Jenis Barang</label>

                <select
                  value={editData.jenisBarang || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      jenisBarang: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                >
                  <option value="">Pilih Jenis Barang</option>
                  {itemTypes.map((type) => (
                    <option key={`edit-item-${type}`} value={type}>{type}</option>
                  ))}
                  {itemTypes.length === 0 && ( // Fallback options if API returns no item types
                    <>
                      <option value="Biasa">Biasa</option>
                      <option value="Small Cargo">Small Cargo</option>
                      <option value="Medium Cargo">Medium Cargo</option>
                      <option value="Large Cargo">Large Cargo</option>
                      <option value="Heavy Cargo">Heavy Cargo</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-sm">Berat (kg)</label>

                <input
                  type="number"
                  value={editData.berat || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      berat: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                />
              </div>

              {/* BARIS 2 */}
              <div>
                <label className="text-sm">No Telepon Pengirim</label>

                <input
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={editData.telepon || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      telepon: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm">No Telepon Penerima</label>

                <input
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={editData.teleponPenerima || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      teleponPenerima: e.target.value,
                    })
                  }
                />
              </div>

              {/* BARIS 3 */}
              <div>
                <label className="text-sm">Jenis Kendaraan</label>

                <select
                  value={editData.kendaraan || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      kendaraan: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                >
                  <option value="">Pilih Kendaraan</option>
                  {vehicles.map((vehicle) => (
                    <option key={`edit-veh-${vehicle}`} value={vehicle}>
                      {vehicle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm">Jenis Pengiriman</label>

                <select
                  value={editData.jenisPengiriman}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      jenisPengiriman: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="Biasa">Biasa</option>
                  <option value="Cepat">Cepat</option>
                  <option value="VVIP">VVIP</option>
                </select>
              </div>

              {/* BARIS 4 */}
              <div>
                <label className="text-sm">Harga Pengiriman</label>

                <input
                  required
                  type="number"
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.harga}
                  onChange={(e) =>
                    setForm({ ...form, harga: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm">No. Penerbangan</label>
                <select
                  value={editData.flight || ""}
                  onChange={(e) => {
                    const selectedFlight = flights.find((f) => f.flight_number === e.target.value);
                    setEditData({
                      ...editData,
                      flight: e.target.value,
                      status: selectedFlight ? selectedFlight.status : editData.status,
                    });
                    setEditFlightError("");
                  }}
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${editFlightError ? "border-red-500" : ""}`}
                >
                  <option value="">Pilih No. Penerbangan</option>
                  {flights.map((flight) => (
                    <option key={`edit-flight-${flight.flight_number}`} value={flight.flight_number}>
                      {flight.flight_number}
                    </option>
                  ))}
                </select>

                {editFlightError && (
                  <p className="text-red-500 text-xs mt-1">
                    Flight tidak ditemukan
                  </p>
                )}
              </div>

              {/* BARIS 5 */}
              <div>
                <label className="text-sm">Asal</label>
                <input
                  value={editData.asal}
                  onChange={(e) => setEditData({ ...editData, asal: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm">Tujuan</label>
                <input
                  value={editData.tujuan}
                  onChange={(e) => setEditData({ ...editData, tujuan: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              {/* BARIS 6 */}
              <div>
                <label className="text-sm">Status Baru</label>
                <select
                  value={editData.status || ""}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                >
                  <option value="" disabled>Pilih Status</option>
                  <option value="Received">Received</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Departed">Departed</option>
                  <option value="Delayed">Delayed</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Landed">Landed</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div>
                <label className="text-sm">Deskripsi Barang</label>

                <textarea
                  value={editData.deskripsi}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      deskripsi: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setEditData(null)}
                  className="border py-2 rounded-lg"
                >
                  Batal
                </button>

                <button
                  onClick={async () => {

                    const selectedFlight = flights.find((f) => f.flight_number === editData.flight);
                    if (!selectedFlight) {
                      setEditFlightError("Flight tidak ditemukan");
                      return;
                    }

                    setEditFlightError("");

                    const response = await fetch("/api/shipments", {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        id: editData.id,
                        shipment_date: editData.tanggal,
                        sender_name: editData.pengirim,
                        receiver_name: editData.penerima,
                        phone_number: editData.telepon,
                        receiver_phone_number: editData.teleponPenerima,
                        origin_city: editData.asal,
                        destination_city: editData.tujuan,
                        shipping_type: editData.jenisPengiriman,
                        shipment_status: editData.status,
                        vehicle_name: editData.kendaraan,
                        flight_number: editData.flight,
                        item_name: editData.item_name ?? editData.jenisBarang,
                        item_type: editData.jenisBarang,
                        item_description: editData.deskripsi,
                        quantity: editData.quantity ?? 1,
                        weight: Number(editData.berat),
                        item_status: editData.item_status ?? "safe",
                        shipping_price: Number(editData.harga),
                        admin_fee: editData.admin_fee ?? 5000,
                        total_price: editData.total_price ?? (Number(editData.harga) + (editData.admin_fee ?? 5000)),
                        payment_method: editData.payment_method ?? "Transfer Bank",
                        payment_date: editData.payment_date ?? editData.tanggal,
                        transaction_status: editData.transaction_status ?? "paid",
                      }),
                    });

                    if (response.ok) {
                      await loadShipments();
                      setEditData(null);

                    } else {

                      alert("Gagal update shipment");

                    }
                  }}
                  className="bg-blue-600 text-white py-2 rounded-lg"
                >
                  Simpan
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {deleteData && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white w-[500px] rounded-xl p-6">

            <h2 className="text-2xl font-semibold mb-6">
              Apakah anda yakin ingin menghapus data shipments ini?
            </h2>

            <p className="text-gray-600 text-1xl mb-8">
              {deleteData.awb}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setDeleteData(null)}
                className="border py-3 rounded-xl"
              >
                Batal
              </button>

              <button
                onClick={async () => {

                  const response = await fetch("/api/shipments", {
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      id: deleteData.id,
                    }),
                  });

                  if (response.ok) {
                    await loadShipments();
                    setDeleteData(null);

                  } else {

                    alert("Gagal menghapus shipment");

                  }
                }}
                className="bg-blue-700 text-white py-3 rounded-xl"
              >
                Hapus
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}