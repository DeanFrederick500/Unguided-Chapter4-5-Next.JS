"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Package, CheckCircle, TrendingUp, ArrowUpRight, AlertTriangle, Clock, Map,
} from "lucide-react";

const DashboardMap = dynamic(() => import("@/components/features/DashboardMap"), { ssr: false });

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [shipments, setShipments] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);

  useEffect(() => {
    document.title = "Dashboard Admin - ExpressAir Cargo System";
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shipmentRes, flightRes] = await Promise.all([
        fetch("/api/shipments"),
        fetch("/api/flights"),
      ]);
      const shipmentJson = await shipmentRes.json();
      const flightJson = await flightRes.json();
      setShipments(Array.isArray(shipmentJson) ? shipmentJson : []);
      setFlights(Array.isArray(flightJson) ? flightJson : []);
    } catch (error) {
      console.error(error);
      setShipments([]);
      setFlights([]);
    }
  };

  if (!mounted) return null;

  const today = new Date().toLocaleDateString("en-Id", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const dataDashboard = shipments.map((s: any) => ({
    ...s,
    flightNumber: s.flight_number || "—",
    flightStatus: s.flight_status || "Unknown",
    etd: s.etd || "--:--",
  }));

  const totalCargo = dataDashboard.length;
  const scheduled = dataDashboard.filter((s) => s.flightStatus === "Scheduled").length;
  const delayed = dataDashboard.filter((s) => s.flightStatus === "Delayed").length;
  const departed = dataDashboard.filter((s) => s.flightStatus === "Departed" || s.flightStatus === "In Transit").length;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dataDashboard.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(dataDashboard.length / itemsPerPage);

  const shipmentStatusCount = dataDashboard.reduce((acc: any, curr: any) => {
    const status = curr.shipment_status || "Unknown";

    acc[status] = (acc[status] || 0) + 1;

    return acc;
  }, {});

  const chartData = Object.keys(shipmentStatusCount).map((key) => ({
    name: key,
    value: shipmentStatusCount[key],
  }));

  const recentActivities = [...dataDashboard]
    .sort((a, b) => {
      if (a.shipment_date && b.shipment_date) {
        return new Date(b.shipment_date).getTime() - new Date(a.shipment_date).getTime();
      }
      return (b.id || 0) - (a.id || 0);
    })
    .slice(0, 3);

  return (
    <div>
      {/* TITLE */}
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>
      <p className="text-gray-500 mb-6">{today}</p>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Total Cargo</p>
            <h2 className="text-2xl font-bold">{totalCargo}</h2>
          </div>
          <Package className="text-blue-600" />
        </div>
        <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Scheduled</p>
            <h2 className="text-2xl font-bold text-green-600">{scheduled}</h2>
          </div>
          <CheckCircle className="text-green-600" />
        </div>
        <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Delayed</p>
            <h2 className="text-2xl font-bold text-red-600">{delayed}</h2>
          </div>
          <Clock className="text-red-600" />
        </div>
        <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Departed</p>
            <h2 className="text-2xl font-bold text-blue-600">{departed}</h2>
          </div>
          <TrendingUp className="text-blue-600" />
        </div>
      </div>

      {/* LIVE FLIGHT MAP */}
      <div className="bg-white rounded-xl shadow mb-6 p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Map size={20} className="text-blue-600" />
          Live Flight Map
          <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
            {flights.length} flights
          </span>
        </h2>
        {flights.length > 0 ? (
          <DashboardMap flights={flights} />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
            No flights available
          </div>
        )}
      </div>

      {/* CHART + RECENT */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Shipment Status Statistics</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#082ce1" radius={[10, 10, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4 text-sm">
            {recentActivities.map((item: any, index: number) => (
              <div key={index} className="flex gap-3">
                <div className="w-[2px] bg-blue-300" />
                <div>
                  <p className="font-medium">{item.awb_number}</p>
                  <p className="text-blue-600">{item.shipment_status}</p>
                  <p className="text-gray-400 text-xs">{item.origin_city} &rarr; {item.destination_city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FLIGHT MONITORING TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <h2 className="font-semibold p-4 border-b">Flight Monitoring</h2>
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="bg-gray-100 text-gray-500">
            <tr>
              <th className="p-3 text-left">AWB</th>
              <th className="p-3 text-left">Origin</th>
              <th className="p-3 text-left">Destination</th>
              <th className="p-3 text-left">Cargo Type</th>
              <th className="p-3 text-left">Flight</th>
              <th className="p-3 text-left">ETD</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {currentItems.map((s: any, index: number) => (
              <tr key={`${s.id}-${index}`} className="hover:bg-gray-50">
                <td className="p-3 text-blueprimary font-semibold">{s.awb_number}</td>
                <td className="p-3">{s.origin_city}</td>
                <td className="p-3">{s.destination_city}</td>
                <td className="p-3">{s.shipping_type}</td>
                <td className="p-3">{s.flightNumber}</td>
                <td className="p-3">{s.etd}</td>
                <td className="p-3">
                  {s.flightStatus === "Departed" && <span className="flex items-center gap-1 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs w-fit"><ArrowUpRight size={14} />Departed</span>}
                  {s.flightStatus === "Scheduled" && <span className="flex items-center gap-1 bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs w-fit"><CheckCircle size={14} />Scheduled</span>}
                  {s.flightStatus === "Delayed" && <span className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs w-fit"><AlertTriangle size={14} />Delayed</span>}
                  {s.flightStatus === "In Transit" && <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs w-fit"><Clock size={14} />In Transit</span>}
                  {s.flightStatus === "Landed" && <span className="flex items-center gap-1 bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs w-fit"><CheckCircle size={14} />Landed</span>}
                  {!["Departed","Scheduled","Delayed","In Transit","Landed"].includes(s.flightStatus) && (
                    <span className="flex items-center gap-1 bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs w-fit">{s.flightStatus}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <div className="flex justify-center gap-2 p-4 mt-4">
          <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : ""}`}>{i + 1}</button>
          ))}
          <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}
    </div>
  );
}