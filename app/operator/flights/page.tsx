"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertTriangle,
  Plane,
  Clock,
} from "lucide-react";

export default function FlightsPage() {
  const defaultFlights = [
    { id: 1, flight: "EA-101", asal: "Jakarta (CGK)", tujuan: "Singapore (SIN)", etd: "13:20", eta: "15:45", status: "departed", defaultStatus: "departed" },
    { id: 2, flight: "EA-205", asal: "Surabaya (SUB)", tujuan: "Bangkok (BKK)", etd: "15:30", eta: "18:00", status: "on-time", defaultStatus: "on-time" },
    { id: 3, flight: "EA-312", asal: "Bali (DPS)", tujuan: "Tokyo (NRT)", etd: "16:45", eta: "23:30", status: "delayed", defaultStatus: "delayed" },
    { id: 4, flight: "EA-408", asal: "Jakarta (CGK)", tujuan: "Hong Kong (HKG)", etd: "18:00", eta: "21:45", status: "on-time", defaultStatus: "on-time" },
    { id: 5, flight: "EA-156", asal: "Medan (KNO)", tujuan: "Kuala Lumpur (KUL)", etd: "19:15", eta: "20:30", status: "on-time", defaultStatus: "on-time" },
    { id: 6, flight: "EA-523", asal: "Jakarta (CGK)", tujuan: "Sydney (SYD)", etd: "20:30", eta: "06:15", status: "on-time", defaultStatus: "on-time" },
    { id: 7, flight: "EA-777", asal: "Bali (DPS)", tujuan: "Dubai (DXB)", etd: "21:00", eta: "03:45", status: "on-time", defaultStatus: "on-time" },
    { id: 8, flight: "EA-889", asal: "Surabaya (SUB)", tujuan: "Seoul (ICN)", etd: "22:10", eta: "05:00", status: "delayed", defaultStatus: "delayed" },
    { id: 9, flight: "EA-990", asal: "Jakarta (CGK)", tujuan: "Tokyo (NRT)", etd: "23:00", eta: "06:30", status: "on-time", defaultStatus: "on-time" },
    { id: 10, flight: "EA-321", asal: "Medan (KNO)", tujuan: "Singapore (SIN)", etd: "12:00", eta: "13:45", status: "departed", defaultStatus: "departed" },
  ];

  const [flights, setFlights] = useState(defaultFlights);

  const [selected, setSelected] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("default");
  useEffect(() => {
    const saved = localStorage.getItem("flights");

    if (saved) {
      setFlights(JSON.parse(saved));
    }
  }, []);



  const totalOnTime = flights.filter(f => f.status === "on-time").length;
  const totalDelayed = flights.filter(f => f.status === "delayed").length;
  const totalDeparted = flights.filter(f => f.status === "departed").length;

  const openModal = (flight: any) => {
    setSelected(flight);

    if (flight.status === "delayed") {
      setNewStatus("delayed");
    } else {
      setNewStatus("default");
    }
  };

  const closeModal = () => setSelected(null);

  const updateStatus = () => {
    const finalStatus =
      newStatus === "default"
        ? selected.defaultStatus
        : "delayed";

    const updatedFlights = flights.map(f =>
      f.id === selected.id
        ? { ...f, status: finalStatus }
        : f
    );

    setFlights(updatedFlights);

    localStorage.setItem(
      "flights",
      JSON.stringify(updatedFlights)
    );

    closeModal();
  };

  const statusUI = (status: string) => {
    if (status === "departed")
      return (
        <span className="flex items-center gap-1 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs w-fit">
          <Plane size={14} /> Departed
        </span>
      );

    if (status === "on-time")
      return (
        <span className="flex items-center gap-1 bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs w-fit">
          <CheckCircle size={14} /> On-Time
        </span>
      );

    return (
      <span className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs w-fit">
        <AlertTriangle size={14} /> Delayed
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
            <p className="text-gray-500 text-sm">On-Time</p>
            <h2 className="text-2xl font-bold text-green-600">
              {totalOnTime}
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
              <th className="p-3 text-left">Flight</th>
              <th className="p-3 text-left">Asal</th>
              <th className="p-3 text-left">Tujuan</th>
              <th className="p-3 text-left">ETD</th>
              <th className="p-3 text-left">ETA</th>
              <th className="p-3 text-left">Status</th>
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

              </tr>
            ))}
          </tbody>
        </table>
      </div>



    </div>
  );
}