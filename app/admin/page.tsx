"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  Package,
  CheckCircle,
  TrendingUp,
  ArrowUpRight,
  AlertTriangle,
  Clock,
} from "lucide-react";

export default function AdminPage() {
  // =====================================================
  // STATE
  // =====================================================

  const [mounted, setMounted] = useState(false);

  const [shipments, setShipments] = useState<any[]>([]);

  // =====================================================
  // FETCH DATA
  // =====================================================

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const shipmentRes = await fetch("/api/shipments");
      const shipmentJson = await shipmentRes.json();

      setShipments(shipmentJson);
    } catch (error) {
      console.error(error);
    }
  };

  // =====================================================
  // MOUNT CHECK
  // =====================================================

  if (!mounted) return null;

  // =====================================================
  // DATE
  // =====================================================

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // =====================================================
  // DATA MAPPING
  // =====================================================

  const dataDashboard = shipments.map((s: any) => {
    return {
      ...s,

      flightNumber: s.flight_number || "-",
      flightStatus: s.flight_status || "Unknown",
      etd: s.etd || "--:--",
    };
  });

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalCargo = dataDashboard.length;

  const scheduled = dataDashboard.filter(
    (s: any) => s.flightStatus === "Scheduled"
  ).length;

  const delayed = dataDashboard.filter(
    (s: any) => s.flightStatus === "Delayed"
  ).length;

  const departed = dataDashboard.filter(
    (s: any) =>
      s.flightStatus === "Departed" ||
      s.flightStatus === "In Transit"
  ).length;

  // =====================================================
  // DUMMY CHART
  // =====================================================

  const chartData = [
    {
      name: "Small",
      value: 4,
    },
    {
      name: "Medium",
      value: 6,
    },
    {
      name: "Large",
      value: 3,
    },
    {
      name: "Heavy",
      value: 2,
    },
  ];

  // =====================================================
  // UI
  // =====================================================

  return (
    <div>
      {/* TITLE */}
      <h1 className="text-2xl font-bold">
        Dashboard Admin
      </h1>

      <p className="text-gray-500 mb-6">
        {today}
      </p>

      {/* ===================================================== */}
      {/* CARDS */}
      {/* ===================================================== */}

      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* TOTAL */}
        <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">
              Total Cargo
            </p>

            <h2 className="text-2xl font-bold">
              {totalCargo}
            </h2>
          </div>

          <Package className="text-blue-600" />
        </div>

        {/* SCHEDULED */}
        <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">
              Scheduled
            </p>

            <h2 className="text-2xl font-bold text-green-600">
              {scheduled}
            </h2>
          </div>

          <CheckCircle className="text-green-600" />
        </div>

        {/* DELAYED */}
        <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">
              Delayed
            </p>

            <h2 className="text-2xl font-bold text-red-600">
              {delayed}
            </h2>
          </div>

          <Clock className="text-red-600" />
        </div>

        {/* DEPARTED */}
        <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">
              Departed
            </p>

            <h2 className="text-2xl font-bold text-blue-600">
              {departed}
            </h2>
          </div>

          <TrendingUp className="text-blue-600" />
        </div>
      </div>

      {/* ===================================================== */}
      {/* CHART + RECENT */}
      {/* ===================================================== */}

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* ===================================================== */}
        {/* CHART */}
        {/* ===================================================== */}

        <div className="col-span-2 bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">
            Statistik Pengiriman Cargo
          </h2>

          <div className="h-64">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  fill="#082ce1"
                  radius={[10, 10, 0, 0]}
                  barSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ===================================================== */}
        {/* RECENT ACTIVITY */}
        {/* ===================================================== */}

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">
            Recent Activity
          </h2>

          <div className="space-y-4 text-sm">
            <div className="flex gap-3">
              <div className="w-[2px] bg-blue-300"></div>

              <div>
                <p className="font-medium">
                  AWB0001
                </p>

                <p className="text-blue-600">
                  Cargo Received
                </p>

                <p className="text-gray-400 text-xs">
                  Soekarno Hatta Cargo Terminal
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-[2px] bg-blue-300"></div>

              <div>
                <p className="font-medium">
                  AWB0002
                </p>

                <p className="text-blue-600">
                  In Air Transit
                </p>

                <p className="text-gray-400 text-xs">
                  Singapore Changi Airport
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-[2px] bg-blue-300"></div>

              <div>
                <p className="font-medium">
                  AWB0003
                </p>

                <p className="text-blue-600">
                  Customs Clearance
                </p>

                <p className="text-gray-400 text-xs">
                  Narita International Airport
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* TABLE */}
      {/* ===================================================== */}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <h2 className="font-semibold p-4 border-b">
          Flight Monitoring
        </h2>

        <table className="w-full min-w-[1100px] text-sm">
          <thead className="bg-gray-100 text-gray-500">
            <tr>
              <th className="p-3 text-left">
                AWB
              </th>

              <th className="p-3 text-left">
                Origin
              </th>

              <th className="p-3 text-left">
                Destination
              </th>

              <th className="p-3 text-left">
                Cargo Type
              </th>

              <th className="p-3 text-left">
                Flight
              </th>

              <th className="p-3 text-left">
                ETD
              </th>

              <th className="p-3 text-left">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {dataDashboard.map((s: any, index: number) => (
              <tr
                key={`${s.id}-${index}`}
                className="hover:bg-gray-50"
              >
                {/* AWB */}
                <td className="p-3 text-blue-600 font-medium">
                  {s.awb_number}
                </td>

                {/* ORIGIN */}
                <td className="p-3">
                  {s.origin_city}
                </td>

                {/* DESTINATION */}
                <td className="p-3">
                  {s.destination_city}
                </td>

                {/* TYPE */}
                <td className="p-3">
                  {s.shipping_type}
                </td>

                {/* FLIGHT */}
                <td className="p-3">
                  {s.flightNumber}
                </td>

                {/* ETD */}
                <td className="p-3">
                  {s.etd}
                </td>

                {/* STATUS */}
                <td className="p-3">
                  {s.flightStatus ===
                    "Departed" && (
                    <span className="flex items-center gap-1 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs w-fit">
                      <ArrowUpRight size={14} />
                      Departed
                    </span>
                  )}

                  {s.flightStatus ===
                    "Scheduled" && (
                    <span className="flex items-center gap-1 bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs w-fit">
                      <CheckCircle size={14} />
                      Scheduled
                    </span>
                  )}

                  {s.flightStatus ===
                    "Delayed" && (
                    <span className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs w-fit">
                      <AlertTriangle size={14} />
                      Delayed
                    </span>
                  )}

                  {s.flightStatus ===
                    "In Transit" && (
                    <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs w-fit">
                      <Clock size={14} />
                      In Transit
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}