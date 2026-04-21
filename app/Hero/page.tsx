import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/sections/Hero";
import AboutUs2 from "@/components/sections/AboutUs2";


export default function HeroPage() {
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