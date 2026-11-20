"use client";

import { useEffect, useState } from "react";

interface Laporan {
  id: string;
  status: string;
}

const daftarStatistik = [
  {
    judul: "Total Laporan",
    warna: "bg-blue-100 text-blue-700",
    icon: "/laporan.svg",
  },
  {
    judul: "Menunggu",
    warna: "bg-yellow-100 text-yellow-700",
    icon: "/menunggu.svg",
  },
  {
    judul: "Diproses",
    warna: "bg-orange-100 text-orange-700",
    icon: "/diproses.svg",
  },
  {
    judul: "Selesai",
    warna: "bg-green-100 text-green-700",
    icon: "/icon-centang-hijau.svg",
  },
];

export default function StatistikCard() {
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ambilLaporan = async () => {
      try {
        const response = await fetch("/api/laporan", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data");
        }

        const hasil = await response.json();
        setLaporan(hasil.data);
      } catch (error) {
        console.error("Gagal mengambil statistik:", error);
      } finally {
        setLoading(false);
      }
    };

    ambilLaporan();
  }, []);

  const statistik = [
    laporan.length,
    laporan.filter((item) => item.status === "Menunggu").length,
    laporan.filter((item) => item.status === "Diproses").length,
    laporan.filter((item) => item.status === "Selesai").length,
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-5 xl:grid-cols-4">
      {daftarStatistik.map((item, index) => (
        <div
          key={item.judul}
          className="rounded-2xl bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-[#647A9B] sm:text-sm">
              {item.judul}
            </p>

            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${item.warna}`}
            >
              <img
                src={item.icon}
                alt={item.judul}
                className="h-5 w-5 object-contain sm:h-6 sm:w-6"
              />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-[#173663] sm:mt-4 sm:text-3xl">
            {loading ? "..." : statistik[index]}
          </p>

          <p className="mt-1 text-[11px] text-[#8192AA] sm:text-xs">
            Data laporan warga
          </p>
        </div>
      ))}
    </div>
  );
}