"use client";

import { useState } from "react";
import {
  FileText,
  FileDown,
  FileSpreadsheet,
  Package,
  Clock3,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function ReportPage() {
  const [startDate, setStartDate] = useState("2026-04-01");
  const [endDate, setEndDate] = useState("2026-04-09");
  const [error, setError] = useState("");

  const generateChartData = (start: string, end: string) => {
    const data = [];
    const current = new Date(start);
    const last = new Date(end);

    while (current <= last) {
      data.push({
        name: current.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        }),
        value: Math.floor(Math.random() * 30) + 40,
      });

      current.setDate(current.getDate() + 1);
    }

    return data;
  };

  const [chartData, setChartData] = useState(
    generateChartData("2026-04-01", "2026-04-09")
  );

  const applyFilter = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diff =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    if (diff < 0) {
      setError("Tanggal akhir tidak boleh sebelum tanggal mulai");
      return;
    }

    if (diff > 31) {
      setError("Maksimal hanya 31 hari");
      return;
    }

    setError("");
    setChartData(generateChartData(startDate, endDate));
  };

  return (
    <div>
      {/* TITLE */}
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="text-gray-500 mb-6">
        Analisa dan laporan pengiriman kargo
      </p>

      {/* FILTER */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <CalendarDays size={20} className="text-blue-700" />
          Filter Periode
        </h2>

        <div className="grid grid-cols-[1fr_1fr_180px] gap-4 items-end">

          <div>
            <label className="text-sm text-gray-500">
              Tanggal Mulai
            </label>

            <input
              type="date"
              className="w-full h-11 border rounded-lg px-4 mt-1"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Tanggal Akhir
            </label>

            <input
              type="date"
              className="w-full h-11 border rounded-lg px-4 mt-1"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button
            onClick={applyFilter}
            className="h-11 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
          >
            Terapkan
          </button>

        </div>

        {error && (
          <p className="text-red-500 text-sm mt-3">{error}</p>
        )}
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        {/* TOTAL */}
        <div className="bg-white p-5 rounded-xl shadow flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Shipment</p>
            <h2 className="text-3xl font-bold mt-2">508</h2>
            <p className="text-sm text-gray-400 mt-2">
              dalam periode terpilih
            </p>
          </div>

          <Package className="text-blue-600" size={22} />
        </div>

        {/* ON TIME */}
        <div className="bg-white p-5 rounded-xl shadow flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">On-Time Rate</p>
            <h2 className="text-3xl font-bold text-green-600 mt-2">
              92.3%
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              pengiriman tepat waktu
            </p>
          </div>

          <CheckCircle2 className="text-green-600" size={22} />
        </div>

        {/* DELAYED */}
        <div className="bg-white p-5 rounded-xl shadow flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Delayed</p>
            <h2 className="text-3xl font-bold text-red-600 mt-2">
              39
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              pengiriman tertunda
            </p>
          </div>

          <Clock3 className="text-red-600" size={22} />
        </div>

      </div>

      {/* CHART */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="font-semibold text-xl mb-4">
          Trend Pengiriman Harian
        </h2>

        <div className="overflow-x-auto">
          <div
            style={{
              width: `${chartData.length * 110}px`,
              minWidth: "100%",
              height: "420px",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                />

                <XAxis dataKey="name" />

                <YAxis
                  domain={[0, 80]}
                  ticks={[0, 20, 40, 60, 80]}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#1d4ed8"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                    fill: "#1d4ed8",
                    stroke: "#1d4ed8",
                    strokeWidth: 0,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* EXPORT */}
      {/* EXPORT */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="font-semibold mb-3 flex items-center gap-2 text-xl">
          <FileText className="text-blue-700" size={22} />
          Export Data
        </h2>

        <p className="text-gray-500 mb-5">
          Download laporan data shipment dalam format yang Anda inginkan
        </p>

        <div className="flex gap-3">

          <button className="border border-blue-700 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
            <FileDown size={18} />
            Export CSV
          </button>

          <button className="bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <FileSpreadsheet size={18} />
            Export Excel
          </button>

        </div>
      </div>
    </div>
  );
}