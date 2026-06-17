"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft, CheckCircle, Clock, AlertTriangle, Package, Plane, MapPin,
} from "lucide-react";

const TrackingMap = dynamic(() => import("@/components/features/TrackingMap"), { ssr: false });

const STATUS_ORDER = ["Received", "Scheduled", "Departed", "In Transit", "Landed", "Delivered"];

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "received": return "bg-sky-100 text-sky-700 border-sky-300";
    case "scheduled": return "bg-gray-100 text-gray-600 border-gray-300";
    case "departed": return "bg-blue-100 text-blue-700 border-blue-300";
    case "in transit": return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "landed": return "bg-green-100 text-green-700 border-green-300";
    case "delivered": return "bg-emerald-100 text-emerald-700 border-emerald-300";
    case "delayed": return "bg-red-100 text-red-600 border-red-300";
    default: return "bg-gray-100 text-gray-500 border-gray-200";
  }
}

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }) + " WIB";
}

export default function DetailShipment() {
  const params = useParams();
  const router = useRouter();
  const awb = Array.isArray(params.awb) ? params.awb[0] : params.awb || "";

  const [loading, setLoading] = useState(true);
  const [searchAwb, setSearchAwb] = useState("");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/shipments?awb=${encodeURIComponent(awb)}`);
        const result = await res.json();
        if (result && result.length > 0) {
          setData(result[0]);
        } else {
          setData(null);
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    if (awb) fetchData();
    setSearchAwb(awb || "");
  }, [awb]);

  const handleSearch = () => {
    if (!searchAwb.trim()) return;
    router.push(`/tracking/${searchAwb.trim()}`);
  };

  const trackingHistory: any[] = data?.tracking_history || [];
  const currentStatus = data?.shipment_status || "";
  const currentStatusIdx = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="w-full pt-28 flex-1">
        <div className="max-w-5xl mx-auto px-6 py-10">

          <button
            onClick={() => router.push("/")}
            className="mb-8 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-semibold"
          >
            <ArrowLeft size={22} /> Back to Home
          </button>

          <h1 className="text-4xl font-bold text-center text-blue-900 mb-10">
            Cargo Tracking
          </h1>

          {/* SEARCH BOX */}
          <div className="bg-white rounded-2xl shadow-md p-5 mb-10 border border-gray-100">
            <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
              Airway Bill Number
            </p>
            <div className="flex gap-3">
              <input
                value={searchAwb}
                onChange={(e) => setSearchAwb(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                placeholder="Enter AWB number (e.g. AWB00000001)"
                className="flex-1 border border-gray-300 rounded-lg px-4 h-12 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg px-8 font-semibold transition"
              >
                Track
              </button>
            </div>
          </div>

          {loading && (
            <div className="py-24 text-center text-gray-500 font-medium text-lg">
              Loading tracking data...
            </div>
          )}

          {!loading && !data && (
            <div className="py-16 flex justify-center">
              <div className="bg-red-50 border border-red-200 px-10 py-8 rounded-2xl shadow text-center flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white text-2xl font-bold">✕</div>
                <div>
                  <h2 className="text-xl font-bold text-red-800">AWB Not Found</h2>
                  <p className="text-red-600 text-sm mt-1">Please check the AWB number and try again.</p>
                </div>
              </div>
            </div>
          )}

          {!loading && data && (
            <div className="space-y-6">

              {/* STATUS BANNER */}
              <div className={`rounded-xl border px-6 py-4 flex items-center justify-between ${getStatusColor(currentStatus)}`}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Current Status</p>
                  <p className="text-2xl font-bold mt-0.5">{currentStatus}</p>
                </div>
                <div className="text-4xl opacity-30">
                  {currentStatus === "Delivered" ? "✅" : currentStatus === "Delayed" ? "⚠️" : "✈️"}
                </div>
              </div>

              {/* TWO COLUMN: Info + Map */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* LEFT: Shipment Info */}
                <div className="space-y-4">
                  {/* Shipment Info */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h2 className="font-bold text-blue-700 mb-4 text-base">
                      Shipment Information
                    </h2>
                    <dl className="space-y-2.5 text-sm">
                      {[
                        ["AWB Number", data.awb_number],
                        ["Shipment Date", new Date(data.shipment_date).toLocaleDateString("en-GB")],
                        ["Sender", data.sender_name],
                        ["Receiver", data.receiver_name],
                        ["Shipping Type", data.shipping_type],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between">
                          <dt className="text-gray-500">{label}</dt>
                          <dd className="font-semibold text-gray-800 text-right">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {/* Route */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h2 className="font-bold text-blue-700 mb-4 text-base">
                      Route
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">From</p>
                        <p className="font-bold text-gray-800 mt-1">{data.origin_city}</p>
                      </div>
                      <div className="text-2xl text-blue-400">→</div>
                      <div className="flex-1 text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">To</p>
                        <p className="font-bold text-gray-800 mt-1">{data.destination_city}</p>
                      </div>
                    </div>
                  </div>

                  {/* Flight Info */}
                  {data.flight_number && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                      <h2 className="font-bold text-blue-700 mb-4 text-base">
                        Flight Information
                      </h2>
                      <dl className="space-y-2.5 text-sm">
                        {[
                          ["Flight Number", data.flight_number],
                          ["Vehicle Code", data.vehicle_code || "—"],
                          ["Flight Status", data.flight_status || "—"],
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between">
                            <dt className="text-gray-500">{label}</dt>
                            <dd className="font-semibold text-gray-800">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>

                {/* RIGHT: Map */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <h2 className="font-bold text-blue-700 mb-3 flex items-center gap-2 text-base">
                    Route Map
                  </h2>
                  <TrackingMap
                    origin={data.origin_city}
                    destination={data.destination_city}
                    status={currentStatus}
                  />
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Simulated route based on shipment data
                  </p>
                </div>
              </div>

              {/* STATUS PROGRESS */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-blue-700 mb-6 ">
                  Shipment Progress
                </h2>
                <div className="flex items-center justify-between w-full overflow-x-auto pb-2">
                  {STATUS_ORDER.map((step, i) => {
                    const stepIdx = STATUS_ORDER.indexOf(step);
                    const isAchieved = stepIdx < currentStatusIdx;
                    const isActive = step === currentStatus;
                    let circleClass = "w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ";
                    if (isActive && currentStatus === "Delayed") circleClass += "border-red-500 bg-red-100 text-red-600";
                    else if (isActive) circleClass += "border-blue-500 bg-blue-100 text-blue-700";
                    else if (isAchieved) circleClass += "border-emerald-500 bg-emerald-100 text-emerald-700";
                    else circleClass += "border-gray-300 bg-gray-100 text-gray-400";

                    return (
                      <div key={step} className="flex items-center flex-1">
                        <div className="flex flex-col items-center w-20">
                          <div className={circleClass}>
                            {isAchieved ? <CheckCircle size={14} /> : isActive && currentStatus === "Delayed" ? <AlertTriangle size={14} /> : <span className="text-xs font-bold">{i + 1}</span>}
                          </div>
                          <p className={`text-[10px] font-semibold mt-2 text-center ${isActive ? "text-blue-700" : isAchieved ? "text-emerald-700" : "text-gray-400"}`}>
                            {step}
                          </p>
                        </div>
                        {i < STATUS_ORDER.length - 1 && (
                        <div
                          className={`h-[2px] flex-1 mx-2 ${
                            i < currentStatusIdx
                              ? "bg-emerald-400"
                              : "bg-gray-200"
                          }`}
                        />
                      )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TRACKING HISTORY */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-blue-700 mb-6 flex items-center gap-2">
                  Tracking History
                </h2>
                {trackingHistory.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">No tracking events available yet.</p>
                ) : (
                  <div className="space-y-0">
                    {trackingHistory.map((item: any, i: number) => {
                      const isLast = i === trackingHistory.length - 1;
                      return (
                        <div key={item.id || i} className="flex gap-5">
                          <div className="flex flex-col items-center">
                            <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 border-2 ${isLast ? "border-blue-500 bg-blue-500" : "border-emerald-500 bg-emerald-500"}`} />
                            {!isLast && <div className="w-[2px] bg-emerald-200 flex-1 my-1 min-h-[32px]" />}
                          </div>
                          <div className={`pb-6 ${isLast ? "pb-2" : ""}`}>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                            <p className="text-sm font-medium text-gray-700 mt-1">{item.location}</p>
                            <p className="text-xs text-blue-600 font-semibold mt-0.5">{formatDateTime(item.tracked_at)}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}