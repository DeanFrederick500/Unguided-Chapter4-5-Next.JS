"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TrackingForm() {
  const [resi, setResi] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!resi.trim()) {
      setError("Please enter an AWB number.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/shipments?awb=${encodeURIComponent(resi.trim())}`);
      const data = await res.json();

      if (data && data.length > 0) {
        router.push(`/tracking/${resi.trim()}`);
      } else {
        setError("AWB number not found.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-lg shadow w-full max-w-sm"
    >
      <label className="text-sm font-medium text-darkblue">
        Quick Tracking
      </label>

      <input
        type="text"
        placeholder="Enter Your Airway Bill Number"
        value={resi}
        onChange={(e) => {
          setResi(e.target.value);
          if (error) setError("");
        }}
        className="w-full mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-darkblue"
      />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-3 w-1/3 bg-blueprimary text-white py-2 rounded-md hover:bg-blue-800 hover:scale-105 active:scale-95 transition duration-200 disabled:opacity-50"
      >
        {loading ? "Searching..." : "SEARCH"}
      </button>
    </form>
  );
}