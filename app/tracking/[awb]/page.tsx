"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Check } from "lucide-react";

export default function DetailShipment() {
  const params = useParams();
  const router = useRouter();

  const awb = Array.isArray(params.awb) ? params.awb[0] : params.awb;

  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchAwb, setSearchAwb] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("shipments");

    if (saved) {
      setShipments(JSON.parse(saved));
    }

    setSearchAwb(awb || "");
    setLoading(false);
  }, [awb]);

  const data = shipments.find((s: any) => s.awb === awb);

  const handleSearch = () => {
    if (!searchAwb.trim()) return;

    router.push(`/tracking/${searchAwb}`);
  };

  const steps = [
    "Received",
    "Sortation",
    "Loaded",
    "Departed",
    "Arrived",
  ];

  const statusMap: any = {
    "Received": 0,
    "In Transit": 3,
    "Delivered": 4,
  };

  const currentIndex = data ? statusMap[data.status] ?? 0 : 0;

  const trackingInfo = data
    ? [
      {
        lokasi: `${data.asal}`,
        waktu: "05 April 2026 pukul 08.30",
        desc: "Barang telah diterima oleh petugas di lokasi asal dan siap diproses untuk pengiriman udara.",
      },
      {
        lokasi: `${data.asal}`,
        waktu: "05 April 2026 pukul 09.15",
        desc: "Barang sedang melalui proses penyortiran di gudang untuk penyesuaian rute dan jadwal penerbangan.",
      },
      {
        lokasi: `${data.asal} Airport`,
        waktu: "05 April 2026 pukul 11.45",
        desc: "Barang telah dimuat ke dalam pesawat dan siap untuk diberangkatkan menuju bandara tujuan.",
      },
      {
        lokasi: `${data.asal} Airport`,
        waktu: "05 April 2026 pukul 13.20",
        desc: "Pesawat yang membawa kargo telah diberangkatkan dari bandara asal menuju bandara tujuan.",
      },
      {
        lokasi: `${data.tujuan} Airport`,
        waktu: "05 April 2026 pukul 18.59",
        desc: "Pesawat telah tiba di bandara tujuan dan kargo siap untuk proses penyerahan kepada penerima.",
      },
    ]
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="bg-gray-50 w-full pt-28 flex-1">
        <div className="max-w-6xl mx-auto px-6 py-10">

          <h1 className="text-5xl font-bold text-center text-darkblue mb-12">
            Pelacakan Cepat
          </h1>

          {/* SEARCH BOX */}
          <p className="text-2xl font-semibold text-black mb-5">
            Nomor Airway Bill :
          </p>
          <div className="bg-white rounded-2xl shadow p-4 mb-14 border">
            <div className="grid grid-cols-[1fr_180px] gap-4">

              <input
                value={searchAwb}
                onChange={(e) => setSearchAwb(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Masukkan nomor AWB"
                className="border border-gray-400 rounded-lg px-4 h-14 text-lg outline-none focus:border-gray-500"
              />

              <button
                onClick={handleSearch}
                className="bg-blue-700 text-white rounded-lg text-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                CARI
              </button>

            </div>
          </div>

          {loading && (
            <div className="py-32 text-center text-xl font-semibold">
              Memuat data...
            </div>
          )}

          {!loading && !data && (
            <div className="py-16 flex justify-center">
              <div className="bg-red-100 px-10 py-6 rounded-2xl shadow text-center flex items-center gap-6">

                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white text-2xl font-bold">
                  ✖
                </div>

                <h2 className="text-2xl font-bold text-red-900">
                  Nomor Airway Bill Tidak Ditemukan
                </h2>

              </div>
            </div>
          )}

          {!loading && data && (
            <>


              {/* STEP */}
              <div className="mb-16">
                <div className="flex items-center justify-between relative">

                  {/* GARIS ABU */}
                  <div className="absolute top-7 left-[12.5%] right-[12.5%] h-[2px] bg-gray-300"></div>

                  {/* GARIS HIJAU */}
                  <div
                    className="absolute top-7 left-[12.5%] h-[2px] bg-emerald-500"
                    style={{
                      width: `${(currentIndex / (steps.length - 1)) * 75}%`,
                    }}
                  ></div>

                  {steps.map((step, i) => {
                    const done = i <= currentIndex;

                    return (
                      <div
                        key={i}
                        className="relative z-10 flex flex-col items-center w-full"
                      >
                        <div className="relative">

                          <div
                            className={`w-16 h-16 rounded-full ${done ? "bg-emerald-100" : "bg-gray-200"
                              }`}
                          ></div>

                          <div
                            className={`absolute inset-0 m-auto w-9 h-9 rounded-full border-2 flex items-center justify-center ${done
                              ? "border-emerald-500 bg-emerald-100"
                              : "border-gray-400 bg-gray-200"
                              }`}
                          >
                            <Check
                              size={18}
                              className={
                                done ? "text-emerald-500" : "text-gray-400"
                              }
                            />
                          </div>

                        </div>

                        <p className="mt-4 font-semibold text-lg text-center">
                          {step}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TIMELINE */}
              <div className="space-y-2">
                {trackingInfo.map((item, i) => {
                  const done = i <= currentIndex;

                  return (
                    <div
                      key={i}
                      className="grid grid-cols-[220px_50px_1fr] gap-4"
                    >
                      <div className="text-right">
                        <p className="font-medium text-base">{item.lokasi}</p>
                        <p className="font-medium text-base">{item.waktu}</p>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        {/* BULATAN */}
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center ${done ? "bg-emerald-200" : "bg-gray-200"
                            }`}
                        >
                          <Check
                            size={28}
                            className={done ? "text-white" : "text-white"}
                            strokeWidth={3}
                          />
                        </div>

                        {/* GARIS PANJANG */}
                        {i !== trackingInfo.length - 1 && (
                          <div
                            className={`w-[2.3px] h-20 ${done ? "bg-emerald-500" : "bg-gray-300"
                              }`}
                          ></div>
                        )}
                      </div>

                      <div className="pt-1 font-medium text-xl leading-relaxed">
                        {item.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}