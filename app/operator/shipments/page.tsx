"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Plus, X, Trash2, Search, Filter, Eye, Pencil } from "lucide-react";

export default function ShipmentsPage() {
  const router = useRouter();

  const flights = [
    "EA-101",
    "EA-205",
    "EA-312",
    "EA-408",
    "EA-156",
    "EA-523",
    "EA-777",
    "EA-889",
    "EA-990",
    "EA-321",
  ];

  const [shipments, setShipments] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/shipments")
      .then((res) => res.json())
      .then((data) => {

        const formatted = data.map((item: any) => ({
          id: item.id,
          awb: item.awb,

          tanggal: item.shipping_date,

          pengirim: item.sender_name,
          penerima: item.receiver_name,
          telepon: item.phone_number,

          asal: item.origin,
          tujuan: item.destination,

          jenisBarang: item.item_type,

          berat: item.weight,

          harga: item.shipping_cost,

          kendaraan: item.vehicle_type,

          jenisPengiriman: item.shipping_type,

          flight: item.flight_number,

          status: item.status,

          deskripsi: item.description,
        }));

        setShipments(formatted);
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

  const [form, setForm] = useState({
    tanggal: "",
    pengirim: "",
    penerima: "",
    telepon: "",
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

  // FILTER
  const filtered = shipments.filter(s => {
    const matchSearch = s.awb.toLowerCase().includes(search.toLowerCase());
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

    if (!flights.includes(form.flight)) {
      setFlightError("Flight tidak ditemukan");
      return;
    }

    setFlightError("");

    const newData = {
      awb: generateAWB(),
      shipping_date: form.tanggal,
      sender_name: form.pengirim,
      receiver_name: form.penerima,
      phone_number: form.telepon,
      origin: form.asal,
      destination: form.tujuan,
      item_type: form.jenisBarang,
      weight: Number(form.berat),
      shipping_cost: Number(form.harga),
      vehicle_type: form.kendaraan,
      shipping_type: form.jenisPengiriman,
      flight_number: form.flight,
      description: form.deskripsi,
      status: "Received",
    };

    const response = await fetch("/api/shipments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    });

    if (response.ok) {

      const refreshed = await fetch("/api/shipments");
      const data = await refreshed.json();

      const formatted = data.map((item: any) => ({
        id: item.id,
        awb: item.awb,
        tanggal: item.shipping_date,
        pengirim: item.sender_name,
        penerima: item.receiver_name,
        telepon: item.phone_number,
        asal: item.origin,
        tujuan: item.destination,
        jenisBarang: item.item_type,
        berat: item.weight,
        harga: item.shipping_cost,
        kendaraan: item.vehicle_type,
        jenisPengiriman: item.shipping_type,
        flight: item.flight_number,
        status: item.status,
        deskripsi: item.description,
      }));

      setShipments(formatted);

      setOpen(false);

      setForm({
        tanggal: "",

        pengirim: "",
        penerima: "",
        telepon: "",

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

      alert("Gagal menambahkan shipment");

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
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-500">
            <tr>
              <th className="p-3 text-left">AWB</th>
              <th className="p-3 text-left">Tanggal</th>
              <th className="p-3 text-left">Pengirim</th>
              <th className="p-3 text-left">Penerima</th>
              <th className="p-3 text-left">Telepon</th>
              <th className="p-3 text-left">Asal</th>
              <th className="p-3 text-left">Tujuan</th>
              <th className="p-3 text-left">Jenis Barang</th>
              <th className="p-3 text-left">Berat</th>
              <th className="p-3 text-left">Harga</th>
              <th className="p-3 text-left">Jenis Kendaraan</th>
              <th className="p-3 text-left">Jenis Pengiriman</th>
              <th className="p-3 text-left">No. Penerbangan</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Deskripsi</th>
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

                <td className="p-3">{s.telepon}</td>

                <td className="p-3">{s.asal}</td>

                <td className="p-3">{s.tujuan}</td>

                <td className="p-3">{s.jenisBarang}</td>

                <td className="p-3">{s.berat} kg</td>

                <td className="p-3">Rp {s.harga}</td>

                <td className="p-3">{s.kendaraan}</td>

                <td className="p-3">{s.jenisPengiriman}</td>

                <td className="p-3">{s.flight}</td>

                <td className="p-3">
                  {s.status === "In Transit" && <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-xs">In Transit</span>}
                  {s.status === "Received" && <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs">Received</span>}
                  {s.status === "Delivered" && <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">Delivered</span>}
                </td>

                <td className="p-3">{s.deskripsi}</td>

                <td className="p-3">
                  <div className="flex items-center gap-3">

                    <Eye
                      className="text-blue-500 cursor-pointer"
                      size={18}
                      onClick={() => router.push(`/operator/shipments/${s.awb}`)}
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
          <div className="bg-white w-[420px] rounded-xl p-6 relative">

            <button onClick={() => setOpen(false)} className="absolute right-4 top-4">
              <X />
            </button>

            <h2 className="text-xl font-semibold mb-6">
              Tambah Shipment Baru
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

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
                <label className="text-sm">No Telepon</label>

                <input
                  required
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.telepon}
                  onChange={(e) =>
                    setForm({ ...form, telepon: e.target.value })
                  }
                />
              </div>

              {/* JENIS BARANG */}
              <div>
                <label className="text-sm">Jenis Barang</label>

                <input
                  required
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.jenisBarang}
                  onChange={(e) =>
                    setForm({ ...form, jenisBarang: e.target.value })
                  }
                />
              </div>

              {/* HARGA */}
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

              {/* KENDARAAN */}
              <div>
                <label className="text-sm">Jenis Kendaraan</label>

                <input
                  required
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.kendaraan}
                  onChange={(e) =>
                    setForm({ ...form, kendaraan: e.target.value })
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

              {/* FLIGHT */}
              <div>
                <label className="text-sm">No. Penerbangan</label>
                <input
                  required
                  className={`w-full border rounded-lg px-3 py-2 mt-1 ${flightError ? "border-red-500" : ""}`}
                  value={form.flight}
                  onChange={(e) => {
                    setForm({ ...form, flight: e.target.value });
                    setFlightError("");
                  }}
                />

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
              <div className="grid grid-cols-2 gap-3 pt-2">
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
          <div className="bg-white w-[420px] rounded-xl p-6 relative">

            <button onClick={() => setEditData(null)} className="absolute right-4 top-4">
              <X />
            </button>

            <h2 className="text-xl font-semibold mb-6">
              Update Shipment
            </h2>

            <div className="space-y-4">

              {/* JENIS BARANG */}
              <div>
                <label className="text-sm">Jenis Barang</label>

                <input
                  value={editData.jenisBarang || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      jenisBarang: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              {/* JENIS KENDARAAN */}
              <div>
                <label className="text-sm">Jenis Kendaraan</label>

                <input
                  value={editData.kendaraan || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      kendaraan: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              {/* JENIS PENGIRIMAN */}
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

              {/* DESKRIPSI */}
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
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>


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

              <div>
                <label className="text-sm">Berat (kg)</label>
                <input
                  type="number"
                  value={editData.berat}
                  onChange={(e) => setEditData({ ...editData, berat: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm">No. Penerbangan</label>
                <input
                  value={editData.flight}
                  onChange={(e) => {
                    setEditData({ ...editData, flight: e.target.value });
                    setEditFlightError("");
                  }}
                  className={`w-full border rounded-lg px-3 py-2 ${editFlightError ? "border-red-500" : ""}`}
                />

                {editFlightError && (
                  <p className="text-red-500 text-xs mt-1">
                    Flight tidak ditemukan
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm">Status Baru</label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option>Received</option>
                  <option>In Transit</option>
                  <option>Delivered</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setEditData(null)}
                  className="border py-2 rounded-lg"
                >
                  Batal
                </button>

                <button
                  onClick={async () => {

                    if (!flights.includes(editData.flight)) {
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

                        asal: editData.asal,
                        tujuan: editData.tujuan,

                        jenisBarang: editData.jenisBarang,

                        kendaraan: editData.kendaraan,

                        jenisPengiriman: editData.jenisPengiriman,

                        deskripsi: editData.deskripsi,

                        berat: Number(editData.berat),

                        flight: editData.flight,

                        status: editData.status,
                      }),
                    });

                    if (response.ok) {

                      const refreshed = await fetch("/api/shipments");
                      const data = await refreshed.json();

                      const formatted = data.map((item: any) => ({
                        id: item.id,
                        awb: item.awb,

                        tanggal: item.shipping_date,

                        pengirim: item.sender_name,
                        penerima: item.receiver_name,
                        telepon: item.phone_number,

                        asal: item.origin,
                        tujuan: item.destination,

                        jenisBarang: item.item_type,

                        berat: item.weight,

                        harga: item.shipping_cost,

                        kendaraan: item.vehicle_type,

                        jenisPengiriman: item.shipping_type,

                        flight: item.flight_number,

                        status: item.status,

                        deskripsi: item.description,
                      }));

                      setShipments(formatted);

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

                    const refreshed = await fetch("/api/shipments");
                    const data = await refreshed.json();

                    const formatted = data.map((item: any) => ({
                      id: item.id,
                      awb: item.awb,

                      tanggal: item.shipping_date,

                      pengirim: item.sender_name,
                      penerima: item.receiver_name,
                      telepon: item.phone_number,

                      asal: item.origin,
                      tujuan: item.destination,

                      jenisBarang: item.item_type,

                      berat: item.weight,

                      harga: item.shipping_cost,

                      kendaraan: item.vehicle_type,

                      jenisPengiriman: item.shipping_type,

                      flight: item.flight_number,

                      status: item.status,

                      deskripsi: item.description,
                    }));

                    setShipments(formatted);

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