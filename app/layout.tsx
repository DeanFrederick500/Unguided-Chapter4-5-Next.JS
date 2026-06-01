// app/layout.tsx

import "./globals.css";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import Loading from "./loading";


export const metadata = {
  title: "ExpressAir Cargo System",
  description: "Perusahaan ekspedisi yang menyediakan layanan pengiriman barang dengan berbagai pilihan armada dan layanan tambahan untuk memenuhi kebutuhan pelanggan",
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

// Delay 1.5 detik agar loading terlihat
async function Delay({
  children,
}: {
  children: React.ReactNode;
}) {
  await new Promise((resolve) =>
    setTimeout(resolve, 1500)
  );

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<Loading />}>
          <Delay>{children}</Delay>
        </Suspense>
      </body>
    </html>
  );
}