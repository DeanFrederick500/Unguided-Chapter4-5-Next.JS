import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import AboutUs from "@/components/sections/AboutUs";
import VisiMisi from "@/components/sections/VisiMisi";

export default function AboutPage() {
    return (
        <>
            <Navbar />
    
            <main className="pt-20">
            <AboutUs />
            <VisiMisi />
            </main>
    
            <Footer />
        </>
        );
}