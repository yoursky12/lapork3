"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Laporan {
  id?: string | number;
  julukan?: string;
  lokasi?: string;
  jenis_sampah?: string;
  created_at?: string;
  status?: string;
}

function formatTanggal(tanggal?: string) {
  if (!tanggal) return "-";
  const date = new Date(tanggal);
  if (isNaN(date.getTime())) return tanggal;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DataSection() {
  const [reports, setReports] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLaporan() {
      try {
        const res = await fetch("/api/laporan");
        if (!res.ok) throw new Error("Gagal mengambil data laporan");
        const result = await res.json();

        const listData = Array.isArray(result)
          ? result
          : result.data || result.laporan || [];

        setReports(listData);
      } catch (error) {
        console.error("Error memuat data laporan:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLaporan();
  }, []);

  const totalLaporan = reports.length;
  const menungguCount = reports.filter(
    (r) => (r.status || "Menunggu").toLowerCase() === "menunggu"
  ).length;
  const diprosesCount = reports.filter(
    (r) => (r.status || "").toLowerCase() === "diproses"
  ).length;
  const selesaiCount = reports.filter(
    (r) => (r.status || "").toLowerCase() === "selesai"
  ).length;

  const statistics = [
    { value: totalLaporan.toString(), label: "Total laporan" },
    { value: menungguCount.toString(), label: "Menunggu" },
    { value: diprosesCount.toString(), label: "Diproses" },
    { value: selesaiCount.toString(), label: "Selesai" },
  ];

  return (
    <section
      id="data-laporan"
      className="bg-[#F3F7FF] px-6 py-16 md:px-12"
    >
      <div className="mx-auto max-w-6xl">
        {/* Judul dan Tombol */}
        <div className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold tracking-widest text-blue-600">
              DATA LAPORAN
            </p>

            <h2 className="text-2xl font-extrabold text-[#173765] md:text-3xl">
              Siapa saja yang sudah peduli?
            </h2>

            <p className="mt-2 text-xs text-[#647B9B]">
              Pelapor ditampilkan dengan julukan anonim secara real-time.
            </p>
          </div>

          <Link
            href="/pelaporan"
            className="rounded-xl bg-blue-600 px-5 py-3 text-center text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            + Buat Laporan
          </Link>
        </div>

        {/* Kartu Statistik */}
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statistics.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl bg-blue-600 p-5 text-white"
            >
              <h3 className="text-2xl font-extrabold">
                {loading ? "..." : item.value}
              </h3>
              <p className="mt-1 text-xs text-blue-100">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Tabel Laporan */}
        <div className="overflow-x-auto rounded-2xl bg-white p-5 shadow-[0_5px_20px_rgba(30,70,130,0.07)]">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead>
              <tr className="border-b border-blue-100 text-[10px] font-bold text-[#647B9B]">
                <th className="px-2 py-4">PELAPOR (JULUKAN)</th>
                <th className="px-2 py-4">LOKASI</th>
                <th className="px-2 py-4">JENIS</th>
                <th className="px-2 py-4">TANGGAL</th>
                <th className="px-2 py-4">STATUS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#647B9B]">
                    Memuat data laporan...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#647B9B]">
                    Belum ada laporan masuk. Jadilah yang pertama melapor!
                  </td>
                </tr>
              ) : (
                reports.map((report, index) => {
                  const statusLabel = report.status || "Menunggu";
                  return (
                    <tr
                      key={report.id || index}
                      className="border-b border-blue-50 text-[#173765] last:border-0"
                    >
                      <td className="whitespace-nowrap px-2 py-3">
                        <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                          ➤
                        </span>
                        <span className="font-semibold">
                          {report.julukan || "Pahlawan Lingkungan"}
                        </span>
                      </td>

                      <td className="px-2 py-3">
                        {report.lokasi || "Lokasi tidak tercatat"}
                      </td>
                      <td className="px-2 py-3">
                        {report.jenis_sampah || "-"}
                      </td>
                      <td className="whitespace-nowrap px-2 py-3">
                        {formatTanggal(report.created_at)}
                      </td>

                      <td className="px-2 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                            statusLabel === "Menunggu"
                              ? "bg-amber-100 text-amber-800"
                              : statusLabel === "Diproses"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}