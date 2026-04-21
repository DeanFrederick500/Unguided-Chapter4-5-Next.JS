"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full px-8 py-6 flex justify-between items-center z-50 transition duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow text-darkblue"
          : "bg-blue-800 text-white"
      }`}
    >
      <div className="flex items-center gap-6">
        <Image
          src={scrolled ? "/logo siweb biru.png" : "/logo siweb.png"}
          alt="beranda"
          width={40}
          height={40}
        />
        <h1 className="font-bold text-2xl">ExpressAir</h1>
      </div>

      <div className="flex gap-6 text-sm">
        <a href="/Hero" className="relative group">
          BERANDA
          <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-current transition-all group-hover:w-full"></span>
        </a>

        <a href="/about" className="relative group">
          TENTANG KAMI
          <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-current transition-all group-hover:w-full"></span>
        </a>

        <a href="/service" className="relative group">
          LAYANAN
          <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-current transition-all group-hover:w-full"></span>
        </a>

        <Link href="/login" className="relative group">
          LOGIN
          <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-current transition-all group-hover:w-full"></span>
        </Link>
      </div>
    </nav>
  );
}