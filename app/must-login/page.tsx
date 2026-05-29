"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function MustLoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="bg-gray-50 w-full pt-28 flex-1">
        <div className="max-w-6xl mx-auto px-6 py-10">

          <h1 className="text-5xl font-bold text-center text-darkblue mb-12">
            ExpressAir Cargo System
          </h1>

          <div className="py-16 flex justify-center">
            <div className="bg-red-100 px-10 py-6 rounded-2xl shadow text-center flex items-center gap-6">

              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white text-2xl font-bold">
                ✖
              </div>

              <h2 className="text-2xl font-bold text-red-900">
                Upss, Kamu Harus Login Dulu!!!
              </h2>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}