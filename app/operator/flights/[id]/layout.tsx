import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail Flights Operator - ExpressAir Cargo System",
  description: "Halaman Detail Flights operator untuk melihat detail penerbangan.",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
