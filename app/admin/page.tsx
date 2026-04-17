"use client";
import { CartesianGrid } from "recharts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Package,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  AlertTriangle,
  Clock,
} from "lucide-react";

export default function AdminPage() {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // AMBIL DATA SHIPMENTS
  const shipments =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("shipments") || "[]")
      : [];

  // AMBIL DATA FLIGHTS
  const flightsData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("flights") || "[]")
      : [];

  // GABUNGKAN DATA
  const dataDashboard = shipments.map((s: any) => {
    const flight = flightsData.find((f) => f.flight === s.flight);

    return {
      ...s,
      flightStatus: flight ? flight.status : "unknown",
      etd: flight ? flight.etd : "--:--",
    };
  });

  // HITUNG SUMMARY
  const totalCargo = dataDashboard.length;

  const onTime = dataDashboard.filter(
    (s: any) => s.flightStatus === "on-time"
  ).length;

  const delayed = dataDashboard.filter(
    (s: any) => s.flightStatus === "delayed"
  ).length;

  const departed = dataDashboard.filter(
    (s: any) => s.flightStatus === "departed"
  ).length;

  // CHART (dummy)
  const chartData = [
    { name: "Sen", value: 45 },
    { name: "Sel", value: 52 },
    { name: "Rab", value: 48 },
    { name: "Kam", value: 60 },
    { name: "Jum", value: 55 },
    { name: "Sab", value: 35 },
    { name: "Min", value: 42 },
  ];

  return (
    <div>
      {/* TITLE */}
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>
      <p className="text-gray-500 mb-6">{today}</p>

      {/* CARDS */}
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
            <p className="text-gray-500 text-sm">On-Time</p>
            <h2 className="text-2xl font-bold text-green-600">
              {onTime}
            </h2>
          </div>
          <CheckCircle className="text-green-600" />
        </div>

        <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Delayed</p>
            <h2 className="text-2xl font-bold text-red-600">
              {delayed}
            </h2>
          </div>
          <Clock className="text-red-600" />
        </div>

        <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Departed</p>
            <h2 className="text-2xl font-bold text-blue-600">
              {departed}
            </h2>
          </div>
          <TrendingUp className="text-blue-600" />
        </div>
      </div>

      {/* CHART + ACTIVITY */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* CHART */}
        <div className="col-span-2 bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">
            Statistik Pengiriman Mingguan
          </h2>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>

                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />

                <YAxis
                  domain={[0, 80]}
                  ticks={[0, 15, 30, 45, 60, 80]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
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

        {/* ✅ RECENT ACTIVITY */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Recent Activity</h2>

          <div className="space-y-4 text-sm">

            <div className="flex gap-3">
              <div className="w-[2px] bg-blue-300"></div>
              <div>
                <p className="font-medium">AWB001234567</p>
                <p className="text-blue-600">Departed</p>
                <p className="text-gray-400 text-xs">
                  Jakarta Airport • 2 jam lalu
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-[2px] bg-blue-300"></div>
              <div>
                <p className="font-medium">AWB005678901</p>
                <p className="text-blue-600">Loaded to Aircraft</p>
                <p className="text-gray-400 text-xs">
                  Medan Airport • 3 jam lalu
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-[2px] bg-blue-300"></div>
              <div>
                <p className="font-medium">AWB003456789</p>
                <p className="text-blue-600">Sortation</p>
                <p className="text-gray-400 text-xs">
                  Bali Hub • 4 jam lalu
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-[2px] bg-blue-300"></div>
              <div>
                <p className="font-medium">AWB002345678</p>
                <p className="text-blue-600">Received</p>
                <p className="text-gray-400 text-xs">
                  Surabaya Hub • 5 jam lalu
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <h2 className="font-semibold p-4 border-b">
          Daftar Kargo Hari Ini
        </h2>

        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-500">
            <tr>
              <th className="p-3 text-left">AWB</th>
              <th className="p-3 text-left">Asal</th>
              <th className="p-3 text-left">Tujuan</th>
              <th className="p-3 text-left">Berat</th>
              <th className="p-3 text-left">No. Penerbangan</th>
              <th className="p-3 text-left">ETD</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {dataDashboard.map((s: any) => (
              <tr key={s.id} className="hover:bg-gray-50">

                <td className="p-3 text-blue-600 font-medium">{s.awb}</td>
                <td className="p-3">{s.asal}</td>
                <td className="p-3">{s.tujuan}</td>
                <td className="p-3">{s.berat} kg</td>
                <td className="p-3">{s.flight}</td>
                <td className="p-3">{s.etd}</td>

                <td className="p-3">

                  {s.flightStatus === "departed" && (
                    <span className="flex items-center gap-1 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs w-fit">
                      <ArrowUpRight size={14} /> Departed
                    </span>
                  )}

                  {s.flightStatus === "on-time" && (
                    <span className="flex items-center gap-1 bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs w-fit">
                      <CheckCircle size={14} /> On-Time
                    </span>
                  )}

                  {s.flightStatus === "delayed" && (
                    <span className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs w-fit">
                      <AlertTriangle size={14} /> Delayed
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