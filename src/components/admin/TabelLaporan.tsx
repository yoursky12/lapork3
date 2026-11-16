
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Laporan {
  id: string;
  foto_url: string;
  lokasi: string;
  latitude: number | null;
  longitude: number | null;
  jenis_sampah: string;
  deskripsi: string;
  julukan: string;
  status: string;
  created_at: string;
}

const daftarStatus = ["Menunggu", "Diproses", "Selesai"];

export default function TabelLaporan() {
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [filter, setFilter] = useState("Semua");
  const [cari, setCari] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mengambil data laporan dari API
  useEffect(() => {
    const ambilLaporan = async () => {
      try {
        const response = await fetch("/api/laporan", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data laporan.");
        }

        const hasil = await response.json();
        setLaporan(hasil.data);
      } catch {
        setError("Data laporan gagal dimuat.");
      } finally {
        setLoading(false);
      }
    };

    ambilLaporan();
  }, []);

  // Mengubah status sementara di tampilan
  const ubahStatus = (id: string, statusBaru: string) => {
    setLaporan((dataSebelumnya) =>
      dataSebelumnya.map((item) =>
        item.id === id
          ? { ...item, status: statusBaru }
          : item
      )
    );
  };

  // Filter dan pencarian laporan
  const laporanDitampilkan = laporan.filter((item) => {
    const cocokFilter =
      filter === "Semua" || item.status === filter;

    const kataKunci = cari.toLowerCase();

    const cocokCari =
      item.julukan.toLowerCase().includes(kataKunci) ||
      item.lokasi.toLowerCase().includes(kataKunci) ||
      item.jenis_sampah.toLowerCase().includes(kataKunci);

    return cocokFilter && cocokCari;
  });

  // Mengubah tanggal menjadi format Indonesia
  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#173663]">
            Daftar Laporan
          </h2>
          <p className="mt-1 text-sm text-[#8192AA]">
            Kelola laporan yang masuk dari warga.
          </p>
        </div>

        <input
          type="text"
          placeholder="Cari laporan..."
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          className="rounded-xl border border-[#DCE6F3] px-4 py-2 text-sm outline-none focus:border-blue-400"
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {["Semua", ...daftarStatus].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === status
                ? "bg-[#1556B8] text-white"
                : "bg-[#F1F5FB] text-[#647A9B] hover:bg-blue-100"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#E7EEF7] text-[#8192AA]">
              <th className="px-4 py-4 font-medium">Pelapor</th>
              <th className="px-4 py-4 font-medium">Lokasi</th>
              <th className="px-4 py-4 font-medium">Jenis</th>
              <th className="px-4 py-4 font-medium">Tanggal</th>
              <th className="px-4 py-4 font-medium">Ubah Status</th>
              <th className="px-4 py-4 font-medium">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[#8192AA]">
                  Memuat data laporan...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : (
              <>
                {laporanDitampilkan.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#F0F3F8] last:border-0"
                  >
                    <td className="px-4 py-4 font-semibold text-[#173663]">
                      {item.julukan}
                    </td>

                    <td className="px-4 py-4 text-[#647A9B]">
                      {item.lokasi}
                    </td>

                    <td className="px-4 py-4 text-[#647A9B]">
                      {item.jenis_sampah}
                    </td>

                    <td className="px-4 py-4 text-[#647A9B]">
                      {formatTanggal(item.created_at)}
                    </td>

                    <td className="px-4 py-4">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          ubahStatus(item.id, e.target.value)
                        }
                        className="rounded-lg border border-[#DCE6F3] bg-white px-3 py-2 text-xs font-medium text-[#173663] outline-none"
                      >
                        {daftarStatus.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/dashboard/laporan/${item.id}`}
                        className="font-semibold text-[#1556B8] hover:underline"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}

                {laporanDitampilkan.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-sm text-[#8192AA]"
                    >
                      Laporan tidak ditemukan.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
