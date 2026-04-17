"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Plane,
  FileText,
  LogOut,
  User,
  Menu,
} from "lucide-react";

import Image from "next/image";

export default function AdminLayout({ children }: any) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const menu = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Shipments", path: "/admin/shipments", icon: Package },
    { name: "Flights", path: "/admin/flights", icon: Plane },
    { name: "Reports", path: "/admin/reports", icon: FileText },
  ];

  return (
    <div className="flex h-screen overflow-hidden">

      {/* SIDEBAR */}
      <div
        className={`bg-blue-700 text-white ${open ? "w-64" : "w-20"
          } transition-all duration-300 flex flex-col fixed left-0 top-0 h-full`}
      >

        {/* LOGO + TOGGLE */}
        <div
          className={`flex items-center p-4 border-b border-white/20 ${open ? "justify-between" : "justify-center"
            }`}
        >
          {open ? (
            <div className="flex items-center gap-3">
              <Image
                src="/logo siweb.png"
                alt="Logo ExpressAir"
                width={45}
                height={45}
                className="object-contain"
              />

              <div className="leading-tight">
                <h1 className="text-[20px] font-bold text-white">
                  ExpressAir
                </h1>

                <p className="text-[13px] text-blue-100">
                  Cargo System
                </p>
              </div>
            </div>
          ) : (
            <div></div>
          )}

          <button onClick={() => setOpen(!open)}>
            <Menu size={22} />
          </button>

        </div>

        {/* MENU */}
        <div className="flex-1 px-2 space-y-2 mt-2">
          {menu.map((item) => {
            const active = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${active
                    ? "bg-white text-blue-700"
                    : "hover:bg-blue-600"
                    }`}
                >
                  <Icon size={20} />
                  {open && <span>{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </div>

        {/* USER + LOGOUT */}
        <div className="p-4 border-t border-white/20">
          <div className="flex items-center gap-2 mb-3">
            <User size={20} />

            {open && (
              <div>
                <p className="text-sm font-medium">
                  Admin User
                </p>

                <p className="text-xs text-blue-200">
                  Admin
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 text-sm hover:text-gray-200"
          >
            <LogOut size={18} />
            {open && "Logout"}
          </button>
        </div>

      </div>

      {/* CONTENT */}
      <div
        className={`flex-1 bg-gray-100 p-6 overflow-y-auto transition-all duration-300 ${open ? "ml-64" : "ml-20"
          }`}
      >
        {children}
      </div>

    </div>
  );
}