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

  useEffect(() => {
    document.title = "Dashboard Admin - ExpressAir Cargo System";
  }, []);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // =====================================================
  // FETCH DATA
  // =====================================================

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const shipmentRes = await fetch("/api/shipments"); // eror 2, pnyebab
      const shipmentJson = await shipmentRes.json();

      console.log("SHIPMENT RESPONSE:", shipmentJson);
      console.log("IS ARRAY:", Array.isArray(shipmentJson));

      setShipments(
        Array.isArray(shipmentJson)
          ? shipmentJson
          : []
      );

    } catch (error) {
      console.error(error);
      setShipments([]);
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

  const dataDashboard = shipments.map((s: any) => { //error 2
    return {
      ...s,

      flightNumber: s.flight_number || "-",
      flightStatus: s.flight_status || "Unknown",
      etd: s.etd || "--:--",
    };
  });

  // =====================================================
  // SUMMARY & PAGINATION DATA
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

  // Calculate items for current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dataDashboard.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(dataDashboard.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // =====================================================
  // DYNAMIC CHART
  // =====================================================

  const shippingTypesCount = dataDashboard.reduce((acc: any, curr: any) => {
    const type = curr.shipping_type || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(shippingTypesCount).map((key) => ({
    name: key,
    value: shippingTypesCount[key],
  }));

  // =====================================================
  // RECENT ACTIVITY DATA
  // =====================================================

  const recentActivities = [...dataDashboard]
    .sort((a, b) => {
      if (a.shipment_date && b.shipment_date) {
        return new Date(b.shipment_date).getTime() - new Date(a.shipment_date).getTime();
      }
      return (b.id || 0) - (a.id || 0);
    })
    .slice(0, 3);

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
            Cargo Shipment Statistics
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
            {recentActivities.map((item: any, index: number) => (
              <div key={index} className="flex gap-3">
                <div className="w-[2px] bg-blue-300"></div>

                <div>
                  <p className="font-medium">
                    {item.awb_number}
                  </p>

                  <p className="text-blue-600">
                    {item.shipment_status}
                  </p>

                  <p className="text-gray-400 text-xs">
                    {item.origin_city} &rarr; {item.destination_city}
                  </p>
                </div>
              </div>
            ))}
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
            {currentItems.map((s: any, index: number) => (
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

                  {s.flightStatus ===
                    "Landed" && (
                      <span className="flex items-center gap-1 bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs w-fit">
                        <CheckCircle size={14} />
                        Landed
                      </span>
                    )}

                  {s.flightStatus !== "Departed" &&
                    s.flightStatus !== "Scheduled" &&
                    s.flightStatus !== "Delayed" &&
                    s.flightStatus !== "In Transit" &&
                    s.flightStatus !== "Landed" && (
                      <span className="flex items-center gap-1 bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs w-fit">
                        {s.flightStatus}
                      </span>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 0 && (
        <div className="flex justify-center gap-2 p-4 mt-4">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
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
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() =>
              setCurrentPage(p => Math.min(totalPages, p + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}