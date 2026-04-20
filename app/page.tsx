// app/page.tsx

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/sections/Hero";
import AboutUs from "@/components/sections/AboutUs";
import VisiMisi from "@/components/sections/VisiMisi";
import AboutUs2 from "@/components/sections/AboutUs2";
import Service from "@/components/sections/Service";
import Pengiriman from "@/components/sections/Pengiriman";
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="pt-20">
        <Hero />
        <AboutUs2 />
      </main>

      <Footer />
    </>
  );
}