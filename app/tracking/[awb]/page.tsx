"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, Check } from "lucide-react";

export default function DetailShipment() {

    const { awb } = useParams();
    const router = useRouter();

    const shipments = JSON.parse(localStorage.getItem("shipments") || "[]");

    const data = shipments.find((s: any) => s.awb === awb);
    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-gray-100 px-8 py-6 rounded-xl shadow text-center">
                    <h2 className="text-2xl font-semibold text-gray-700">
                        Mohon maaf Data {awb} tidak ditemukan
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Silakan periksa kembali nomor AWB yang Anda masukkan
                    </p>
                </div>
            </div>
        );
    }

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

    const currentIndex = statusMap[data.status] ?? 0;

    return (
        <div>

            {/* BACK */}
            <button
                onClick={() => router.push("/")}
                className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-medium"
            >
                <ArrowLeft size={18} />
                Kembali ke Beranda
            </button>

            {/* DETAIL */}
            <div className="bg-white p-6 rounded-xl shadow mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="text-blue-600 p-2 rounded-lg">
                        <Package size={25} />
                    </div>
                    <h2 className="font-semibold text-lg">Tracking Shipment</h2>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">

                    <div>
                        <p className="text-gray-400">Nomor AWB</p>
                        <p className="font-semibold">{data.awb}</p>
                    </div>

                    <div>
                        <p className="text-gray-400">Berat</p>
                        <p className="font-semibold">{data.berat} kg</p>
                    </div>

                    <div>
                        <p className="text-gray-400">No. Penerbangan</p>
                        <p className="font-semibold">{data.flight}</p>
                    </div>

                    <div>
                        <p className="text-gray-400">Asal</p>
                        <p className="font-semibold">{data.asal}</p>
                    </div>

                    <div>
                        <p className="text-gray-400">Tujuan</p>
                        <p className="font-semibold">{data.tujuan}</p>
                    </div>

                    <div>
                        <p className="text-gray-400">Status Saat Ini</p>
                        <p className="font-semibold text-blue-600">{data.status}</p>
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
                                        className={`absolute w-8 h-8 rounded-full ${done ? "bg-emerald-100" : "bg-gray-200"
                                            }`}
                                    ></div>

                                    {/* LINGKARAN DALAM */}
                                    <div
                                        className={`relative z-10 w-5 h-5 flex items-center justify-center rounded-full border-2 ${done
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
                                        className={`w-[2px] h-12 ${done ? "bg-emerald-500" : "bg-gray-300"
                                            }`}
                                    ></div>
                                )}
                            </div>

                            {/* TEXT */}
                            <div>
                                <p
                                    className={`font-medium ${done ? "text-black" : "text-gray-600"
                                        }`}
                                >
                                    {step}
                                </p>

                                <p className="text-sm text-gray-400">
                                    {done ? (
                                        <>
                                            {/* LOKASI */}
                                            {step === "Received" || step === "Sortation"
                                                ? `${data.asal} Hub`
                                                : `${data.tujuan} Airport`}
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