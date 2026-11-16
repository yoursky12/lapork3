
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
    icon: "/data.svg",
  },
  {
    judul: "Menunggu",
    warna: "bg-yellow-100 text-yellow-700",
    icon: "⏳",
  },
  {
    judul: "Diproses",
    warna: "bg-orange-100 text-orange-700",
    icon: "🔄",
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
    <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {daftarStatistik.map((item, index) => (
        <div
          key={item.judul}
          className="rounded-2xl bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#647A9B]">
              {item.judul}
            </p>

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.warna}`}
            >
              <img
                src={item.icon}
                alt={item.judul}
                className="h-6 w-6 object-contain"
              />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold text-[#173663]">
            {loading ? "..." : statistik[index]}
          </p>

          <p className="mt-1 text-xs text-[#8192AA]">
            Data laporan warga
          </p>
        </div>
      ))}
    </div>
  );
}
