"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Image from "next/image";
import "leaflet/dist/leaflet.css";

// Koordinat default: Kelurahan Kelapa Tiga, Bandar Lampung
const DEFAULT_CENTER = { lat: -5.39714, lng: 105.26679 };

export default function PelaporanPage() {
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lokasi, setLokasi] = useState("");
  const [jenisSampah, setJenisSampah] = useState("Plastik");
  const [deskripsi, setDeskripsi] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);

  // Mengubah koordinat GPS menjadi nama jalan otomatis (Gratis via OpenStreetMap)
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id`
      );
      const data = await res.json();
      if (data?.display_name) {
        setLokasi(data.display_name);
      } else {
        setLokasi(`Titik GPS (${lat}, ${lng})`);
      }
    } catch {
      setLokasi(`Titik GPS (${lat}, ${lng})`);
    }
  }, []);

  // Inisialisasi Peta Interaktif Leaflet
  useEffect(() => {
    let isMounted = true;

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

      const map = L.map(mapContainerRef.current).setView(
        [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
        15
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const marker = L.marker([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);

      // Update koordinat & alamat saat pin digeser manual
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        const lat = Number(pos.lat.toFixed(6));
        const lng = Number(pos.lng.toFixed(6));
        setCoords({ lat, lng });
        reverseGeocode(lat, lng);
      });

      // Update koordinat & alamat saat peta diklik
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.on("click", (e: any) => {
        const lat = Number(e.latlng.lat.toFixed(6));
        const lng = Number(e.latlng.lng.toFixed(6));
        marker.setLatLng([lat, lng]);
        setCoords({ lat, lng });
        reverseGeocode(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    setupMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [reverseGeocode]);

  // Pindahkan pin peta saat GPS perangkat terdeteksi
  useEffect(() => {
    if (coords && mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng]);
      mapInstanceRef.current.setView([coords.lat, coords.lng], 17);
    }
  }, [coords]);

  const detectLocation = useCallback(
    (isAuto = false) => {
      if (!("geolocation" in navigator)) {
        if (!isAuto) {
          setErrorMsg("Browser tidak mendukung fitur lokasi GPS.");
        }
        return;
      }

      setIsLocating(true);
      if (!isAuto) {
        setErrorMsg("");
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = Number(position.coords.latitude.toFixed(6));
          const lng = Number(position.coords.longitude.toFixed(6));
          setCoords({ lat, lng });
          reverseGeocode(lat, lng);
          setIsLocating(false);
        },
        () => {
          if (!isAuto) {
            setErrorMsg(
              "Gagal mengambil lokasi. Pastikan izin lokasi di browser aktif."
            );
          }
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    },
    [reverseGeocode]
  );

  useEffect(() => {
    detectLocation(true);
  }, [detectLocation]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMsg("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedFile) {
      setErrorMsg("Silakan pilih atau unggah foto tempat sampah terlebih dahulu.");
      return;
    }

    if (!lokasi.trim()) {
      setErrorMsg("Silakan isi patokan lokasi sampah.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("foto", selectedFile);
      formData.append("lokasi", lokasi);
      formData.append("jenis_sampah", jenisSampah);
      formData.append("deskripsi", deskripsi);

      if (coords) {
        formData.append("latitude", String(coords.lat));
        formData.append("longitude", String(coords.lng));
      }

      const response = await fetch("/api/laporan", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMsg(result.error || "Gagal mengirim laporan.");
        setIsSubmitting(false);
        return;
      }

      sessionStorage.setItem("laporanTerakhir", JSON.stringify(result.data));
      router.push(
        `/laporan-berhasil?julukan=${encodeURIComponent(result.data.julukan)}`
      );
    } catch {
      setErrorMsg("Terjadi gangguan koneksi ke server.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F7FF]">
      {/* NAVBAR STICKY */}
      <Navbar activePage="lapor" />

      {/* JUDUL HALAMAN */}
      <section className="bg-gradient-to-br from-[#1559BD] via-[#2879DC] to-[#70B4F8] text-white">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-2 md:px-12">
          <h2 className="text-3xl font-extrabold md:text-4xl">
            Lapor Sampah
          </h2>

          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/90">
            Isi form singkat ini. Kamu tidak perlu menulis nama, laporanmu
            otomatis anonim.
          </p>
        </div>
      </section>

      {/* KONTEN UTAMA */}
      <main className="mx-auto -mt-9 grid max-w-6xl grid-cols-1 items-start gap-5 px-6 pb-16 md:grid-cols-[minmax(0,2fr)_minmax(260px,0.9fr)]">
        {/* FORM PELAPORAN */}
        <section className="rounded-2xl bg-white p-6 shadow-[0_12px_30px_rgba(30,90,160,0.12)] md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                {errorMsg}
              </div>
            )}

            {/* UPLOAD FOTO */}
            <div>
              <label className="mb-2 block text-[14px] font-bold text-[#17396B]">
                1. Foto tempat sampah
              </label>

              <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#91BCFF] bg-[#F3F8FF] px-4 py-5 text-center transition hover:bg-[#EAF3FF]">
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <span className="text-3xl text-[#2475E5]">📷</span>

                <span className="mt-2 text-sm font-bold text-[#17396B]">
                  {selectedFile ? selectedFile.name : "Ambil atau unggah foto"}
                </span>

                <span className="mt-2 text-[10px] text-[#7185A5]">
                  JPG atau PNG, maksimal 5 MB. Pastikan tumpukan sampah terlihat
                  jelas.
                </span>

                <span className="mt-3 rounded-lg bg-[#2475E5] px-5 py-2 text-[14px] font-semibold text-white">
                  {selectedFile ? "Ganti Foto" : "Pilih Foto"}
                </span>
              </label>
            </div>

            {/* LOKASI & PETA INTERAKTIF */}
            <div>
              <label
                htmlFor="lokasi"
                className="mb-2 block text-[14px] font-bold text-[#17396B]"
              >
                2. Lokasi
              </label>

              <input
                id="lokasi"
                type="text"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                placeholder="Contoh: Jl. Raja Muda, dekat RT 03"
                className="w-full rounded-lg border border-[#C9DDFB] px-3 py-3 text-xs text-[#17396B] outline-none transition placeholder:text-gray-400 focus:border-[#2475E5] focus:ring-2 focus:ring-blue-100"
              />

              {/* CONTAINER PETA LEAFLET */}
              <div
                ref={mapContainerRef}
                className="relative z-0 mt-2 h-60 w-full overflow-hidden rounded-xl border border-[#C9DDFB] bg-[#E5F0FF]"
              />

              <p className="mt-1 text-[10px] text-[#7185A5]">
                Klik pada peta atau geser pin biru untuk menyesuaikan titik lokasi sampah.
              </p>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => detectLocation(false)}
                  disabled={isLocating}
                  className="rounded-lg bg-[#E4F0FF] px-3 py-2 text-[10px] font-semibold text-[#1766CE] transition hover:bg-[#D5E7FF] disabled:opacity-60"
                >
                  {isLocating
                    ? "Mendeteksi lokasi..."
                    : coords
                    ? "Perbarui lokasi saya saat ini"
                    : "Gunakan lokasi saya saat ini"}
                </button>

                {coords && (
                  <span className="text-[11px] font-medium text-[#1766CE]">
                    GPS: {coords.lat}, {coords.lng}
                  </span>
                )}
              </div>
            </div>

            {/* JENIS SAMPAH */}
            <div>
              <label
                htmlFor="jenis"
                className="mb-2 block text-[14px] font-bold text-[#17396B]"
              >
                3. Jenis sampah
              </label>

              <select
                id="jenis"
                value={jenisSampah}
                onChange={(e) => setJenisSampah(e.target.value)}
                className="w-full rounded-lg border border-[#C9DDFB] bg-white px-3 py-3 text-xs text-[#17396B] outline-none focus:border-[#2475E5] focus:ring-2 focus:ring-blue-100"
              >
                <option value="Plastik">Plastik</option>
                <option value="Organik">Organik</option>
                <option value="Kertas">Kertas</option>
                <option value="Logam">Logam</option>
                <option value="Kaca">Kaca</option>
                <option value="Sampah campuran">Sampah campuran</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* DESKRIPSI */}
            <div>
              <label
                htmlFor="deskripsi"
                className="mb-2 block text-[14px] font-bold text-[#17396B]"
              >
                4. Deskripsi singkat
              </label>

              <textarea
                id="deskripsi"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                maxLength={200}
                rows={4}
                placeholder="Ceritakan singkat kondisi sampah, misalnya sudah berapa lama menumpuk..."
                className="w-full resize-none rounded-lg border border-[#C9DDFB] px-3 py-3 text-xs text-[#17396B] outline-none placeholder:text-gray-400 focus:border-[#2475E5] focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-right text-[9px] text-[#7185A5]">
                {deskripsi.length}/200 karakter
              </p>
            </div>

            {/* INFORMASI ANONIM */}
            <div className="flex items-start gap-3 rounded-xl bg-[#E6F1FF] p-4">
              <Image
                src="/lapor.svg"
                alt="Ikon keamanan"
                width={24}
                height={24}
                className="h-8 w-8 object-contain"
              />
              <p className="text-[14px] leading-relaxed text-[#244675]">
                <strong>Laporan anonim.</strong> Kami tidak meminta nama, nomor
                telepon, atau akun. Kamu akan mendapat julukan acak sebagai
                tanda terima kasih.
              </p>
            </div>

            {/* TOMBOL KIRIM */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#2475E5] py-4 text-[16px] font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-[#155FC5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Mengirim Laporan..." : "Kirim Laporan →"}
            </button>
          </form>
        </section>

        {/* KETENTUAN UMUM */}
        <aside className="rounded-2xl bg-white p-6 shadow-[0_8px_25px_rgba(30,90,160,0.10)]">
          <h3 className="mb-5 text-[16px] font-bold text-[#2475E5]">
            Ketentuan Umum
          </h3>

          <ol className="space-y-3.5">
            {[
              "Laporan bersifat anonim. Identitas pelapor tidak dikumpulkan.",
              "Lampirkan foto asli tempat sampah yang terlihat jelas.",
              "Isi lokasi seakurat mungkin agar petugas mudah menemukan titiknya.",
              "Tulis deskripsi singkat, jelas, dan sopan.",
              "Satu laporan untuk satu lokasi. Jangan mengirim laporan palsu atau berulang.",
              "Jangan menyertakan wajah, plat nomor, atau data pribadi orang lain di foto.",
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2475E5] text-[12px] font-bold text-white">
                  {index + 1}
                </span>
                <p className="text-[14px] leading-relaxed text-[#526987]">
                  {item}
                </p>
              </li>
            ))}
          </ol>
        </aside>
      </main>
    </div>
  );
}