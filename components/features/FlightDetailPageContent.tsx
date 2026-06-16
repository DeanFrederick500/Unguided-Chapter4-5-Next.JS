"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plane, CheckCircle, AlertTriangle, Clock } from "lucide-react";

interface FlightDetails {
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

export default function FlightDetailPageContent({ role }: { role: "admin" | "operator" }) {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const [data, setData] = useState<FlightDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError("");

    fetch(`/api/flights?id=${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Penerbangan tidak ditemukan");
        }
        return res.json();
      })
      .then((result) => {
        if (result) {
          setData(result);
        } else {
          setError("Data tidak ditemukan");
        }
      })
      .catch((err) => {
        setError(err.message || "Gagal memuat detail penerbangan");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const getStatusBadge = (status: string) => {
    const normalized = status?.toLowerCase() || "";
    switch (normalized) {
      case "departed":
        return "bg-blue-100 text-blue-600";
      case "delayed":
        return "bg-red-100 text-red-600";
      case "landed":
        return "bg-green-100 text-green-600";
      case "in transit":
        return "bg-yellow-100 text-yellow-600";
      default: // Scheduled
        return "bg-gray-100 text-gray-600";
    }
  };

  const goBack = () => {
    router.push(`/${role}/flights`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-semibold text-sm"
        >
          <ArrowLeft size={18} />
          Back to Flight List
        </button>
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500 font-medium">
          Loading flight details...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-semibold text-sm"
        >
          <ArrowLeft size={18} />
          Back to Flight List
        </button>
        <div className="bg-white p-12 rounded-xl shadow-sm border border-red-100 text-center text-red-500 font-medium">
          {error || "Penerbangan tidak ditemukan"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* BACK BUTTON */}
      <button
        onClick={goBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-semibold text-sm"
      >
        <ArrowLeft size={18} />
        Back to flight list
      </button>

      {/* DETAIL FLIGHT */}
      <div className="space-y-6">
        {/* GENERAL INFORMATION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-blue-700 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Plane size={20} className="rotate-45" /> General Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Flight Number</p>
              <p className="font-bold text-lg text-gray-800 mt-1">{data.flight_number}</p>
            </div>

            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Current Status</p>
              <div className="mt-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(
                    data.status
                  )}`}
                >
                  {data.status}
                </span>
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Vehicle Code</p>
              <p className="font-semibold text-gray-800 mt-1">{data.vehicle_code || "-"}</p>
            </div>

            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Load Capacity</p>
              <p className="font-semibold text-gray-800 mt-1">
                {data.load_capacity ? `${Number(data.load_capacity).toLocaleString("id-ID")} kg` : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* ROUTE INFORMATION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-blue-700 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Clock size={20} /> Route Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Origin</p>
              <p className="font-bold text-gray-800 mt-1 text-base">{data.origin}</p>
            </div>

            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Destination</p>
              <p className="font-bold text-gray-800 mt-1 text-base">{data.destination}</p>
            </div>
          </div>
        </div>

        {/* ADDITIONAL INFORMATION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-blue-700 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
            <CheckCircle size={20} /> Additional Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Vehicle Name</p>
              <p className="font-semibold text-gray-800 mt-1">{data.vehicle_name || "-"}</p>
            </div>

            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Estimated Time of Departure (ETD)</p>
              <p className="font-semibold text-gray-800 font-mono mt-1 text-sm bg-gray-50 px-2 py-1 rounded w-fit border border-gray-100">
                {data.etd ? data.etd.substring(0, 5) : "-"}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Estimated Time of Arrival (ETA)</p>
              <p className="font-semibold text-gray-800 font-mono mt-1 text-sm bg-gray-50 px-2 py-1 rounded w-fit border border-gray-100">
                {data.eta ? data.eta.substring(0, 5) : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
