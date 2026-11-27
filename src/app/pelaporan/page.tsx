"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Image from "next/image";
import "leaflet/dist/leaflet.css";

// Poligon batas wilayah Kelurahan Kelapa Tiga (mengikuti Jl. Sisingamangaraja, Pasar Tamin, Jl. Kartini, dan Jl. H. Agus Salim)
const KELAPA_TIGA_POLYGON: [number, number][] = [
  [-5.4062, 105.2368], // Puncak barat laut (tikungan Jl. Sisingamangaraja)
  [-5.4082, 105.2412], // Lekukan tengah Jl. Sisingamangaraja
  [-5.4086, 105.2465], // Sekitar Pasar Tamin
  [-5.4088, 105.2558], // Ujung timur laut (Jl. Kartini / dekat Chandra Mall)
  [-5.4120, 105.2552], // Ujung tenggara (Simpur Center / Jl. H. Agus Salim)
  [-5.4118, 105.2342], // Batas selatan lurus mengikuti Jl. H. Agus Salim
  [-5.4076, 105.2345], // Sisi barat kembali ke arah Jl. Sisingamangaraja
];

const DEFAULT_CENTER = { lat: -5.4102, lng: 105.2435 };

// Toleransi geser pin maksimal 100 meter dari titik GPS asli (untuk gang sempit)
const MAX_PIN_OFFSET_METERS = 100;

function isWithinKelapaTiga(lat: number, lng: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;

  let inside = false;
  for (
    let i = 0, j = KELAPA_TIGA_POLYGON.length - 1;
    i < KELAPA_TIGA_POLYGON.length;
    j = i++
  ) {
    const [latI, lngI] = KELAPA_TIGA_POLYGON[i];
    const [latJ, lngJ] = KELAPA_TIGA_POLYGON[j];

    const intersect =
      lngI > lng !== lngJ > lng &&
      lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI) + latI;

    if (intersect) inside = !inside;
  }
  return inside;
}

function getDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function PelaporanPage() {
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [lokasi, setLokasi] = useState("");
  const [patokan, setPatokan] = useState("");
  const [jenisSampah, setJenisSampah] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [isLocationValid, setIsLocationValid] = useState(false);
  const [locationStatusMsg, setLocationStatusMsg] = useState(
    "Mendeteksi posisi GPS perangkat..."
  );

  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Ref kamera live
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Simpan titik GPS asli dari perangkat sebagai acuan batas geser pin
  const rawGpsCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);

  // Cek apakah seluruh poin 1-4 terpenuhi & lokasi sah di Kelapa Tiga
  const isFormComplete =
    Boolean(selectedFile) &&
    coords !== null &&
    isLocationValid &&
    lokasi.trim().length > 0 &&
    jenisSampah.trim().length > 0 &&
    deskripsi.trim().length > 0;

  // Menghentikan stream kamera
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  }, []);

  // Membuka kamera langsung di dalam browser (tanpa File Explorer / Galeri)
  const startCamera = async () => {
    setErrorMsg("");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg(
        "Browser tidak mendukung akses kamera langsung. Gunakan Chrome atau Safari terbaru."
      );
      return;
    }

    try {
      stopCameraStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch {
      setErrorMsg(
        "Gagal mengakses kamera. Pastikan izin kamera di browser sudah diizinkan."
      );
    }
  };

  // Sambungkan stream ke elemen <video> saat kamera dibuka
  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isCameraOpen]);

  // Jepret foto dari tampilan kamera live
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setErrorMsg("Gagal menangkap gambar dari kamera.");
          return;
        }

        const file = new File([blob], `kamera-${Date.now()}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setErrorMsg("");
        stopCameraStream();
      },
      "image/jpeg",
      0.85
    );
  };

  // Bersihkan kamera & preview saat komponen ditutup
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Mengubah koordinat GPS menjadi nama jalan otomatis
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id`
      );
      const data = await res.json();
      if (data?.display_name) {
        setLokasi(data.display_name);
      } else {
        setLokasi(`Titik GPS Kelapa Tiga (${lat}, ${lng})`);
      }
    } catch {
      setLokasi(`Titik GPS Kelapa Tiga (${lat}, ${lng})`);
    }
  }, []);

  // Inisialisasi Peta Interaktif Leaflet + Garis Batas Wilayah Kelapa Tiga
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

      // Gambar garis batas poligon area layanan Kelurahan Kelapa Tiga
      L.polygon(KELAPA_TIGA_POLYGON, {
        color: "#2475E5",
        weight: 2,
        dashArray: "6 6",
        fillColor: "#2475E5",
        fillOpacity: 0.08,
      }).addTo(map);

      const marker = L.marker([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);

      const handleAdjustPin = (newLat: number, newLng: number) => {
        const anchor = rawGpsCoordsRef.current;

        if (!anchor || !isWithinKelapaTiga(anchor.lat, anchor.lng)) {
          setErrorMsg(
            "Aktifkan GPS di dalam wilayah Kelurahan Kelapa Tiga terlebih dahulu."
          );
          if (anchor) {
            marker.setLatLng([anchor.lat, anchor.lng]);
          }
          return;
        }

        const distance = getDistanceMeters(
          anchor.lat,
          anchor.lng,
          newLat,
          newLng
        );

        if (
          !isWithinKelapaTiga(newLat, newLng) ||
          distance > MAX_PIN_OFFSET_METERS
        ) {
          marker.setLatLng([anchor.lat, anchor.lng]);
          setCoords({ lat: anchor.lat, lng: anchor.lng });
          setErrorMsg(
            "Pin hanya dapat disesuaikan maksimal 100 meter dari posisi GPS Anda dan harus tetap di dalam Kelurahan Kelapa Tiga."
          );
          return;
        }

        setErrorMsg("");
        setCoords({ lat: newLat, lng: newLng });
        reverseGeocode(newLat, newLng);
      };

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        handleAdjustPin(
          Number(pos.lat.toFixed(6)),
          Number(pos.lng.toFixed(6))
        );
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.on("click", (e: any) => {
        handleAdjustPin(
          Number(e.latlng.lat.toFixed(6)),
          Number(e.latlng.lng.toFixed(6))
        );
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
        setIsLocationValid(false);
        setLocationStatusMsg("Browser tidak mendukung fitur lokasi GPS.");
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

          rawGpsCoordsRef.current = { lat, lng };
          setCoords({ lat, lng });

          if (isWithinKelapaTiga(lat, lng)) {
            setIsLocationValid(true);
            setLocationStatusMsg(
              "Lokasi terverifikasi di dalam wilayah Kelurahan Kelapa Tiga."
            );
            setErrorMsg("");
            reverseGeocode(lat, lng);
          } else {
            setIsLocationValid(false);
            setLokasi("");
            setLocationStatusMsg(
              "Di luar jangkauan: posisi GPS Anda berada di luar Kelurahan Kelapa Tiga, Bandar Lampung."
            );
            setErrorMsg(
              "Pelaporan ditolak: layanan ini khusus untuk titik sampah di dalam wilayah Kelurahan Kelapa Tiga."
            );
          }

          setIsLocating(false);
        },
        () => {
          setIsLocationValid(false);
          setLocationStatusMsg(
            "Izin GPS belum aktif. Aktifkan lokasi perangkat untuk melapor."
          );
          if (!isAuto) {
            setErrorMsg(
              "Gagal mengambil lokasi GPS. Pastikan izin lokasi di browser sudah diaktifkan."
            );
          }
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    },
    [reverseGeocode]
  );

  useEffect(() => {
    detectLocation(true);
  }, [detectLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedFile) {
      setErrorMsg("Poin 1 wajib diisi: Ambil foto tempat sampah menggunakan kamera.");
      return;
    }

    if (!coords || !isLocationValid || !isWithinKelapaTiga(coords.lat, coords.lng)) {
      setErrorMsg(
        "Poin 2 tidak valid: Lokasi GPS harus berada di dalam wilayah Kelurahan Kelapa Tiga."
      );
      return;
    }

    if (!lokasi.trim()) {
      setErrorMsg("Poin 2 wajib diisi: Tunggu titik lokasi GPS terbaca.");
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

      const lokasiLengkap = patokan.trim()
        ? `${lokasi.trim()} (Patokan: ${patokan.trim()})`
        : lokasi.trim();
      formData.append("lokasi", lokasiLengkap);

      formData.append("jenis_sampah", jenisSampah);
      formData.append("deskripsi", deskripsi);
      formData.append("latitude", String(coords.lat));
      formData.append("longitude", String(coords.lng));

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

            {/* 1. KAMERA LANGSUNG (LIVE VIEWFINDER, TANPA FILE PICKER) */}
            <div>
              <label className="mb-2 block text-[14px] font-bold text-[#17396B]">
1. Foto tempat sampah (Kamera Langsung){" "}
                <span className="text-red-500">*</span>
              </label>

              <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#91BCFF] bg-[#F3F8FF] px-4 py-5 text-center">
                {isCameraOpen ? (
                  <div className="w-full space-y-3">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="mx-auto max-h-64 w-full rounded-lg border border-[#C9DDFB] bg-black object-cover"
                    />
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="rounded-lg bg-[#2475E5] px-5 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#155FC5]"
                      >
                        📸 Jepret Foto Sekarang
                      </button>
                      <button
                        type="button"
                        onClick={stopCameraStream}
                        className="rounded-lg border border-[#C9DDFB] bg-white px-4 py-2.5 text-xs font-semibold text-[#526987] transition hover:bg-gray-50"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview foto sampah"
                        className="max-h-52 w-auto rounded-lg border border-[#C9DDFB] object-contain shadow-sm"
                      />
                    ) : (
                      <span className="text-3xl text-[#2475E5]">📷</span>
                    )}

                    <span className="mt-2 text-sm font-bold text-[#17396B]">
                      {selectedFile
                        ? "Foto berhasil diambil dari kamera"
                        : "Ambil foto langsung di lokasi"}
                    </span>

                    <span className="mt-1 text-[10px] text-[#7185A5]">
                      Unggah dari galeri maupun file perangkat dinonaktifkan.
                    </span>

                    <button
                      type="button"
                      onClick={startCamera}
                      className="mt-3 rounded-lg bg-[#2475E5] px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-[#155FC5]"
                    >
                      {selectedFile ? "Foto Ulang" : "Buka Kamera"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 2. LOKASI GPS TERKUNCI DI KELURAHAN KELAPA TIGA */}
            <div>
              <label
                htmlFor="lokasi"
                className="mb-2 block text-[14px] font-bold text-[#17396B]"
              >
2. Lokasi GPS (Khusus Kelurahan Kelapa Tiga){" "}
                <span className="text-red-500">*</span>
              </label>

              <div
                className={`mb-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                  isLocationValid
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                {isLocationValid ? "✅ " : "📍 "}
                {locationStatusMsg}
              </div>

              <input
                id="lokasi"
                type="text"
                value={lokasi}
                readOnly
                placeholder="Alamat otomatis terisi sesuai titik GPS Anda..."
                className="w-full rounded-lg border border-[#C9DDFB] bg-[#F8FBFF] px-3 py-3 text-xs text-[#17396B] outline-none"
              />

              {/* CONTAINER PETA LEAFLET */}
              <div
                ref={mapContainerRef}
                className="relative z-0 mt-2 h-60 w-full overflow-hidden rounded-xl border border-[#C9DDFB] bg-[#E5F0FF]"
              />

              {/* INPUT PATOKAN / NAMA GANG SPESIFIK */}
              <input
                type="text"
                value={patokan}
                onChange={(e) => setPatokan(e.target.value)}
                placeholder="Detail nama gang / patokan (opsional), misal: Masuk Gang Pisang Kepok 1 RT 03"
                className="mt-2.5 w-full rounded-lg border border-[#C9DDFB] px-3 py-2.5 text-xs text-[#17396B] outline-none transition placeholder:text-gray-400 focus:border-[#2475E5] focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-[10px] text-[#7185A5]">
                Garis biru putus-putus menandai batas wilayah Kelurahan Kelapa
                Tiga. Pin dapat digeser tipis maksimal 100 m dari posisi GPS Anda.
              </p>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => detectLocation(false)}
                  disabled={isLocating}
                  className="rounded-lg bg-[#E4F0FF] px-3 py-2 text-[10px] font-semibold text-[#1766CE] transition hover:bg-[#D5E7FF] disabled:opacity-60"
                >
                  {isLocating
                    ? "Mendeteksi lokasi GPS..."
                    : "Perbarui titik GPS saya"}
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
                  Lengkapi poin 1–4 dengan foto kamera langsung dan posisi GPS
                  di dalam Kelurahan Kelapa Tiga agar laporan dapat dikirim.
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
              "Wajib mengambil foto langsung menggunakan kamera di lokasi (dilarang unggah galeri, foto AI, atau rekayasa).",
              "Layanan pelaporan hanya berlaku di dalam wilayah GPS Kelurahan Kelapa Tiga, Bandar Lampung.",
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