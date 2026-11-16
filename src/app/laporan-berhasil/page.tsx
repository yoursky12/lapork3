"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import Navbar from "../../components/Navbar";

export default function LaporanBerhasilPage() {
  const [julukan, setJulukan] = useState("Memuat julukan...");
  const [kodeLaporan, setKodeLaporan] = useState("LPK-001");
  const [edukasiUrl, setEdukasiUrl] = useState("https://lapork3.my.id/edukasi");
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEdukasiUrl(`${window.location.origin}/edukasi`);

    const dataLaporan = sessionStorage.getItem("laporanTerakhir");
    if (dataLaporan) {
      const laporan = JSON.parse(dataLaporan);
      setJulukan(laporan.julukan || "Pahlawan Lingkungan");
      if (laporan.id) {
        setKodeLaporan(`LPK-${String(laporan.id).slice(-4)}`);
      }
    } else {
      setJulukan("Data laporan tidak ditemukan");
    }
  }, []);

  const handleDownloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "QR-Edukasi-Sampah-LaporK3.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="min-h-screen bg-[#F2F7FF]">
      {/* NAVBAR */}
      <Navbar activePage="lapor" showCTA={false} />

      {/* BAGIAN ATAS */}
      <section className="bg-gradient-to-br from-[#1559BD] via-[#2879DC] to-[#70B4F8] px-6 pb-28 pt-12 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <span className="rounded-full bg-white/20 px-4 py-2 text-xs font-medium">
            ✓ Laporan Berhasil Dikirim
          </span>

          <h1 className="mt-6 text-3xl font-extrabold md:text-4xl">
            Terima Kasih Sudah Peduli!
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/90">
            Laporanmu telah berhasil dikirim secara anonim. Sebagai tanda
            terima kasih, kamu mendapatkan julukan khusus sebagai pahlawan
            lingkungan.
          </p>
        </div>
      </section>

      {/* KONTEN UTAMA */}
      <main className="mx-auto -mt-16 max-w-3xl px-5 pb-16">
        {/* KARTU JULUKAN */}
        <section className="flex flex-col items-center gap-5 rounded-3xl bg-white p-7 shadow-lg sm:flex-row sm:p-9">
          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl bg-[#E6F1FF]">
            <span className="text-7xl">🛡️</span>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-bold tracking-[2px] text-[#526B91]">
              JULUKAN KAMU
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-[#2879DC]">
              {julukan}
            </h2>

            <p className="mt-2 text-sm italic text-[#526B91]">
              Satu laporan kecil, satu langkah besar untuk lingkungan.
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <span className="rounded-full bg-[#E6F1FF] px-3 py-2 text-xs font-semibold text-[#1559BD]">
                Kode: {kodeLaporan}
              </span>

              <span className="rounded-full bg-[#DDF5E6] px-3 py-2 text-xs font-semibold text-[#187342]">
                Status: Menunggu
              </span>
            </div>
          </div>
        </section>

        {/* KARTU QR CODE */}
        <section className="mt-5 flex flex-col items-center gap-7 rounded-3xl bg-white p-7 shadow-lg sm:flex-row sm:p-9">
          <div
            ref={qrRef}
            className="flex h-44 w-44 shrink-0 items-center justify-center rounded-2xl border-2 border-[#2879DC] bg-white p-3"
          >
            <QRCodeCanvas
              value={edukasiUrl}
              size={148}
              bgColor="#FFFFFF"
              fgColor="#123A7A"
              level="M"
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-bold tracking-[2px] text-[#2879DC]">
              QR CODE EDUKASI
            </p>

            <h2 className="mt-3 text-xl font-extrabold text-[#173966]">
              Scan untuk belajar tentang sampah
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-[#526B91]">
              Scan QR Code ini untuk membuka halaman edukasi mengenai jenis
              sampah, cara memilah sampah, dan pentingnya menjaga kebersihan
              lingkungan.
            </p>

            <button
              type="button"
              onClick={handleDownloadQR}
              className="mt-5 rounded-xl bg-[#2879DC] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1559BD]"
            >
              Unduh QR Code
            </button>
          </div>
        </section>

        {/* TOMBOL NAVIGASI */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-xl bg-[#2879DC] px-7 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#1559BD]"
          >
            Kembali ke Beranda
          </Link>

          <Link
            href="/pelaporan"
            className="rounded-xl border-2 border-[#2879DC] px-7 py-3 text-center text-sm font-semibold text-[#2879DC] transition hover:bg-[#E6F1FF]"
          >
            Buat Laporan Lagi
          </Link>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#1553B5] px-6 py-7 text-center text-sm text-white">
        <p className="font-bold">Lapor Sampah Kelurahan Kelapa Tiga</p>
        <p className="mt-2 text-xs text-white/80">
          Bersama menjaga lingkungan agar tetap bersih dan sehat.
        </p>
      </footer>
    </div>
  );
}