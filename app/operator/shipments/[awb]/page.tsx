"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, Check, Clock, CheckCircle, AlertTriangle } from "lucide-react";

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "received":
      return "bg-sky-100 text-sky-700";

    case "scheduled":
      return "bg-gray-100 text-gray-600";

    case "departed":
      return "bg-blue-100 text-blue-700";

    case "in transit":
      return "bg-yellow-100 text-yellow-700";

    case "landed":
      return "bg-green-100 text-green-700";

    case "delivered":
      return "bg-emerald-100 text-emerald-700";

    case "delayed":
      return "bg-red-100 text-red-600";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

function formatDateTime(dt: string) {
  const d = new Date(dt);

  return (
    d.toLocaleString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }) + " WIB"
  );
}

export default function DetailShipment() {

  const params = useParams();
  const awb = Array.isArray(params.awb) ? params.awb[0] : params.awb;
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!awb) return;

    setLoading(true);
    setError("");

    fetch(`/api/shipments?awb=${encodeURIComponent(awb)}`)
      .then((res) => res.json())
      .then((result) => {
        if (Array.isArray(result) && result.length > 0) {
          setData(result[0]);
        } else {
          setError("Data not found");
        }
      })
      .catch(() => {
        setError("Failed to load shipment");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [awb]);

  const steps = [
    "Received",
    "Sortation",
    "Loaded to Aircraft",
    "Departed",
    "Arrived"
  ];

  const statusMap: any = {
    "Received": 0,
    "In Transit": 3,
    "Delivered": 4,
  };

  const STATUS_ORDER = [
    "Received",
    "Scheduled",
    "Departed",
    "In Transit",
    "Landed",
    "Delivered",
  ];

  const trackingHistory: any[] = data?.tracking_history || [];

  const achievedStatuses = new Set(
    trackingHistory.map((t: any) => t.status)
  );

  const currentStatus = data?.shipment_status || "";

  const currentStatusIdx =
    STATUS_ORDER.indexOf(currentStatus);

  if (loading) {
    return (
      <div>
        <button
          onClick={() => router.push("/operator/shipments")}
          className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-medium"
        >
          <ArrowLeft size={18} />
          Back to shipment list
        </button>
        <div className="p-6">Loading shipment details...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <button
          onClick={() => router.push("/operator/shipments")}
          className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-medium"
        >
          <ArrowLeft size={18} />
          Back to shipment list
        </button>
        <div className="p-6 text-red-500">{error || "Data tidak ditemukan"}</div>
      </div>
    );
  }

  const currentIndex = statusMap[data.shipment_status] ?? 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Transit":
        return "bg-yellow-100 text-yellow-600";

      case "Received":
      case "Departed":
        return "bg-blue-100 text-blue-600";

      case "Delivered":
      case "Scheduled":
      case "Landed":
        return "bg-green-100 text-green-600";

      case "Delayed":
        return "bg-red-100 text-red-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div>

      {/* BACK */}
      <button
        onClick={() => router.push("/operator/shipments")}
        className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-medium"
      >
        <ArrowLeft size={18} />
        Back to shipment list
      </button>

      {/* DETAIL */}
      {/* <div className="bg-white p-6 rounded-xl shadow mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-blue-600 p-2 rounded-lg">
            <Package size={25} />
          </div>
          <h2 className="font-semibold text-lg">Detail Shipment</h2>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">

          <div>
            <p className="text-gray-400">Nomor AWB</p>
            <p className="font-semibold">{data.awb_number}</p>
          </div>

          <div>
            <p className="text-gray-400">Berat</p>
            <p className="font-semibold">{data.weight} kg</p>
          </div>

          <div>
            <p className="text-gray-400">No. Penerbangan</p>
            <p className="font-semibold">{data.flight_number}</p>
          </div>

          <div>
            <p className="text-gray-400">Asal</p>
            <p className="font-semibold">{data.origin_city}</p>
          </div>

          <div>
            <p className="text-gray-400">Tujuan</p>
            <p className="font-semibold">{data.destination_city}</p>
          </div>

          <div>
            <p className="text-gray-400">Status Saat Ini</p>
            <p className="font-semibold text-blue-600">{data.shipment_status}</p>
          </div>

        </div>
      </div> */}

      <div className="space-y-6">

        {/* SHIPMENT INFORMATION */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-blue-700 mb-4">
            Shipment Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <p className="text-gray-400 text-sm">AWB Number</p>
              <p className="font-semibold">{data.awb_number}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Shipment Date</p>
              <p className="font-semibold">
                {new Date(data.shipment_date).toLocaleDateString("en-GB")}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Flight Number</p>
              <p className="font-semibold">{data.flight_number || "-"}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Current Status</p>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                  data.shipment_status
                )}`}
              >
                {data.shipment_status}
              </span>
            </div>

          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-blue-700 mb-4">
            Flight Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Flight Number</p>
              <p className="font-semibold">{data.flight_number || "-"}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Vehicle Code</p>
              <p className="font-semibold">{data.vehicle_code || "-"}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Flight Status</p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                  data.flight_status
                )}`}
              >
                {data.flight_status || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* SENDER & RECEIVER */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-blue-700 mb-4">
            Sender & Receiver
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <p className="text-gray-400 text-sm">Sender</p>
              <p className="font-semibold">{data.sender_name}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Receiver</p>
              <p className="font-semibold">{data.receiver_name}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Sender Phone</p>
              <p className="font-semibold">{data.phone_number}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Receiver Phone</p>
              <p className="font-semibold">{data.receiver_phone_number}</p>
            </div>

          </div>
        </div>

        {/* ROUTE INFORMATION */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-blue-700 mb-4">
            Route Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <p className="text-gray-400 text-sm">Origin</p>
              <p className="font-semibold">{data.origin_city}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Destination</p>
              <p className="font-semibold">{data.destination_city}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Shipping Type</p>
              <p className="font-semibold">{data.shipping_type}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Vehicle</p>
              <p className="font-semibold">{data.vehicle_name}</p>
            </div>

          </div>
        </div>

        {/* CARGO INFORMATION */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-blue-700 mb-4">
            Cargo Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <p className="text-gray-400 text-sm">Item Name</p>
              <p className="font-semibold">{data.item_name}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Item Type</p>
              <p className="font-semibold">{data.item_type}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Weight</p>
              <p className="font-semibold">{data.weight} kg</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Description</p>
              <p className="font-semibold">
                {data.item_description || "-"}
              </p>
            </div>

          </div>
        </div>

        {/* PAYMENT INFORMATION */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-blue-700 mb-4">
            Payment Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <p className="text-gray-400 text-sm">Shipping Price</p>
              <p className="font-semibold">
                Rp {Number(data.shipping_price).toLocaleString("id-ID")}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Payment Method</p>
              <p className="font-semibold">
                {data.payment_method}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Payment Date</p>
              <p className="font-semibold">
              {new Date(data.payment_date).toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            </div>


            <div>
              <p className="text-gray-400 text-sm">Transaction Status</p>
              <p className="font-semibold">
                {data.transaction_status}
              </p>
            </div>

          </div>
        </div>

        {/* TRACKING TIMELINE */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-blue-700 mb-6 flex items-center gap-2">
            <p /> Tracking Timeline
          </h2>

          {/* Status progress bar */}
          <div className="flex items-center mb-8 overflow-x-auto pb-2">
            {STATUS_ORDER.map((step, i) => {
              const isAchieved = achievedStatuses.has(step) || STATUS_ORDER.indexOf(step) < currentStatusIdx;
              const isActive = step === currentStatus;
              const isDelayed = currentStatus === "Delayed";

              let circleClass = "bg-gray-200 border-gray-300 text-gray-400";
              if (isActive && isDelayed) circleClass = "bg-red-100 border-red-500 text-red-600";
              else if (isActive) circleClass = "bg-blue-100 border-blue-500 text-blue-700";
              else if (isAchieved) circleClass = "bg-emerald-100 border-emerald-500 text-emerald-700";

              return (
                <div key={step} className="flex items-center flex-1 min-w-[80px]">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${circleClass}`}>
                      {isAchieved ? <CheckCircle size={14} /> : isActive && isDelayed ? <AlertTriangle size={14} /> : <span className="text-xs font-bold">{i + 1}</span>}
                    </div>
                    <p className={`text-[10px] font-semibold mt-1 text-center whitespace-nowrap ${isActive ? "text-blue-700" : isAchieved ? "text-emerald-700" : "text-gray-400"}`}>
                      {step}
                    </p>
                  </div>
                  {i < STATUS_ORDER.length - 1 && (
                    <div className={`h-[2px] flex-1 mx-1 ${isAchieved ? "bg-emerald-400" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Tracking history entries */}
          {trackingHistory.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No tracking history available.</p>
          ) : (
            <div className="space-y-0">
              {trackingHistory.map((item: any, i: number) => {
                const isLast = i === trackingHistory.length - 1;
                return (
                  <div key={item.id || i} className="flex gap-4">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full border-2 mt-1 flex-shrink-0 ${isLast ? "border-blue-500 bg-blue-500" : "border-emerald-500 bg-emerald-500"}`} />
                      {!isLast && <div className="w-[2px] bg-emerald-200 flex-1 my-1" />}
                    </div>
                    {/* Content */}
                    <div className={`pb-5 ${isLast ? "" : ""}`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{item.location}</p>
                      <p className="text-xs text-blue-600 font-medium mt-0.5">{formatDateTime(item.tracked_at)}</p>
                      {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      

    </div>
  );
}