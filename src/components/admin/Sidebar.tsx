"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const pathname = usePathname();

  const isKelolaData = pathname.startsWith("/admin/dashboard");

  return (
    <>
      {/* TOP BAR KHUSUS HP */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-gradient-to-r from-[#1556B8] to-[#2876D9] px-4 py-3 text-white shadow-md md:hidden">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">➤</span>
          <div>
            <h1 className="text-sm font-bold leading-tight">Lapor Sampah</h1>
            <p className="text-[9px] tracking-widest text-white/80">
              PANEL ADMIN
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMenuTerbuka(true)}
          aria-label="Buka menu navigasi"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white transition hover:bg-white/25 active:scale-95"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* OVERLAY GELAP SAAT MENU DIBUKA DI HP */}
      {menuTerbuka && (
        <div
          onClick={() => setMenuTerbuka(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] transition-opacity md:hidden"
        />
      )}

      {/* SIDEBAR (DRAWER DI HP, TETAP DI LAPTOP) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gradient-to-b from-[#1556B8] to-[#2876D9] px-4 py-6 text-white shadow-xl transition-transform duration-300 ease-in-out md:sticky md:top-0 md:z-auto md:h-screen md:w-[215px] md:shrink-0 md:translate-x-0 md:shadow-none ${
          menuTerbuka ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Logo + Tombol Tutup di HP */}
        <div className="mb-8 flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">➤</span>
            <div>
              <h1 className="text-sm font-bold">Lapor Sampah</h1>
              <p className="text-[9px] tracking-widest text-white/80">
                PANEL ADMIN
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMenuTerbuka(false)}
            aria-label="Tutup menu navigasi"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25 md:hidden"
          >
            ✕
          </button>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex flex-1 flex-col justify-between">
          <div className="space-y-2">
            <Link
              href="/admin/dashboard"
              onClick={() => setMenuTerbuka(false)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold transition ${
                isKelolaData
                  ? "bg-white text-[#1556B8] shadow-sm"
                  : "text-white hover:bg-white/15"
              }`}
            >
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              <span>Kelola Data</span>
            </Link>
          </div>

          <div className="border-t border-white/15 pt-4">
            <Link
              href="/admin"
              onClick={() => setMenuTerbuka(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-medium text-white transition hover:bg-white/15"
            >
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1"
                />
              </svg>
              <span>Logout</span>
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}