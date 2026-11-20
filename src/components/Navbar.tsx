"use client";

import Link from "next/link";
import { useState } from "react";

type NavbarProps = {
  activePage?: string;
  showCTA?: boolean;
};

export default function Navbar({
  activePage = "beranda",
  showCTA = true,
}: NavbarProps) {
  const [activeMenu, setActiveMenu] = useState(
    activePage === "lapor" ? "lapor" : "beranda"
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuClass = (menu: string) =>
    `relative pb-2 text-sm transition ${
      activePage !== "lapor" && activeMenu === menu
        ? "font-semibold text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-white"
        : "text-white/90 hover:text-white"
    }`;

  const mobileMenuClass = (menu: string) =>
    `block rounded-xl px-4 py-2.5 text-sm transition ${
      activePage !== "lapor" && activeMenu === menu
        ? "bg-white/20 font-semibold text-white"
        : "text-white/90 hover:bg-white/10 hover:text-white"
    }`;

  const homeLink = (section: string) =>
    activePage === "lapor" ? `/#${section}` : `#${section}`;

  const handleMobileSelect = (menu: string) => {
    setActiveMenu(menu);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#1765D1] to-[#287DE0] px-5 py-4 shadow-sm md:px-12 md:py-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-3 text-white"
        >
          <span className="text-3xl">➤</span>
          <div>
            <h1 className="text-base font-bold leading-tight">
              Lapor Sampah
            </h1>
            <p className="text-[9px] tracking-widest">
              KELURAHAN KELAPA TIGA
            </p>
          </div>
        </Link>

        {/* Menu Desktop */}
        <div className="hidden items-center gap-7 md:flex">
          <a
            href={homeLink("beranda")}
            onClick={() => setActiveMenu("beranda")}
            className={menuClass("beranda")}
          >
            Beranda
          </a>

          <a
            href={homeLink("tentang")}
            onClick={() => setActiveMenu("tentang")}
            className={menuClass("tentang")}
          >
            Tentang
          </a>

          <a
            href={homeLink("data-laporan")}
            onClick={() => setActiveMenu("data-laporan")}
            className={menuClass("data-laporan")}
          >
            Data Laporan
          </a>

          <a
            href={homeLink("footer")}
            onClick={() => setActiveMenu("lapor")}
            className={menuClass("lapor")}
          >
            Lapor
          </a>

          {showCTA && (
            <Link
              href="/pelaporan"
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                activePage === "lapor"
                  ? "bg-blue-900 text-white"
                  : "bg-white text-blue-700 hover:bg-blue-50"
              }`}
            >
              Lapor Sekarang
            </Link>
          )}
        </div>

        {/* Tombol Hamburger Khusus HP */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileMenuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white transition hover:bg-white/25 active:scale-95 md:hidden"
        >
          {mobileMenuOpen ? (
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
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
          )}
        </button>
      </div>

      {/* Dropdown Menu Khusus HP */}
      {mobileMenuOpen && (
        <div className="mt-4 space-y-1.5 rounded-2xl border border-white/15 bg-[#1355B5]/95 p-3 shadow-lg backdrop-blur-sm md:hidden">
          <a
            href={homeLink("beranda")}
            onClick={() => handleMobileSelect("beranda")}
            className={mobileMenuClass("beranda")}
          >
            Beranda
          </a>

          <a
            href={homeLink("tentang")}
            onClick={() => handleMobileSelect("tentang")}
            className={mobileMenuClass("tentang")}
          >
            Tentang
          </a>

          <a
            href={homeLink("data-laporan")}
            onClick={() => handleMobileSelect("data-laporan")}
            className={mobileMenuClass("data-laporan")}
          >
            Data Laporan
          </a>

          <a
            href={homeLink("footer")}
            onClick={() => handleMobileSelect("lapor")}
            className={mobileMenuClass("lapor")}
          >
            Lapor
          </a>

          {showCTA && (
            <div className="pt-2">
              <Link
                href="/pelaporan"
                onClick={() => setMobileMenuOpen(false)}
                className={`block w-full rounded-full py-2.5 text-center text-sm font-semibold transition ${
                  activePage === "lapor"
                    ? "bg-blue-950 text-white"
                    : "bg-white text-blue-700 hover:bg-blue-50"
                }`}
              >
                Lapor Sekarang
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}