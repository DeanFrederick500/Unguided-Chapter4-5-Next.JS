"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  AlertTriangle,
  Plane,
  Clock,
  Pencil,
  Trash2,
  Eye,
  Plus,
  Search,
  Filter,
  X,
  Calendar,
} from "lucide-react";

interface Vehicle {
  id: number;
  vehicle_name: string;
  vehicle_code: string;
  load_capacity: number;
  vehicle_status: string;
}

interface Flight {
  id: number;
  flight_number: string;
  origin: string;
  destination: string;
  etd: string;
  eta: string;
  status: string;
  vehicle_id: number;
  vehicle_code: string;
  vehicle_name: string;
  load_capacity: number;
}

export default function FlightsPageContent({ role }: { role: "admin" | "operator" }) {
  const router = useRouter();

  // State
  const [flights, setFlights] = useState<Flight[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cities = [
    { code: "JKT", name: "Jakarta" },
    { code: "SBY", name: "Surabaya" },
    { code: "BDG", name: "Bandung" },
    { code: "SMG", name: "Semarang" },
    { code: "YIA", name: "Yogyakarta" },
    { code: "SOC", name: "Solo" },
    { code: "MLG", name: "Malang" },
    { code: "DPS", name: "Denpasar" },
    { code: "MDN", name: "Medan" },
    { code: "PKU", name: "Pekanbaru" },
    { code: "PLM", name: "Palembang" },
    { code: "BPN", name: "Balikpapan" },
    { code: "SMD", name: "Samarinda" },
    { code: "MKS", name: "Makassar" },
    { code: "MND", name: "Manado" },
    { code: "JMB", name: "Jambi" },
    { code: "BJM", name: "Banjarmasin" },
    { code: "PNK", name: "Pontianak" },
    { code: "BTM", name: "Batam" },
    { code: "AMQ", name: "Ambon" },
  ];

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editFlight, setEditFlight] = useState<Flight | null>(null);
  const [deleteFlight, setDeleteFlight] = useState<Flight | null>(null);

  // Form State
  const [form, setForm] = useState({
    flight_number: "",
    vehicle_id: "",
    origin: "",
    destination: "",
    etd: "",
    eta: "",
    status: "Scheduled",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load Data
  const loadFlights = async () => {
    try {
      const res = await fetch("/api/flights");
      if (!res.ok) throw new Error("Failed to fetch flights");
      const data = await res.json();
      setFlights(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadVehicles = async () => {
    try {
      const res = await fetch("/api/vehicles");
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      const data = await res.json();
      setVehicles(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([loadFlights(), loadVehicles()]);
      setIsLoading(false);
    };
    init();
  }, []);

  // Reset pagination on search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, vehicleFilter]);

  // Statistics
  const totalActive = flights.filter(
    (f) => !["landed", "delayed"].includes(f.status?.toLowerCase() || "")
  ).length;

  const totalDelayed = flights.filter(
    (f) => (f.status?.toLowerCase() || "") === "delayed"
  ).length;

  const totalLanded = flights.filter(
    (f) => (f.status?.toLowerCase() || "") === "landed"
  ).length;

  // Search & Filter filtering logic
  const filteredFlights = flights.filter((f) => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      (f.flight_number || "").toLowerCase().includes(searchText) ||
      (f.vehicle_code || "").toLowerCase().includes(searchText) ||
      (f.origin || "").toLowerCase().includes(searchText) ||
      (f.destination || "").toLowerCase().includes(searchText);

    const matchesStatus = statusFilter ? f.status === statusFilter : true;
    const matchesVehicle = vehicleFilter ? String(f.vehicle_id) === vehicleFilter : true;

    return matchesSearch && matchesStatus && matchesVehicle;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredFlights.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFlights = filteredFlights.slice(startIndex, startIndex + itemsPerPage);

  // Form Validation
  const validateForm = (data: typeof form) => {
    const errors: Record<string, string> = {};
    if (!data.vehicle_id) errors.vehicle_id = "Vehicle wajib dipilih";
    if (!data.origin.trim()) errors.origin = "Origin wajib diisi";
    if (!data.destination.trim()) errors.destination = "Destination wajib diisi";
    if (data.origin.trim() && data.destination.trim() && data.origin.trim().toLowerCase() === data.destination.trim().toLowerCase()) {
      errors.destination = "Destination tidak boleh sama dengan Origin";
    }
    if (!data.status) errors.status = "Status wajib dipilih";
    
    // Flight Number is required, if not provided it is auto-generated but if they cleared it we validate
    if (data.flight_number !== undefined && !data.flight_number.trim()) {
      errors.flight_number = "Flight Number wajib diisi";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Create Modal (with pre-filled generated flight number)
  const openCreateModal = () => {
    const randNum = Math.floor(100 + Math.random() * 900);
    setForm({
      flight_number: `EA-${randNum}`,
      vehicle_id: "",
      origin: "",
      destination: "",
      etd: "",
      eta: "",
      status: "Scheduled",
    });
    setFormErrors({});
    setIsCreateOpen(true);
  };

  // Submit Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    try {
      const res = await fetch("/api/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal membuat flight");

      await loadFlights();
      setIsCreateOpen(false);
      alert("Flight berhasil dibuat!");
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Open Edit Modal
  const openEditModal = (flight: Flight) => {
    setEditFlight(flight);
    setForm({
      flight_number: flight.flight_number,
      vehicle_id: String(flight.vehicle_id),
      origin: flight.origin,
      destination: flight.destination,
      etd: flight.etd ? flight.etd.substring(0, 5) : "",
      eta: flight.eta ? flight.eta.substring(0, 5) : "",
      status: flight.status,
    });
    setFormErrors({});
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFlight) return;
    if (!validateForm(form)) return;

    try {
      const res = await fetch("/api/flights", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editFlight.id,
          ...form,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal memperbarui flight");

      await loadFlights();
      setEditFlight(null);
      alert("Flight berhasil diperbarui!");
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Submit Delete
  const handleDeleteConfirm = async () => {
    if (!deleteFlight) return;

    try {
      const res = await fetch(`/api/flights?id=${deleteFlight.id}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menghapus flight");

      await loadFlights();
      setDeleteFlight(null);
      alert("Flight berhasil dihapus!");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const normalized = status?.toLowerCase() || "";
    switch (normalized) {
      case "departed":
        return (
          <span className="flex items-center gap-1 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold w-fit">
            <Plane size={12} className="rotate-45" /> Departed
          </span>
        );
      case "delayed":
        return (
          <span className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold w-fit">
            <AlertTriangle size={12} /> Delayed
          </span>
        );
      case "landed":
        return (
          <span className="flex items-center gap-1 bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold w-fit">
            <CheckCircle size={12} /> Landed
          </span>
        );
      case "in transit":
        return (
          <span className="flex items-center gap-1 bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-xs font-semibold w-fit">
            <Clock size={12} /> In Transit
          </span>
        );
      default: // Scheduled
        return (
          <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold w-fit">
            <Clock size={12} /> Scheduled
          </span>
        );
    }
  };

  // Get details of selected vehicle in modal
  const selectedVehicleDetails = vehicles.find((v) => String(v.id) === form.vehicle_id);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Flight Management</h1>
          <p className="text-gray-500 text-sm">
            Manage and monitor ExpressAir flight operations and schedules
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-blueprimary hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition font-semibold"
        >
          <Plus size={18} /> New Flight
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm font-medium">Active Flights</p>
            <h2 className="text-3xl font-bold text-green-600 mt-1">{totalActive}</h2>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm font-medium">Delayed Flights</p>
            <h2 className="text-3xl font-bold text-red-600 mt-1">{totalDelayed}</h2>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-red-600">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm font-medium">Landed Flights</p>
            <h2 className="text-3xl font-bold text-blue-600 mt-1">{totalLanded}</h2>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Plane size={24} className="rotate-90" />
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            placeholder="Find Flight Number, Vehicle Code, Origin, Destination..."
            className="w-full border rounded-lg pl-10 pr-3 h-10 text-sm focus:outline-none focus:ring-1 focus:ring-blueprimary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowVehicleDropdown(false);
              }}
              className="border rounded-lg px-4 h-10 min-w-[150px] bg-white flex items-center justify-between gap-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <span>{statusFilter || "All Status"}</span>
              </div>
              <span className="text-xs text-gray-400">▼</span>
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg w-44 z-10 py-1">
                {["", "Scheduled", "Departed", "Delayed", "In Transit", "Landed"].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFilter(st);
                      setShowFilterDropdown(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                      statusFilter === st ? "bg-blue-50 text-blueprimary font-semibold" : "text-gray-700"
                    }`}
                  >
                    {st || "All Status"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowVehicleDropdown(!showVehicleDropdown);
                setShowFilterDropdown(false);
              }}
              className="border rounded-lg px-4 h-10 min-w-[170px] bg-white flex items-center justify-between gap-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <Plane size={16} className="text-gray-400" />
                <span>
                  {vehicleFilter
                    ? vehicles.find((v) => String(v.id) === vehicleFilter)?.vehicle_code || "Vehicle"
                    : "All Vehicles"}
                </span>
              </div>
              <span className="text-xs text-gray-400">▼</span>
            </button>

            {showVehicleDropdown && (
              <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg w-64 max-h-60 overflow-y-auto z-10 py-1">
                <button
                  onClick={() => {
                    setVehicleFilter("");
                    setShowVehicleDropdown(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                    !vehicleFilter ? "bg-blue-50 text-blueprimary font-semibold" : "text-gray-700"
                  }`}
                >
                  All Vehicles
                </button>
                {vehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setVehicleFilter(String(v.id));
                      setShowVehicleDropdown(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                      vehicleFilter === String(v.id) ? "bg-blue-50 text-blueprimary font-semibold" : "text-gray-700"
                    }`}
                  >
                    <div className="font-medium">{v.vehicle_code}</div>
                    <div className="text-xs text-gray-400">{v.vehicle_name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 font-medium">Loading flight data...</div>
        ) : filteredFlights.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">No flights found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="p-4 text-left font-semibold">Flight Number</th>
                  <th className="p-4 text-left font-semibold">Vehicle Code</th>
                  <th className="p-4 text-left font-semibold">Load Capacity</th>
                  <th className="p-4 text-left font-semibold">Route</th>
                  <th className="p-4 text-left font-semibold">Schedule (ETD / ETA)</th>
                  <th className="p-4 text-center font-semibold">Status</th>
                  <th className="p-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginatedFlights.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-semibold text-blueprimary">{f.flight_number}</td>
                    <td className="p-4 font-medium text-gray-700">{f.vehicle_code || "-"}</td>
                    <td className="p-4 text-gray-600">
                      {f.load_capacity ? `${Number(f.load_capacity).toLocaleString("id-ID")} kg` : "-"}
                    </td>
                    <td className="p-4 text-gray-600">
                      <div className="text-xs text-gray-400">From</div>
                      <div className="font-medium text-gray-700 truncate max-w-[150px]">{f.origin}</div>
                      <div className="text-xs text-gray-400 mt-0.5">To</div>
                      <div className="font-medium text-gray-700 truncate max-w-[150px]">{f.destination}</div>
                    </td>
                    <td className="p-4 text-gray-600">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-mono font-semibold">
                          ETD: {f.etd ? f.etd.substring(0, 5) : "-"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs mt-1">
                        <span className="bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-mono font-semibold">
                          ETA: {f.eta ? f.eta.substring(0, 5) : "-"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 items-center">{getStatusBadge(f.status)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => router.push(`/${role}/flights/${f.id}`)}
                          className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition"
                          title="View Detail"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(f)}
                          className="text-yellow-500 hover:text-yellow-700 p-1 hover:bg-yellow-50 rounded transition"
                          title="Edit Flight"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteFlight(f)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition"
                          title="Delete Flight"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const page = idx + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 text-sm border rounded transition ${
                  currentPage === page ? "bg-blueprimary text-white" : "bg-white hover:bg-gray-50 text-gray-700"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-lg text-gray-800">Add New Flight</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
                <input
                  type="text"
                  className={`w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-1 ${
                    formErrors.flight_number ? "border-red-500 focus:ring-red-500" : "focus:ring-blueprimary"
                  }`}
                  value={form.flight_number}
                  onChange={(e) => setForm({ ...form, flight_number: e.target.value })}
                />
                {formErrors.flight_number && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.flight_number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                <select
                  className={`w-full border p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 ${
                    formErrors.vehicle_id ? "border-red-500 focus:ring-red-500" : "focus:ring-blueprimary"
                  }`}
                  value={form.vehicle_id}
                  onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicle_name} ({v.vehicle_code})
                    </option>
                  ))}
                </select>
                {formErrors.vehicle_id && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.vehicle_id}</p>
                )}

                {/* Selected vehicle details display */}
                {selectedVehicleDetails && (
                  <div className="mt-2 p-2 bg-blue-50/50 border border-blue-100 rounded-lg text-xs text-blue-700">
                    <span className="font-semibold">Code:</span> {selectedVehicleDetails.vehicle_code} &nbsp;|&nbsp;{" "}
                    <span className="font-semibold">Max Capacity:</span>{" "}
                    {Number(selectedVehicleDetails.load_capacity).toLocaleString("id-ID")} kg
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origin City</label>
                  <select
                    className={`w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-1 ${
                      formErrors.origin
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blueprimary"
                    }`}
                    value={form.origin}
                    onChange={(e) => {
                      setForm({ ...form, origin: e.target.value });

                      if (formErrors.origin) {
                        setFormErrors({
                          ...formErrors,
                          origin: "",
                        });
                      }
                    }}
                  >
                    <option value="">Select Origin City</option>

                    {cities.map((city) => (
                      <option
                        key={city.code}
                        value={`${city.name} (${city.code})`}
                      >
                        {city.name} ({city.code})
                      </option>
                    ))}
                  </select>
                  {formErrors.origin && <p className="text-red-500 text-xs mt-1">{formErrors.origin}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination City</label>
                  <select
                    className={`w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-1 ${
                      formErrors.destination
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blueprimary"
                    }`}
                    value={form.destination}
                    onChange={(e) => {
                      setForm({ ...form, destination: e.target.value });

                      if (formErrors.destination) {
                        setFormErrors({
                          ...formErrors,
                          destination: "",
                        });
                      }
                    }}
                  >
                    <option value="">Select Destination City</option>

                    {cities.map((city) => (
                      <option
                        key={city.code}
                        value={`${city.name} (${city.code})`}
                      >
                        {city.name} ({city.code})
                      </option>
                    ))}
                  </select>
                  {formErrors.destination && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.destination}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time of Departure (ETD)</label>
                  <input
                    type="time"
                    className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blueprimary"
                    value={form.etd}
                    onChange={(e) => setForm({ ...form, etd: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time of Arrival (ETA)</label>
                  <input
                    type="time"
                    className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blueprimary"
                    value={form.eta}
                    onChange={(e) => setForm({ ...form, eta: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className={`w-full border p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 ${
                    formErrors.status ? "border-red-500 focus:ring-red-500" : "focus:ring-blueprimary"
                  }`}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Departed">Departed</option>
                  <option value="Delayed">Delayed</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Landed">Landed</option>
                </select>
                {formErrors.status && <p className="text-red-500 text-xs mt-1">{formErrors.status}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="border py-2 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blueprimary text-white py-2 text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editFlight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-lg text-gray-800">Edit Penerbangan</h2>
              <button onClick={() => setEditFlight(null)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
                <input
                  type="text"
                  className={`w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-1 ${
                    formErrors.flight_number ? "border-red-500 focus:ring-red-500" : "focus:ring-blueprimary"
                  }`}
                  value={form.flight_number}
                  onChange={(e) => setForm({ ...form, flight_number: e.target.value })}
                />
                {formErrors.flight_number && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.flight_number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                <select
                  className={`w-full border p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 ${
                    formErrors.vehicle_id ? "border-red-500 focus:ring-red-500" : "focus:ring-blueprimary"
                  }`}
                  value={form.vehicle_id}
                  onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
                >
                  <option value="">-- Pilih Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicle_name} ({v.vehicle_code})
                    </option>
                  ))}
                </select>
                {formErrors.vehicle_id && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.vehicle_id}</p>
                )}

                {/* Selected vehicle details display */}
                {selectedVehicleDetails && (
                  <div className="mt-2 p-2 bg-blue-50/50 border border-blue-100 rounded-lg text-xs text-blue-700">
                    <span className="font-semibold">Code:</span> {selectedVehicleDetails.vehicle_code} &nbsp;|&nbsp;{" "}
                    <span className="font-semibold">Max Capacity:</span>{" "}
                    {Number(selectedVehicleDetails.load_capacity).toLocaleString("id-ID")} kg
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origin City / Airport</label>
                  <input
                    type="text"
                    className={`w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-1 ${
                      formErrors.origin ? "border-red-500 focus:ring-red-500" : "focus:ring-blueprimary"
                    }`}
                    value={form.origin}
                    onChange={(e) => setForm({ ...form, origin: e.target.value })}
                  />
                  {formErrors.origin && <p className="text-red-500 text-xs mt-1">{formErrors.origin}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination City / Airport</label>
                  <input
                    type="text"
                    className={`w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-1 ${
                      formErrors.destination ? "border-red-500 focus:ring-red-500" : "focus:ring-blueprimary"
                    }`}
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  />
                  {formErrors.destination && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.destination}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time of Departure (ETD)</label>
                  <input
                    type="time"
                    className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blueprimary"
                    value={form.etd}
                    onChange={(e) => setForm({ ...form, etd: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time of Arrival (ETA)</label>
                  <input
                    type="time"
                    className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blueprimary"
                    value={form.eta}
                    onChange={(e) => setForm({ ...form, eta: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className={`w-full border p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 ${
                    formErrors.status ? "border-red-500 focus:ring-red-500" : "focus:ring-blueprimary"
                  }`}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Departed">Departed</option>
                  <option value="Delayed">Delayed</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Landed">Landed</option>
                </select>
                {formErrors.status && <p className="text-red-500 text-xs mt-1">{formErrors.status}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditFlight(null)}
                  className="border py-2 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blueprimary text-white py-2 text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Perbarui
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteFlight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={32} />
              </div>

              <h2 className="text-lg font-bold text-gray-800">Hapus Penerbangan</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus penerbangan <span className="font-semibold text-gray-700">{deleteFlight.flight_number}</span>? 
                Tindakan ini tidak dapat dibatalkan, dan data pengiriman (shipment) yang terkait akan dilepas dari flight ini.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setDeleteFlight(null)}
                  className="border py-2 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 text-white py-2 text-sm font-semibold rounded-lg hover:bg-red-700 transition"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
