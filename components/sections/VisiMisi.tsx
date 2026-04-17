"use client";
import Image from "next/image";
import {motion} from "framer-motion";

export default function VisiMisi() {
  const items = [
    {
      title: "Digitalization, Innovation & Transformation",
      desc: "Mengembangkan sistem ekspedisi kargo berbasis digital yang inovatif dan terintegrasi untuk meningkatkan efisiensi, kecepatan, dan akurasi operasional.",
      img: "/misi1.png",
    },
    {
      title: "Agile & Customer-Centric Organization",
      desc: "Menyediakan sistem yang responsif, fleksibel, dan berfokus pada kemudahan penggunaan guna mendukung kebutuhan operasional secara optimal.",
      img: "/visi2.png",
    },
    {
      title: "Developing and Empowering Young Talented Human Capital",
      desc: "Mendukung pengembangan talenta melalui sistem yang intuitif dan mendorong peningkatan kompetensi digital dalam lingkungan kerja.",
      img: "/visi3.png",
    },
  ];

  return (
    <section className="relative px-8 py-20 text-white">
        <Image
        src="/about uts 2.jpg"
        alt="background"
        fill
        className="object-cover"
      />

      {/* 🌫️ Overlay */}
      <div className="absolute inset-0 bg-white/70"></div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center">
      {/* <div className="max-w-6xl mx-auto text-center"> */}
        
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-darkblue mb-4">
          Visi & Misi Kami
        </h2>

        <p className="text-black mb-10">
          Komitmen kami dalam memberikan layanan terbaik melalui visi dan misi yang kuat.
        </p>

        {/* CARD TAMBAHAN (HIGHLIGHT) */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-12 flex flex-col md:flex-row items-center gap-6 hover:shadow-xl hover:-translate-y-2 transition duration-300">
          
          <Image
            src="/visi1.png"
            alt="highlight"
            width={200}
            height={150}
            className="rounded-lg object-cover"
          />

          <div className="text-left">
            <h3 className="text-xl font-semibold text-darkblue mb-2">
              Delivering the Future of Integrated Air Cargo Logistics
            </h3>
            <p className="text-black text-sm">
              Menjadi sistem manajemen ekspedisi kargo udara yang andal, efisien, dan terintegrasi secara digital, dengan menghadirkan informasi pengiriman yang akurat, real-time, dan mudah diakses, guna mendukung kelancaran operasional logistik serta meningkatkan kualitas layanan distribusi secara profesional dan berkelanjutan.
            </p>
          </div>
        </div>

        {/* Cards */}
        <motion.div className="grid md:grid-cols-3 gap-8 hover:-translate-y-2 transition duration-300"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
        >
          {items.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition duration-300 overflow-hidden flex flex-col items-center text-center"
              variants={{
                hidden: { opacity: 0, y: 40 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5 }}
            >
              {/* Image */}
              <Image
                src={item.img}
                alt={item.title}
                width={100}
                height={200}
                className="w-40 h-40 object-cover"
              />

              {/* Content */}
              <div className="p-5 text-left">
                <h3 className="text-lg font-semibold text-darkblue mb-2 text-center">
                  {item.title}
                </h3>

                <p className="text-black text-sm text-center">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}