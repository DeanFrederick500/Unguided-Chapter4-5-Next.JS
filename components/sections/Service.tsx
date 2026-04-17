// "use client";
import Image from "next/image";
// import {motion} from "framer-motion";


export default function LayananHero() {
  return (
    <section id="Service" className="relative h-[600px] flex items-center justify-center text-center">
      
      {/* Background */}
      <Image
        src="/service3.jpg"
        alt="Layanan"
        fill
        className="object-cover"
      />

      {/* Overlay putih */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10">
        <h2 className="text-3xl md:text-6xl font-bold text-white mb-8">
          Layanan ExpressAir
        </h2>

        <p className="text-white max-w-xl mx-auto">
          Kami menyediakan berbagai layanan pengiriman udara yang cepat,
          aman, dan terpercaya untuk memenuhi kebutuhan logistik Anda.
        </p>
      </div>
    </section>
  );
}