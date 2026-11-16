"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Email atau kata sandi salah.");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Gagal terhubung ke server.");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#1761C9] to-[#4B9BEF] px-5 py-10">
      {/* Logo */}
      <div className="mb-6 flex items-center gap-3 text-white">
        <svg
          viewBox="0 0 40 40"
          className="h-10 w-10 fill-white"
          aria-hidden="true"
        >
          <path d="M3 17L37 3L23 37L17 22L3 17Z" />
          <path d="M17 22L37 3L23 37L17 22Z" fill="#BBD9FF" />
        </svg>

        <div>
          <h1 className="text-xl font-bold leading-tight">Lapor Sampah</h1>
          <p className="text-[9px] tracking-[2px]">
            PANEL ADMIN - KELAPA TIGA
          </p>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[334px] rounded-[22px] bg-white px-[30px] py-[30px] shadow-xl">
        <h2 className="text-[22px] font-bold text-[#173663]">Masuk Admin</h2>

        <p className="mt-1 text-[11px] leading-relaxed text-[#63748D]">
          Khusus petugas kelurahan untuk mengelola status laporan warga.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Email */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-[#173663]">
              Email admin
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email admin"
              className="w-full rounded-[11px] border border-[#C8D9F5] px-3 py-3 text-xs text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-[#173663]">
              Kata sandi
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
              className="w-full rounded-[11px] border border-[#C8D9F5] px-3 py-3 text-xs text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[11px] bg-[#2070DC] py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-[#155FC4] active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Memeriksa..." : "Masuk →"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-4 block text-center text-xs font-semibold text-[#1768D5] transition hover:text-blue-900"
        >
          ← Kembali ke situs warga
        </Link>
      </div>
    </main>
  );
}