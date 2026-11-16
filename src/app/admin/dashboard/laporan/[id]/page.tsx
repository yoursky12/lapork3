
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "../../../../../components/admin/Sidebar";

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

export default function DetailLaporanPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [laporan, setLaporan] = useState<Laporan | null>(null);
  const [status, setStatus] = useState("Menunggu");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pesan, setPesan] = useState("");

  // Mengambil data laporan berdasarkan ID
  useEffect(() => {
    const ambilDetailLaporan = async () => {
      try {
        const response = await fetch("/api/laporan", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data laporan.");
        }

        const hasil = await response.json();
        console.log("ID dari URL:", id);
        console.log("Data dari API:", hasil.data);

        const dataDitemukan = hasil.data.find(
          (item: Laporan) => String(item.id).trim() === String(id).trim()
        );

        console.log("Data ditemukan:", dataDitemukan);

        if (dataDitemukan) {
          setLaporan(dataDitemukan);
          setStatus(dataDitemukan.status);
        }
      } catch {
        setError("Gagal memuat data laporan.");
      } finally {
        setLoading(false);
      }
    };

    ambilDetailLaporan();
  }, [id]);

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  const handleSimpan = async () => {
  try {
    setSaving(true);
    setPesan("");

    const response = await fetch("/api/laporan", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: laporan?.id,
        status: status,
        catatan_petugas: catatan,
      }),
    });

    const hasil = await response.json();

    if (!response.ok) {
      throw new Error(hasil.message || "Gagal menyimpan perubahan.");
    }

    setLaporan(hasil.data);
    setPesan("Perubahan laporan berhasil disimpan!");
  } catch (error) {
    setPesan(
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat menyimpan."
    );
  } finally {
    setSaving(false);
  }
};

  // Tampilan ketika data sedang dimuat
  if (loading) {
    return (
      <main className="flex min-h-screen bg-[#F2F7FF]">
        <Sidebar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-[#647A9B]">
            Memuat detail laporan...
          </p>
        </div>
      </main>
    );
  }

  // Tampilan jika laporan tidak ditemukan
  if (error || !laporan) {
    return (
      <main className="flex min-h-screen bg-[#F2F7FF]">
        <Sidebar />
        <div className="p-8">
          <p className="text-[#173663]">
            {error || "Laporan tidak ditemukan."}
          </p>
          <Link
            href="/admin/dashboard"
            className="mt-3 inline-block text-sm text-blue-600 hover:underline"
          >
            ← Kembali ke dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-[#F2F7FF]">
      <Sidebar />

      <section className="min-w-0 flex-1 px-5 py-6 md:px-7">
        {/* Judul */}
        <Link
          href="/admin/dashboard"
          className="text-[11px] font-medium text-[#2470D5] hover:underline"
        >
          ← Kembali ke daftar laporan
        </Link>

        <h1 className="mb-5 mt-2 text-xl font-bold text-[#173663]">
          Detail Laporan
        </h1>

        {/* Konten utama */}
        <div className="grid grid-cols-1 items-start gap-4 min-[700px]:grid-cols-2">

          {/* Kolom kiri: Foto dan lokasi */}
          <div className="rounded-2xl bg-white p-3.5 shadow-[0_5px_18px_rgba(30,80,150,0.08)]">

            <p className="mb-2.5 text-[12px] font-bold tracking-[1.5px] text-[#2470D5]">
              FOTO DARI PELAPOR
            </p>

            {/* Foto asli dari laporan warga */}
            <div className="flex min-h-[180px] items-center justify-center overflow-hidden rounded-xl border border-[#D2E3FA] bg-[#EEF5FF] p-3">
              <img
                src={laporan.foto_url}
                alt="Foto laporan sampah"
                className="h-auto max-h-[400px] w-auto max-w-full object-contain"
              />
            </div>

            <p className="mb-2.5 mt-3 text-[12px] font-bold tracking-[1.5px] text-[#2470D5]">
              TITIK LOKASI
            </p>

            {/* Peta sementara */}
            <div className="relative h-[150px] overflow-hidden rounded-xl border border-[#D2E3FA] bg-[#E1EDFC]">
              <svg
                viewBox="0 0 300 100"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
              >
                <path
                  d="M-10 70 C60 25 100 100 165 55 S250 20 320 55"
                  stroke="white"
                  strokeWidth="5"
                  fill="none"
                />
                <path
                  d="M90 -10 L120 110"
                  stroke="white"
                  strokeWidth="5"
                  fill="none"
                />
              </svg>

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
                📍
              </div>
            </div>

            {laporan.latitude !== null &&
              laporan.longitude !== null && (
                <a
                  href={`https://www.google.com/maps?q=${laporan.latitude},${laporan.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block text-xs font-medium text-[#2470D5] hover:underline"
                >
                  Lihat lokasi di Google Maps →
                </a>
              )}
          </div>

          {/* Kolom kanan */}
          <div className="space-y-3.5">

            {/* Informasi laporan */}
            <div className="rounded-2xl bg-white p-4 shadow-[0_5px_18px_rgba(30,80,150,0.08)]">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-[16px] font-bold text-[#2470D5]">
                  {laporan.julukan}
                </h2>

                <span className="shrink-0 rounded-full bg-[#E5F0FF] px-2.5 py-1 text-[10px] font-semibold text-[#1556B8]">
                  ID: {laporan.id}
                </span>
              </div>

              <div className="space-y-2 text-[14px]">
                <div className="grid grid-cols-[65px_1fr] gap-2">
                  <span className="text-[#8192AA]">Lokasi</span>
                  <span className="font-medium text-[#173663]">
                    {laporan.lokasi}
                  </span>
                </div>

                <div className="grid grid-cols-[65px_1fr] gap-2">
                  <span className="text-[#8192AA]">Jenis</span>
                  <span className="font-medium text-[#173663]">
                    {laporan.jenis_sampah}
                  </span>
                </div>

                <div className="grid grid-cols-[65px_1fr] gap-2">
                  <span className="text-[#8192AA]">Tanggal lapor</span>
                  <span className="font-medium text-[#173663]">
                    {formatTanggal(laporan.created_at)}
                  </span>
                </div>

                <div className="grid grid-cols-[65px_1fr] gap-2">
                  <span className="text-[#8192AA]">Status saat ini</span>
                  <span className="w-fit rounded-full bg-[#E0ECFF] px-3 py-1 font-semibold text-[#1556B8]">
                    {status}
                  </span>
                </div>
              </div>

              <p className="mb-2 mt-4 text-[9px] font-bold tracking-[1.5px] text-[#2470D5]">
                DESKRIPSI PELAPOR
              </p>

              <div className="rounded-lg bg-[#F1F6FE] p-2.5 text-[10px] leading-relaxed text-[#647A9B]">
                {laporan.deskripsi}
              </div>
            </div>

            {/* Ubah status */}
            <div className="rounded-2xl bg-white p-4 shadow-[0_5px_18px_rgba(30,80,150,0.08)]">
              <h2 className="mb-3 text-sm font-bold text-[#2470D5]">
                Ubah Status
              </h2>

              <div className="grid grid-cols-3 gap-1.5">
                {["Menunggu", "Diproses", "Selesai"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setStatus(item)}
                    className={`rounded-lg border px-1 py-2 text-[9px] transition ${
                      status === item
                        ? "border-[#1556B8] bg-[#E5F0FF] font-bold text-[#1556B8]"
                        : "border-[#CFE0FA] bg-white text-[#647A9B] hover:bg-[#F1F6FE]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <label className="mb-1.5 mt-3 block text-[10px] font-semibold text-[#173663]">
                Catatan petugas (opsional)
              </label>

              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Petugas kebersihan dijadwalkan hari Jumat."
                rows={3}
                className="w-full resize-none rounded-lg border border-[#CFE0FA] p-2.5 text-[10px] outline-none placeholder:text-[#999] focus:border-[#2470D5]"
              />

              <button
                onClick={handleSimpan}
                disabled={saving}
                className="mt-2 w-full rounded-lg bg-[#2470D5] py-2.5 text-[10px] font-bold text-white shadow-md shadow-blue-200 transition hover:bg-[#1556B8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
              {pesan && (
                <p className="mt-2 text-center text-xs text-[#2470D5]">
                  {pesan}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
