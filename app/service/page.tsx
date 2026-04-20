import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Service from "@/components/sections/Service";
import Pengiriman from "@/components/sections/Pengiriman";

export default function ServicePage() {
    return (
        <>
          <Navbar />
    
          <main className="pt-20">
            <Service />
            <Pengiriman />
          </main>
    
          <Footer />
        </>
      );
}