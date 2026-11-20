"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Sidebar from "../../../../../components/admin/Sidebar";
import "leaflet/dist/leaflet.css";

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
  catatan_petugas?: string | null;
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

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

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

        const dataDitemukan = hasil.data.find(
          (item: Laporan) => String(item.id).trim() === String(id).trim()
        );

        if (dataDitemukan) {
          setLaporan(dataDitemukan);
          setStatus(dataDitemukan.status);
          setCatatan(dataDitemukan.catatan_petugas || "");
        }
      } catch {
        setError("Gagal memuat data laporan.");
      } finally {
        setLoading(false);
      }
    };

    ambilDetailLaporan();
  }, [id]);

  // Inisialisasi Peta Leaflet sesuai koordinat laporan
  useEffect(() => {
    if (
      !laporan ||
      laporan.latitude === null ||
      laporan.longitude === null
    ) {
      return;
    }

    let isMounted = true;
    const lat = Number(laporan.latitude);
    const lng = Number(laporan.longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    async function setupMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;
      if (!isMounted || !mapContainerRef.current) return;

      const customIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      const map = L.map(mapContainerRef.current).setView([lat, lng], 16);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      L.marker([lat, lng], { icon: customIcon }).addTo(map);

      mapInstanceRef.current = map;
    }

    setupMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [laporan]);

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
      <main className="flex min-h-screen flex-col bg-[#F2F7FF] md:flex-row">
        <Sidebar />
        <div className="flex flex-1 items-center justify-center p-6">
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
      <main className="flex min-h-screen flex-col bg-[#F2F7FF] md:flex-row">
        <Sidebar />
        <div className="p-6 md:p-8">
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

  const hasCoords =
    laporan.latitude !== null && laporan.longitude !== null;

  return (
    <main className="flex min-h-screen flex-col bg-[#F2F7FF] md:flex-row">
      <Sidebar />

      <section className="min-w-0 flex-1 px-4 py-5 sm:px-6 md:px-8 md:py-7">
        {/* Judul */}
        <Link
          href="/admin/dashboard"
          className="inline-block text-xs font-medium text-[#2470D5] hover:underline"
        >
          ← Kembali ke daftar laporan
        </Link>

        <h1 className="mb-5 mt-2 text-xl font-bold text-[#173663] sm:text-2xl">
          Detail Laporan
        </h1>

        {/* Konten utama */}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          {/* Kolom kiri: Foto dan lokasi */}
          <div className="rounded-2xl bg-white p-4 shadow-[0_5px_18px_rgba(30,80,150,0.08)] sm:p-5">
            <p className="mb-2.5 text-xs font-bold tracking-[1.5px] text-[#2470D5]">
              FOTO DARI PELAPOR
            </p>

            {/* Foto asli dari laporan warga */}
            <div className="flex min-h-[180px] items-center justify-center overflow-hidden rounded-xl border border-[#D2E3FA] bg-[#EEF5FF] p-3">
              <img
                src={laporan.foto_url}
                alt="Foto laporan sampah"
                className="h-auto max-h-[380px] w-auto max-w-full object-contain"
              />
            </div>

            <p className="mb-2.5 mt-4 text-xs font-bold tracking-[1.5px] text-[#2470D5]">
              TITIK LOKASI
            </p>

            {/* Peta Interaktif Leaflet */}
            {hasCoords ? (
              <>
                <div
                  ref={mapContainerRef}
                  className="relative z-0 h-56 w-full overflow-hidden rounded-xl border border-[#D2E3FA] bg-[#E5F0FF]"
                />

                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                  <a
                    href={`https://www.google.com/maps?q=${laporan.latitude},${laporan.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-[#2470D5] hover:underline"
                  >
                    Lihat lokasi di Google Maps →
                  </a>

                  <span className="text-[11px] text-[#647A9B]">
                    {laporan.latitude}, {laporan.longitude}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex h-[150px] items-center justify-center rounded-xl border border-[#D2E3FA] bg-[#F1F6FE] px-4 text-center text-xs text-[#647A9B]">
                Titik koordinat GPS tidak disertakan oleh pelapor.
              </div>
            )}
          </div>

          {/* Kolom kanan */}
          <div className="space-y-4">
            {/* Informasi laporan */}
            <div className="rounded-2xl bg-white p-4 shadow-[0_5px_18px_rgba(30,80,150,0.08)] sm:p-5">
              <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-bold text-[#2470D5] sm:text-lg">
                  {laporan.julukan}
                </h2>

                <span className="shrink-0 rounded-full bg-[#E5F0FF] px-3 py-1 text-xs font-semibold text-[#1556B8]">
                  ID: {laporan.id}
                </span>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="grid grid-cols-[95px_1fr] gap-2">
                  <span className="text-[#8192AA]">Lokasi</span>
                  <span className="font-medium text-[#173663]">
                    {laporan.lokasi}
                  </span>
                </div>

                <div className="grid grid-cols-[95px_1fr] gap-2">
                  <span className="text-[#8192AA]">Jenis</span>
                  <span className="font-medium text-[#173663]">
                    {laporan.jenis_sampah}
                  </span>
                </div>

                <div className="grid grid-cols-[95px_1fr] gap-2">
                  <span className="text-[#8192AA]">Tanggal lapor</span>
                  <span className="font-medium text-[#173663]">
                    {formatTanggal(laporan.created_at)}
                  </span>
                </div>

                <div className="grid grid-cols-[95px_1fr] items-center gap-2">
                  <span className="text-[#8192AA]">Status saat ini</span>
                  <span className="w-fit rounded-full bg-[#E0ECFF] px-3 py-1 text-xs font-semibold text-[#1556B8]">
                    {status}
                  </span>
                </div>
              </div>

              <p className="mb-2 mt-4 text-xs font-bold tracking-[1.5px] text-[#2470D5]">
                DESKRIPSI PELAPOR
              </p>

              <div className="rounded-xl bg-[#F1F6FE] p-3 text-xs leading-relaxed text-[#647A9B] sm:text-sm">
                {laporan.deskripsi || "Tidak ada deskripsi tambahan."}
              </div>
            </div>

            {/* Ubah status */}
            <div className="rounded-2xl bg-white p-4 shadow-[0_5px_18px_rgba(30,80,150,0.08)] sm:p-5">
              <h2 className="mb-3 text-sm font-bold text-[#2470D5] sm:text-base">
                Ubah Status
              </h2>

              <div className="grid grid-cols-3 gap-2">
                {["Menunggu", "Diproses", "Selesai"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setStatus(item)}
                    className={`rounded-xl border px-2 py-2.5 text-xs transition ${
                      status === item
                        ? "border-[#1556B8] bg-[#E5F0FF] font-bold text-[#1556B8]"
                        : "border-[#CFE0FA] bg-white font-medium text-[#647A9B] hover:bg-[#F1F6FE]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <label className="mb-1.5 mt-4 block text-xs font-semibold text-[#173663]">
                Catatan petugas (opsional)
              </label>

              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Petugas kebersihan dijadwalkan hari Jumat."
                rows={3}
                className="w-full resize-none rounded-xl border border-[#CFE0FA] p-3 text-xs text-[#173663] outline-none placeholder:text-[#999] focus:border-[#2470D5] sm:text-sm"
              />

              <button
                type="button"
                onClick={handleSimpan}
                disabled={saving}
                className="mt-3 w-full rounded-xl bg-[#2470D5] py-3 text-xs font-bold text-white shadow-md shadow-blue-200 transition hover:bg-[#1556B8] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>

              {pesan && (
                <p className="mt-2.5 text-center text-xs font-medium text-[#2470D5]">
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