"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertTriangle,
  Plane,
  Clock,
  Pencil,
} from "lucide-react";

export default function FlightsPage() {
  const defaultFlights = [
    { id: 1, flight: "EA-101", asal: "Jakarta (CGK)", tujuan: "Singapore (SIN)", etd: "13:20", eta: "15:45", status: "Departed" },
    { id: 2, flight: "EA-205", asal: "Surabaya (SUB)", tujuan: "Bangkok (BKK)", etd: "15:30", eta: "18:00", status: "On-Time" },
    { id: 3, flight: "EA-312", asal: "Bali (DPS)", tujuan: "Tokyo (NRT)", etd: "16:45", eta: "23:30", status: "Delayed" },
    { id: 4, flight: "EA-408", asal: "Jakarta (CGK)", tujuan: "Hong Kong (HKG)", etd: "18:00", eta: "21:45", status: "On-Time" },
    { id: 5, flight: "EA-156", asal: "Medan (KNO)", tujuan: "Kuala Lumpur (KUL)", etd: "19:15", eta: "20:30", status: "On-Time" },
    { id: 6, flight: "EA-523", asal: "Jakarta (CGK)", tujuan: "Sydney (SYD)", etd: "20:30", eta: "06:15", status: "On-Time" },
    { id: 7, flight: "EA-777", asal: "Bali (DPS)", tujuan: "Dubai (DXB)", etd: "21:00", eta: "03:45", status: "On-Time" },
    { id: 8, flight: "EA-889", asal: "Surabaya (SUB)", tujuan: "Seoul (ICN)", etd: "22:10", eta: "05:00", status: "Delayed" },
    { id: 9, flight: "EA-990", asal: "Jakarta (CGK)", tujuan: "Tokyo (NRT)", etd: "23:00", eta: "06:30", status: "On-Time" },
    { id: 10, flight: "EA-321", asal: "Medan (KNO)", tujuan: "Singapore (SIN)", etd: "12:00", eta: "13:45", status: "Departed" },
  ];

  const [flights, setFlights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selected, setSelected] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    async function loadFlights() {
      setIsLoading(true);

      try {
        const response = await fetch("/api/flights");
        const data = await response.json();

        if (!response.ok || !Array.isArray(data)) {
          throw new Error("Failed to load flights");
        }

        const formatted = data.map((flight: any) => ({
          id: flight.id ?? flight.flight_number,
          flight: flight.flight_number,
          asal: flight.origin,
          tujuan: flight.destination,
          etd: flight.etd,
          eta: flight.eta,
          status: String(flight.status || "").trim(),
        }));

        setFlights(formatted);
      } catch (error) {
        setFlights(defaultFlights);
      } finally {
        setIsLoading(false);
      }
    }

    loadFlights();
  }, []);


  const totalActive = flights.filter(
    (f) =>
      !["departed", "delayed"].includes(
        f.status.toLowerCase()
      )
  ).length;

  const totalDelayed = flights.filter(
    (f) =>
      f.status.toLowerCase() === "delayed"
  ).length;

  const totalDeparted = flights.filter(
    (f) =>
      f.status.toLowerCase() === "departed"
  ).length;

  const openModal = (flight: any) => {
    setSelected(flight);
    setNewStatus(flight.status);
  };

  const closeModal = () => setSelected(null);

  const updateStatus = async () => {
    if (!selected) return;

    const updatedStatus = newStatus || selected.status;

    try {
      const response = await fetch("/api/flights", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selected.id,
          status: updatedStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update flight status");
      }

      const updatedFlights = flights.map((f) =>
        f.id === selected.id
          ? { ...f, status: updatedStatus }
          : f
      );

      setFlights(updatedFlights);
      closeModal();
      alert("Flight berhasil diperbarui!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Gagal memperbarui status penerbangan. Coba lagi.");
    }
  };

  const formatStatus = (status: string) => {
    const normalized = status.toLowerCase();

    if (normalized === "in transit") return "In Transit";
    if (normalized === "on-time") return "On-Time";
    if (normalized === "scheduled") return "Scheduled";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const statusUI = (status: string) => {
    const normalized = status.toLowerCase();

    if (normalized === "departed")
      return (
        <span className="flex items-center gap-1 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs w-fit">
          <Plane size={14} /> Departed
        </span>
      );

    if (normalized === "delayed")
      return (
        <span className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs w-fit">
          <AlertTriangle size={14} /> Delayed
        </span>
      );

    return (
      <span className="flex items-center gap-1 bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs w-fit">
        <CheckCircle size={14} /> {formatStatus(status)}
      </span>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Flight Monitoring</h1>
      <p className="text-gray-500 mb-6">
        Monitor status penerbangan secara real-time
      </p>

      {/* CARDS */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        <div className="bg-white p-4 rounded-xl shadow flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Active</p>
            <h2 className="text-2xl font-bold text-green-600">
              {totalActive}
            </h2>
          </div>
          <CheckCircle className="text-green-600" />
        </div>

        <div className="bg-white p-4 rounded-xl shadow flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Delayed</p>
            <h2 className="text-2xl font-bold text-red-600">
              {totalDelayed}
            </h2>
          </div>
          <Clock className="text-red-600" />
        </div>

        <div className="bg-white p-4 rounded-xl shadow flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Departed</p>
            <h2 className="text-2xl font-bold text-blue-600">
              {totalDeparted}
            </h2>
          </div>
          <Plane className="text-blue-600" />
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <h2 className="p-4 font-semibold border-b">
          Jadwal Penerbangan Hari Ini
        </h2>

        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-500">
            <tr>
              <th className="p-3 text-left">No. Penerbangan</th>
              <th className="p-3 text-left">Asal</th>
              <th className="p-3 text-left">Tujuan</th>
              <th className="p-3 text-left">ETD</th>
              <th className="p-3 text-left">ETA</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {flights.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="p-3 text-blue-600">{f.flight}</td>
                <td className="p-3">{f.asal}</td>
                <td className="p-3">{f.tujuan}</td>
                <td className="p-3">{f.etd}</td>
                <td className="p-3">{f.eta}</td>
                <td className="p-3">{statusUI(f.status)}</td>
                <td className="p-3">
                  <button
                    onClick={() => openModal(f)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 shadow">
            <h2 className="text-lg font-semibold mb-4">
              Update Status Penerbangan
            </h2>

            <p className="text-sm mb-2">{selected.flight}</p>
            <p className="text-gray-500 text-sm mb-4">
              {selected.asal} → {selected.tujuan}
            </p>

            <select
              className="w-full border p-2 rounded mb-4"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Departed">Departed</option>
              <option value="Delayed">Delayed</option>
              <option value="In Transit">In Transit</option>
              <option value="Landed">Landed</option>
            </select>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={closeModal}
                className="border py-2 rounded-lg"
              >
                Batal
              </button>

              <button
                onClick={updateStatus}
                className="bg-blue-600 text-white py-2 rounded-lg"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}