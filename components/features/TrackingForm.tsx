"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TrackingForm() {
  const [resi, setResi] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!resi.trim()) return;

    router.push(`/tracking/${resi}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-lg shadow w-full max-w-sm"
    >
      <label className="text-sm font-medium text-darkblue">
        Pelacakan Cepat
      </label>

      <input
        type="text"
        placeholder="Masukkan Nomor Airway Bill"
        value={resi}
        onChange={(e) => setResi(e.target.value)}
        className="w-full mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-darkblue"
      />

      <button
        type="submit"
        className="mt-3 w-1/3 bg-blueprimary text-white py-2 rounded-md hover:bg-blue-800 hover:scale-105 active:scale-95 transition duration-200"
      >
        CARI
      </button>
    </form>
  );
}