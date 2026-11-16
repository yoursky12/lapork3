
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

  const menuClass = (menu: string) =>
  `relative pb-2 text-sm transition ${
    activePage !== "lapor" && activeMenu === menu
      ? "font-semibold text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-white"
      : "text-white/90 hover:text-white"
  }`;
  
  const homeLink = (section: string) =>
    activePage === "lapor" ? `/#${section}` : `#${section}`;

  return (
    <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#1765D1] to-[#287DE0] px-6 py-5 md:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-white">
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
      </div>
    </nav>
  );
}
