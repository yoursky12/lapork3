"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Image from "next/image";
import "leaflet/dist/leaflet.css";

// Titik tengah Kelurahan Kelapa Tiga, Kec. Tanjung Karang Pusat, Bandar Lampung
const DEFAULT_CENTER = { lat: -5.4165, lng: 105.2585 };

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export default function PelaporanPage() {
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lokasi, setLokasi] = useState("");
  const [jenisSampah, setJenisSampah] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    DEFAULT_CENTER
  );

  // State pencarian alamat ke peta
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const isUserTypingRef = useRef(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);

  // Cek apakah seluruh poin 1-4 sudah terisi
  const isFormComplete =
    Boolean(selectedFile) &&
    lokasi.trim().length > 0 &&
    jenisSampah.trim().length > 0 &&
    deskripsi.trim().length > 0;

  // Mengubah koordinat GPS menjadi nama jalan otomatis
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    isUserTypingRef.current = false;
    setShowDropdown(false);
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

  // Mencari koordinat dari ketikan alamat (Forward Geocoding)
  const searchAddress = useCallback(
    async (query: string, autoSelectFirst = false) => {
      const cleanQuery = query.trim();
      if (cleanQuery.length < 3) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearchingLocation(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          cleanQuery
        )}&countrycodes=id&viewbox=105.20,-5.46,105.32,-5.36&bounded=0&limit=5&accept-language=id`;

        const res = await fetch(url);
        const data: NominatimResult[] = await res.json();
        const results = Array.isArray(data) ? data : [];

        setSearchResults(results);

        if (autoSelectFirst && results.length > 0) {
          const first = results[0];
          const lat = Number(Number(first.lat).toFixed(6));
          const lng = Number(Number(first.lon).toFixed(6));
          isUserTypingRef.current = false;
          setLokasi(first.display_name);
          setCoords({ lat, lng });
          setShowDropdown(false);
          setErrorMsg("");
        } else {
          setShowDropdown(true);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearchingLocation(false);
      }
    },
    []
  );

  // Autocomplete otomatis saat user mengetik lokasi (jeda 500ms)
  useEffect(() => {
    if (!isUserTypingRef.current) return;

    const timer = setTimeout(() => {
      if (lokasi.trim().length >= 3) {
        searchAddress(lokasi, false);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [lokasi, searchAddress]);

  // Tutup dropdown saran lokasi kalau klik di luar kolom pencarian
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pilih salah satu hasil pencarian alamat
  const handleSelectSearchResult = (item: NominatimResult) => {
    const lat = Number(Number(item.lat).toFixed(6));
    const lng = Number(Number(item.lon).toFixed(6));
    isUserTypingRef.current = false;
    setLokasi(item.display_name);
    setCoords({ lat, lng });
    setShowDropdown(false);
    setErrorMsg("");
  };

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

  // Pindahkan pin & arahkan kamera peta setiap kali koordinat berubah
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
      setErrorMsg("Poin 1 wajib diisi: Unggah foto tempat sampah terlebih dahulu.");
      return;
    }

    if (!lokasi.trim()) {
      setErrorMsg("Poin 2 wajib diisi: Tentukan patokan atau titik lokasi sampah.");
      return;
    }

    if (!jenisSampah.trim()) {
      setErrorMsg("Poin 3 wajib diisi: Pilih jenis sampah terlebih dahulu.");
      return;
    }

    if (!deskripsi.trim()) {
      setErrorMsg("Poin 4 wajib diisi: Tuliskan deskripsi singkat kondisi sampah.");
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
            {/* BANNER PERINGATAN ANTI HOAX & AI */}
              <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">
                <span className="mt-0.5 text-lg leading-none">⚠️</span>
                <div className="text-xs leading-relaxed">
                  <p className="font-bold text-red-900">
                    Peringatan: Dilarang Mengirim Laporan Hoax atau Gambar AI!
                  </p>
                  <p className="mt-1 text-red-700">
                    Wajib melampirkan foto asli kondisi nyata di lapangan. Laporan
                    palsu, rekayasa, atau gambar hasil buatan AI akan langsung
                    ditindaklanjuti.
                  </p>
                </div>
              </div>

            {errorMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                {errorMsg}
              </div>
            )}

            {/* 1. UPLOAD FOTO */}
            <div>
              <label className="mb-2 block text-[14px] font-bold text-[#17396B]">
                1. Foto tempat sampah <span className="text-red-500">*</span>
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
                  JPG atau PNG, maksimal 4.5 MB. Pastikan tumpukan sampah terlihat
                  jelas.
                </span>

                <span className="mt-3 rounded-lg bg-[#2475E5] px-5 py-2 text-[14px] font-semibold text-white">
                  {selectedFile ? "Ganti Foto" : "Pilih Foto"}
                </span>
              </label>
            </div>

            {/* 2. LOKASI & PETA INTERAKTIF */}
            <div>
              <label
                htmlFor="lokasi"
                className="mb-2 block text-[14px] font-bold text-[#17396B]"
              >
                2. Lokasi <span className="text-red-500">*</span>
              </label>

              {/* KOLOM PENCARIAN ALAMAT TERHUBUNG KE PETA */}
              <div ref={searchContainerRef} className="relative">
                <div className="flex gap-2">
                  <input
                    id="lokasi"
                    type="text"
                    value={lokasi}
                    onChange={(e) => {
                      isUserTypingRef.current = true;
                      setLokasi(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        searchAddress(lokasi, true);
                      }
                    }}
                    onFocus={() => {
                      if (searchResults.length > 0) {
                        setShowDropdown(true);
                      }
                    }}
                    placeholder="Ketik nama jalan atau wilayah, misal: Kelapa Tiga Bandar Lampung"
                    className="w-full rounded-lg border border-[#C9DDFB] px-3 py-3 text-xs text-[#17396B] outline-none transition placeholder:text-gray-400 focus:border-[#2475E5] focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() => searchAddress(lokasi, true)}
                    disabled={isSearchingLocation || lokasi.trim().length < 3}
                    className="shrink-0 rounded-lg bg-[#2475E5] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#155FC5] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSearchingLocation ? "Mencari..." : "Cari di Peta"}
                  </button>
                </div>

                {/* DROPDOWN HASIL PENCARIAN ALAMAT */}
                {showDropdown && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-52 overflow-y-auto rounded-xl border border-[#C9DDFB] bg-white shadow-lg">
                    {searchResults.length > 0 ? (
                      searchResults.map((item) => (
                        <button
                          key={item.place_id}
                          type="button"
                          onClick={() => handleSelectSearchResult(item)}
                          className="block w-full border-b border-[#EEF5FF] px-3.5 py-2.5 text-left text-xs text-[#17396B] transition last:border-b-0 hover:bg-[#EAF3FF]"
                        >
                          📍 {item.display_name}
                        </button>
                      ))
                    ) : (
                      !isSearchingLocation && (
                        <div className="px-3.5 py-2.5 text-xs text-[#7185A5]">
                          Lokasi tidak ditemukan. Coba ketik nama jalan terdekat lalu geser pin biru di peta.
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* CONTAINER PETA LEAFLET */}
              <div
                ref={mapContainerRef}
                className="relative z-0 mt-2 h-60 w-full overflow-hidden rounded-xl border border-[#C9DDFB] bg-[#E5F0FF]"
              />

              <p className="mt-1 text-[10px] text-[#7185A5]">
                Ketik alamat lalu klik hasil saran / tombol <strong>Cari di Peta</strong>, atau geser pin biru untuk menyesuaikan titiknya.
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

            {/* 3. JENIS SAMPAH */}
            <div>
              <label
                htmlFor="jenis"
                className="mb-2 block text-[14px] font-bold text-[#17396B]"
              >
                3. Jenis sampah <span className="text-red-500">*</span>
              </label>

              <select
                id="jenis"
                value={jenisSampah}
                onChange={(e) => setJenisSampah(e.target.value)}
                className="w-full rounded-lg border border-[#C9DDFB] bg-white px-3 py-3 text-xs text-[#17396B] outline-none focus:border-[#2475E5] focus:ring-2 focus:ring-blue-100"
              >
                <option value="" disabled>
                  -- Pilih jenis sampah --
                </option>
                <option value="Plastik">Plastik</option>
                <option value="Organik">Organik</option>
                <option value="Kertas">Kertas</option>
                <option value="Logam">Logam</option>
                <option value="Kaca">Kaca</option>
                <option value="Sampah campuran">Sampah campuran</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* 4. DESKRIPSI */}
            <div>
              <label
                htmlFor="deskripsi"
                className="mb-2 block text-[14px] font-bold text-[#17396B]"
              >
                4. Deskripsi singkat <span className="text-red-500">*</span>
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
            <div>
              <button
                type="submit"
                disabled={!isFormComplete || isSubmitting}
                className="w-full rounded-lg bg-[#2475E5] py-4 text-[16px] font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-[#155FC5] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
              >
                {isSubmitting ? "Mengirim Laporan..." : "Kirim Laporan →"}
              </button>

              {!isFormComplete && (
                <p className="mt-2 text-center text-[11px] font-medium text-[#7185A5]">
                  Lengkapi seluruh poin bertanda <span className="text-red-500">*</span> (poin 1–4) agar laporan dapat dikirim.
                </p>
              )}
            </div>
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
              "Lampirkan foto asli tempat sampah yang terlihat jelas (dilarang foto AI atau rekayasa).",
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