import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail Flights Admin - ExpressAir Cargo System",
  description: "Halaman Detail Flights admin untuk melihat detail penerbangan.",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
