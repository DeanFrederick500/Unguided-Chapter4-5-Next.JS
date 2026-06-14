"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Invalid email or password");
        return;
      }

      localStorage.setItem("role", data.user.role);
      localStorage.setItem("name", data.user.name);
      localStorage.setItem("email", data.user.email);

      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/operator");
      }

    } catch (error) {
      setError("An error occurred while signing in");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 px-4">

      <div className="w-full max-w-md">

        {/* LOGO */}
        <div className="mb-8 flex items-center justify-center gap-4">

          <Image
            src="/logo siweb.png"
            alt="Logo ExpressAir"
            width={90}
            height={90}
            className="object-contain"
          />

          <div className="flex flex-col">
            <h1 className="text-4xl font-bold text-white leading-none">
              ExpressAir
            </h1>

            <p className="text-blue-100 text-base mt-1">
              Cargo System
            </p>
          </div>

        </div>

        {/* CARD LOGIN */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8">

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome Back
            </h2>

            <p className="text-gray-500 mt-2">
              Sign in to access the ExpressAir Cargo System
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition duration-200 shadow-md"
            >
              Login
            </button>

          </form>

          <div className="mt-8 pt-4 border-t text-center">
            <p className="text-xs text-gray-500">
              Air Freight • Shipment Tracking • Logistics Management
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}


{/* <div className="mt-6 border-t pt-4 text-center text-sm text-gray-500"> */}
  {/* <p>Login menggunakan email sesuai role (admin/operator)</p> */}
  {/* <p className="mt-2">
    Demo: admin@expressair.com / admin123
  </p>
  <p>
    operator@expressair.com / operator123
  </p>
</div> */}