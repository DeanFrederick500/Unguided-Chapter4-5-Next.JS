"use client";

import { Plane } from "lucide-react";

export default function Spinner() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white overflow-hidden">
      {/* Container utama pesawat + efek */}
      <div className="relative animate-plane-loading flex flex-col items-center">
        
        {/* Pesawat */}
        <Plane className="relative w-16 h-16 text-blue-600 -rotate-45 drop-shadow-md" />

        
       
        <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-12 h-12 bg-blue-500/30 blur-xl rounded-full pointer-events-none"></div>

        {/* Partikel efek mesin (juga dipindah ke bawah agar sinkron) */}
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></span>
          <span className="w-2 h-2 bg-blue-300 rounded-full animate-ping [animation-delay:0.2s]"></span>
          <span className="w-2 h-2 bg-blue-200 rounded-full animate-ping [animation-delay:0.4s]"></span>
        </div>
      </div>

      {/* Teks */}
      <p className="mt-12 text-sm text-gray-500 tracking-wide">
        Loading cargo Web...
      </p>
    </div>
  );
}