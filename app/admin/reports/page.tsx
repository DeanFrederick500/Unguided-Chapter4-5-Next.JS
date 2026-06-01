"use client";

import { useState, useEffect } from "react";

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

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [error, setError] = useState("");

  const [shipments, setShipments] = useState<any[]>([]);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date: Date) => {

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =====================================================
  // GET DATE ONLY
  // =====================================================

  const getOnlyDate = (dateString: string) => {

    if (!dateString) return "";

    return new Date(dateString)
      .toISOString()
      .split("T")[0];
  };

  // =====================================================
  // FETCH DATA
  // =====================================================

  useEffect(() => {

    const today = new Date();

    const firstDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const lastDay = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );

    setStartDate(formatDate(firstDay));

    setEndDate(formatDate(lastDay));

    const fetchShipments = async () => {

      try {

        const res = await fetch("/api/shipments");

        const data = await res.json();

        console.log("SHIPMENTS:", data);

        setShipments(data);

      } catch (error) {

        console.error(
          "Failed fetch shipments",
          error
        );

      }

    };

    fetchShipments();

  }, []);

  // =====================================================
  // FILTER SHIPMENTS
  // =====================================================

  const filteredShipments = shipments.filter(
    (shipment: any) => {

      if (!shipment.shipment_date)
        return false;

      const shipmentDate =
        getOnlyDate(
          shipment.shipment_date
        );

      return (
        shipmentDate >= startDate &&
        shipmentDate <= endDate
      );

    }
  );

  // =====================================================
  // GENERATE CHART DATA
  // =====================================================

  const generateChartData = () => {

    if (!startDate || !endDate)
      return [];

    const data = [];

    const start = new Date(startDate);

    const end = new Date(endDate);

    const current = new Date(start);

    while (current <= end) {

      const currentDate =
        formatDate(current);

      // =====================================================
      // COUNT ONLY CURRENT DATE
      // =====================================================

      const totalPerDay =
        filteredShipments.filter(
          (shipment: any) => {

            const shipmentDate =
              getOnlyDate(
                shipment.shipment_date
              );

            return (
              shipmentDate ===
              currentDate
            );

          }
        ).length;

      data.push({

        name:
          current.toLocaleDateString(
            "id-ID",
            {
              day: "2-digit",
              month: "short",
            }
          ),

        value: totalPerDay,

      });

      current.setDate(
        current.getDate() + 1
      );

    }

    return data;
  };

  const chartData =
    generateChartData();

  // =====================================================
  // TOTAL SHIPMENTS
  // =====================================================

  const totalShipments =
    filteredShipments.length;

  // =====================================================
  // DELIVERED
  // =====================================================

  const deliveredCount =
    filteredShipments.filter(
      (shipment: any) =>
        shipment.shipment_status ===
        "Delivered"
    ).length;

  // =====================================================
  // DELAYED
  // =====================================================

  const delayedCount =
    filteredShipments.filter(
      (shipment: any) =>
        shipment.shipment_status ===
        "Delayed"
    ).length;

  // =====================================================
  // ON TIME RATE
  // =====================================================

  const onTimeRate =
    totalShipments > 0
      ? (
        (deliveredCount /
          totalShipments) *
        100
      ).toFixed(1)
      : "0.0";

  // =====================================================
  // APPLY FILTER
  // =====================================================

  const applyFilter = () => {

    const start =
      new Date(startDate);

    const end =
      new Date(endDate);

    const diff =
      (end.getTime() -
        start.getTime()) /
      (1000 * 60 * 60 * 24);

    if (diff < 0) {

      setError(
        "Tanggal akhir tidak boleh sebelum tanggal mulai"
      );

      return;
    }

    if (diff > 31) {

      setError(
        "Maksimal filter hanya 31 hari"
      );

      return;
    }

    setError("");

  };

  // =====================================================
  // EXPORT
  // =====================================================

  const exportPDF = () => {
    alert("Export PDF berhasil!");
  };

  const exportExcel = () => {
    alert("Export Excel berhasil!");
  };

  return (

    <div>

      {/* ===================================================== */}
      {/* TITLE */}
      {/* ===================================================== */}

      <h1 className="text-2xl font-bold">
        Reports
      </h1>

      <p className="text-gray-500 mb-6">
        Analisa dan laporan pengiriman cargo
      </p>

      {/* ===================================================== */}
      {/* FILTER */}
      {/* ===================================================== */}

      <div className="bg-white p-5 rounded-xl shadow mb-6">

        <h2 className="font-semibold mb-4 flex items-center gap-2">

          <CalendarDays
            size={20}
            className="text-blue-700"
          />

          Filter Periode

        </h2>

        <div className="grid md:grid-cols-3 gap-4 items-end">

          <div>

            <label className="text-sm text-gray-500">
              Tanggal Mulai
            </label>

            <input
              type="date"
              className="w-full h-11 border rounded-lg px-4 mt-1"
              value={startDate}
              onChange={(e) =>
                setStartDate(
                  e.target.value
                )
              }
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
              onChange={(e) =>
                setEndDate(
                  e.target.value
                )
              }
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

          <p className="text-red-500 text-sm mt-3">
            {error}
          </p>

        )}

      </div>

      {/* ===================================================== */}
      {/* CARDS */}
      {/* ===================================================== */}

      <div className="grid md:grid-cols-3 gap-4 mb-6">

        {/* TOTAL */}

        <div className="bg-white p-5 rounded-xl shadow flex justify-between">

          <div>

            <p className="text-gray-500 text-sm">
              Total Shipment
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {totalShipments}
            </h2>

            <p className="text-sm text-gray-400 mt-2">
              seluruh shipment
            </p>

          </div>

          <Package
            className="text-blue-600"
            size={22}
          />

        </div>

        {/* ON TIME */}

        <div className="bg-white p-5 rounded-xl shadow flex justify-between">

          <div>

            <p className="text-gray-500 text-sm">
              On-Time Rate
            </p>

            <h2 className="text-3xl font-bold text-green-600 mt-2">
              {onTimeRate}%
            </h2>

            <p className="text-sm text-gray-400 mt-2">
              berdasarkan status landed
            </p>

          </div>

          <CheckCircle2
            className="text-green-600"
            size={22}
          />

        </div>

        {/* DELAYED */}

        <div className="bg-white p-5 rounded-xl shadow flex justify-between">

          <div>

            <p className="text-gray-500 text-sm">
              Delayed
            </p>

            <h2 className="text-3xl font-bold text-red-600 mt-2">
              {delayedCount}
            </h2>

            <p className="text-sm text-gray-400 mt-2">
              berdasarkan flight delayed
            </p>

          </div>

          <Clock3
            className="text-red-600"
            size={22}
          />

        </div>

      </div>

      {/* ===================================================== */}
      {/* CHART */}
      {/* ===================================================== */}

      <div className="bg-white p-6 rounded-xl shadow mb-6">

        <h2 className="font-semibold text-xl mb-4">
          Trend Pengiriman Harian
        </h2>

        <div className="overflow-x-auto">

          <div
            style={{
              width:
                `${chartData.length * 110}px`,
              minWidth: "100%",
              height: "420px",
            }}
          >

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart data={chartData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                />

                <XAxis dataKey="name" />

                <YAxis
                  allowDecimals={false}
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

      {/* ===================================================== */}
      {/* EXPORT */}
      {/* ===================================================== */}

      <div className="bg-white p-5 rounded-xl shadow">

        <h2 className="font-semibold mb-3 flex items-center gap-2 text-xl">

          <FileText
            className="text-blue-700"
            size={22}
          />

          Export Data

        </h2>

        <p className="text-gray-500 mb-5">
          Download laporan shipment
        </p>

        <div className="flex gap-3 flex-wrap">

          <button
            onClick={exportPDF}
            className="border border-blue-700 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >

            <FileDown size={18} />

            Export PDF

          </button>

          <button
            onClick={exportExcel}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >

            <FileSpreadsheet size={18} />

            Export Excel

          </button>

        </div>

      </div>

    </div>
  );
}