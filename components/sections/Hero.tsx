"use client";
import TrackingForm from "@/components/features/TrackingForm";
import Image from "next/image"
import {motion} from "framer-motion";

export default function Hero() {
  return (
    <section id="Hero" className="bg-gray-100 px-16 py-16 flex">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        
        {/* LEFT */}
        <div className="flex-row">
          <h1 className="text-3xl md:text-5xl font-bold text-darkblue mb-6">
            Dengan ekosistem logistik udara yang terintegrasi,
          </h1>

          <p className="text-black-600 mb-6">
            Anda dapat menikmati kemudahan distribusi cargo yang cepat,
            efisien, dan tanpa batas ke seluruh penjuru dunia.
          </p>

          <TrackingForm />
        </div>

        {/* RIGHT */}
        <motion.div className="flex justify-center"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        // animate={{ y: [0, -10, 0] }}
        // transition={{ repeat: Infinity, duration: 3 }}
        >
          <Image
          src="/beranda.jpg"
          alt="beranda"
          width={450}
          height={600}
          className="rounded-lg shadow-md hover:scale-105 transition duration-300"
          />
        </motion.div>
      </div>
    </section>
  );
}