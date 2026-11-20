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
  const [notifikasi, setNotifikasi] = useState("");

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

  // Mengubah status dan langsung menyimpan ke database
  const ubahStatus = async (id: string, statusBaru: string) => {
    const dataLama = [...laporan];

    setLaporan((dataSebelumnya) =>
      dataSebelumnya.map((item) =>
        item.id === id ? { ...item, status: statusBaru } : item
      )
    );

    try {
      const response = await fetch("/api/laporan", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status: statusBaru,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan status.");
      }

      setNotifikasi(`Status diperbarui menjadi "${statusBaru}"`);
      setTimeout(() => setNotifikasi(""), 2500);
    } catch {
      setLaporan(dataLama);
      setNotifikasi("Gagal memperbarui status. Coba lagi.");
      setTimeout(() => setNotifikasi(""), 3000);
    }
  };

  // Filter dan pencarian laporan
  const laporanDitampilkan = laporan.filter((item) => {
    const cocokFilter = filter === "Semua" || item.status === filter;
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

  const getBadgeStatus = (status: string) => {
    if (status === "Selesai") return "bg-green-100 text-green-700";
    if (status === "Diproses") return "bg-orange-100 text-orange-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
      {/* Header & Pencarian */}
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-[#173663] sm:text-lg">
            Daftar Laporan
          </h2>
          <p className="mt-1 text-xs text-[#8192AA] sm:text-sm">
            Kelola laporan yang masuk dari warga.
          </p>
        </div>

        <input
          type="text"
          placeholder="Cari julukan, lokasi, jenis..."
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          className="w-full rounded-xl border border-[#DCE6F3] px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 sm:w-64 sm:px-4 sm:py-2 sm:text-sm"
        />
      </div>

      {/* Notifikasi simpan status */}
      {notifikasi && (
        <div className="mb-4 rounded-xl bg-[#E5F0FF] px-4 py-2.5 text-xs font-medium text-[#1556B8]">
          {notifikasi}
        </div>
      )}

      {/* Tombol Filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        {["Semua", ...daftarStatus].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:py-2 sm:text-sm ${
              filter === status
                ? "bg-[#1556B8] text-white"
                : "bg-[#F1F5FB] text-[#647A9B] hover:bg-blue-100"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* STATE LOADING / ERROR */}
      {loading ? (
        <p className="py-10 text-center text-sm text-[#8192AA]">
          Memuat data laporan...
        </p>
      ) : error ? (
        <p className="py-10 text-center text-sm text-red-500">{error}</p>
      ) : laporanDitampilkan.length === 0 ? (
        <p className="py-10 text-center text-sm text-[#8192AA]">
          Laporan tidak ditemukan.
        </p>
      ) : (
        <>
          {/* TAMPILAN KARTU KHUSUS HP (< md) */}
          <div className="space-y-3 md:hidden">
            {laporanDitampilkan.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[#E7EEF7] bg-[#FAFBFD] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-[#173663]">
                      {item.julukan}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#8192AA]">
                      {formatTanggal(item.created_at)} • {item.jenis_sampah}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getBadgeStatus(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-[#647A9B]">
                  📍 {item.lokasi}
                </p>

                <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-[#E7EEF7] pt-3">
                  <select
                    value={item.status}
                    onChange={(e) => ubahStatus(item.id, e.target.value)}
                    aria-label="Ubah status laporan"
                    className="rounded-lg border border-[#DCE6F3] bg-white px-2.5 py-2 text-xs font-medium text-[#173663] outline-none"
                  >
                    {daftarStatus.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <Link
                    href={`/admin/dashboard/laporan/${item.id}`}
                    className="rounded-lg bg-[#E5F0FF] px-3.5 py-2 text-xs font-semibold text-[#1556B8] transition hover:bg-[#D2E4FF]"
                  >
                    Lihat Detail →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* TAMPILAN TABEL KHUSUS LAPTOP / TABLET (>= md) */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-left text-sm">
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
                {laporanDitampilkan.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#F0F3F8] last:border-0 hover:bg-[#F9FBFF]"
                  >
                    <td className="px-4 py-4 font-semibold text-[#173663]">
                      {item.julukan}
                    </td>

                    <td className="max-w-[240px] truncate px-4 py-4 text-[#647A9B]">
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
                        onChange={(e) => ubahStatus(item.id, e.target.value)}
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
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}