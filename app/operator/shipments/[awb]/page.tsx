"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, Check } from "lucide-react";

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
          setError("Data tidak ditemukan");
        }
      })
      .catch(() => {
        setError("Gagal memuat detail shipment");
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
        <div className="p-6">Loading shipement details...</div>
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

      </div>

      {/* TRACKING */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-4">Riwayat Tracking</h2>

        {steps.map((step, i) => {
          const done = i <= currentIndex;

          return (
            <div key={i} className="flex gap-4 mb-6">

              {/* BULAT + GARIS */}
              <div className="flex flex-col items-center">
                <div className="relative flex items-center justify-center">

                  {/* LINGKARAN LUAR */}
                  <div
                    className={`absolute w-8 h-8 rounded-full ${
                      done ? "bg-emerald-100" : "bg-gray-200"
                    }`}
                  ></div>

                  {/* LINGKARAN DALAM */}
                  <div
                    className={`relative z-10 w-5 h-5 flex items-center justify-center rounded-full border-2 ${
                      done
                        ? "bg-emerald-100 border-emerald-500"
                        : "bg-gray-200 border-gray-400"
                    }`}
                  >
                    {done ? (
                      <Check size={12} className="text-emerald-500" />
                    ) : (
                      <Check size={12} className="text-gray-400" />
                    )}
                  </div>

                </div>

                {i !== steps.length - 1 && (
                  <div
                    className={`w-[2px] h-12 ${
                      done ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  ></div>
                )}
              </div>

              {/* TEXT */}
              <div>
                <p
                  className={`font-medium ${
                    done ? "text-black" : "text-gray-600"
                  }`}
                >
                  {step}
                </p>

                <p className="text-sm text-gray-400">
                  {done ? (
                    <>
                      {/* LOKASI */}
                      {step === "Received" || step === "Sortation"
                        ? `${data.origin_city} Hub`
                        : `${data.destination_city} Airport`}
                      <br />

                      {/* TANGGAL */}
                      <span className="text-blue-600">
                        05 April 2026 pukul 08.30
                      </span>
                    </>
                  ) : (
                    "Menunggu"
                  )}
                </p>
              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}