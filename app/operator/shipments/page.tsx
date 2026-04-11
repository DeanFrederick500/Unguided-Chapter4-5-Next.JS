"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Plus, X, Trash2, Search, Filter, Eye, Pencil } from "lucide-react";

export default function ShipmentsPage() {
  const router = useRouter();

  const flights = ["EA-101", "EA-205", "EA-312", "EA-408", "EA-156"];

  const [shipments, setShipments] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("shipments");

    if (saved) {
      setShipments(JSON.parse(saved));
    } else {
      const initial = [
        { id: 1, awb: "AWB001234567", asal: "Jakarta (CGK)", tujuan: "Singapore (SIN)", berat: 25.5, flight: "EA-101", status: "In Transit" },
        { id: 2, awb: "AWB002345678", asal: "Surabaya (SUB)", tujuan: "Bangkok (BKK)", berat: 18.2, flight: "EA-205", status: "Received" },
        { id: 3, awb: "AWB003456789", asal: "Bali (DPS)", tujuan: "Tokyo (NRT)", berat: 32.8, flight: "EA-312", status: "Delivered" },
      ];

      setShipments(initial);
      localStorage.setItem("shipments", JSON.stringify(initial));
    }
  }, []);

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [flightError, setFlightError] = useState("");
  const [editFlightError, setEditFlightError] = useState("");

  const [form, setForm] = useState({
    awb: "",
    asal: "",
    tujuan: "",
    berat: "",
    flight: "",
  });

  // FILTER
  const filtered = shipments.filter(s => {
    const matchSearch = s.awb.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? s.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (!flights.includes(form.flight)) {
      setFlightError("Flight tidak ditemukan");
      return;
    }

    setFlightError("");

    const newData = {
      id: Date.now(),
      ...form,
      berat: Number(form.berat),
      status: "Received",
    };

    const updated = [...shipments, newData];
    setShipments(updated);
    localStorage.setItem("shipments", JSON.stringify(updated));
    setOpen(false);

    setForm({
      awb: "",
      asal: "",
      tujuan: "",
      berat: "",
      flight: "",
    });
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
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
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
              <th className="p-3 text-left">Asal</th>
              <th className="p-3 text-left">Tujuan</th>
              <th className="p-3 text-left">Berat</th>
              <th className="p-3 text-left">Flight</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3 text-blue-600">{s.awb}</td>
                <td className="p-3">{s.asal}</td>
                <td className="p-3">{s.tujuan}</td>
                <td className="p-3">{s.berat} kg</td>
                <td className="p-3">{s.flight}</td>

                <td className="p-3">
                  {s.status === "In Transit" && <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-xs">In Transit</span>}
                  {s.status === "Received" && <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs">Received</span>}
                  {s.status === "Delivered" && <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">Delivered</span>}
                </td>

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
                      onClick={() => {
                        const updated = shipments.filter(item => item.id !== s.id);

                        setShipments(updated);
                        localStorage.setItem("shipments", JSON.stringify(updated));
                      }}
                    />

                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

              {/* AWB */}
              <div>
                <label className="text-sm">Nomor AWB</label>
                <input
                  required
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.awb}
                  onChange={(e) => setForm({ ...form, awb: e.target.value })}
                />
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
                <label className="text-sm">Flight Number</label>
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

              <div>
                <label className="text-sm">Nomor AWB</label>
                <input
                  value={editData.awb}
                  onChange={(e) => setEditData({ ...editData, awb: e.target.value })}
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
                <label className="text-sm">Flight Number</label>
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
                  onClick={() => {

                    if (!flights.includes(editData.flight)) {
                      setEditFlightError("Flight tidak ditemukan");
                      return;
                    }

                    setEditFlightError("");

                    setShipments(prev => {
                      const updated = prev.map(s =>
                        s.id === editData.id ? editData : s
                      );

                      localStorage.setItem("shipments", JSON.stringify(updated));

                      return updated;
                    });

                    setEditData(null);
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

    </div>
  );
}