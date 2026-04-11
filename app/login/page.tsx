"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Semua field wajib diisi");
      return;
    }

    if (email === "admin@expressair.com" && password === "admin123") {
      router.push("/admin");
    } else if (
      email === "operator@expressair.com" &&
      password === "operator123"
    ) {
      router.push("/operator");
    } else {
      setError("Email atau password salah");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">

      {/* LOGO */}
      <div className="mb-6 flex items-center gap-4">

        {/* ICON TANPA LATAR */}
        <Package
          size={64}
          className="text-blue-700"
          strokeWidth={2.2}
        />

        {/* TEXT */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 leading-none">
            ExpressAir
          </h1>

          <p className="text-gray-500 text-xl mt-1">
            Cargo System
          </p>
        </div>

      </div>

      {/* CARD LOGIN */}
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">

        <h2 className="text-2xl font-semibold mb-6">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">

          <div>
            <label className="block mb-1 text-gray-700">
              Email
            </label>

            <input
              type="email"
              className="w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700">
              Password
            </label>

            <input
              type="password"
              className="w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 text-red-600 p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-700 text-white p-3 rounded-md hover:bg-blue-800 transition"
          >
            Login
          </button>

        </form>

        <div className="mt-6 border-t pt-4 text-center text-sm text-gray-500">
          <p>Login menggunakan email sesuai role (admin/operator)</p>
          <p className="mt-2">
            Demo: admin@expressair.com / admin123
          </p>
          <p>
            operator@expressair.com / operator123
          </p>
        </div>

      </div>
    </div>
  );
}