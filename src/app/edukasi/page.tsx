import Link from "next/link";

export default function EdukasiSampahPage() {
  return (
    <div className="min-h-screen bg-[#F2F7FF] flex flex-col justify-between">
      <div>
        {/* HEADER BIRU GRADASI (PENUH DI HP & DESKTOP) */}
        <header className="w-full bg-gradient-to-br from-[#1559BD] via-[#2879DC] to-[#5CA4F5] text-white">
          <div className="mx-auto max-w-6xl px-6 pt-7 pb-9 md:py-12">
            {/* Logo & Nama Instansi */}
            <div className="flex items-center gap-2.5">
              <svg
                className="h-6 w-6 md:h-7 md:w-7 text-white shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
              <div>
                <p className="text-sm md:text-base font-extrabold leading-tight">
                  Lapor Sampah
                </p>
                <p className="text-[9px] md:text-[10px] font-semibold tracking-wider uppercase text-white/85">
                  KELURAHAN KEPALA TIGA
                </p>
              </div>
            </div>

            {/* Badge Hasil Scan QR */}
            <div className="mt-5 md:mt-6 inline-block rounded-full bg-white/20 px-3.5 py-1 text-[11px] md:text-xs font-medium text-white backdrop-blur-sm">
              Hasil scan QR
            </div>

            {/* Judul Halaman */}
            <h1 className="mt-2.5 text-2xl md:text-4xl font-extrabold tracking-tight">
              Edukasi Sampah
            </h1>
            <p className="mt-1.5 text-xs md:text-base italic text-white/90">
              Halo, Pahlawan Parit! Yuk kenali sampahmu.
            </p>
          </div>
        </header>

        {/* KONTEN UTAMA */}
        <main className="mx-auto max-w-6xl px-6 py-7 md:py-10 space-y-8 md:space-y-10">
          {/* BAGIAN 1: JENIS SAMPAH (1 KOLOM DI HP, 3 KOLOM SEJAJAR DI DESKTOP) */}
          <section>
            <h2 className="mb-3.5 text-[11px] md:text-xs font-extrabold tracking-wider uppercase text-[#2475E5]">
              JENIS SAMPAH
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
              {/* Kartu Sampah Organik */}
              <div className="flex flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-[0_4px_15px_rgba(30,90,160,0.06)] border-t-4 border-[#16A34A] p-4 md:p-6">
                <div>
                  <h3 className="text-sm md:text-base font-extrabold text-[#17396B]">
                    Sampah Organik
                  </h3>
                  <p className="mt-1.5 text-xs md:text-sm leading-relaxed text-[#526987]">
                    Sisa makanan, kulit buah, daun dan ranting. Mudah terurai
                    dan bisa dijadikan kompos.
                  </p>
                </div>
                <div className="mt-4 rounded-lg bg-[#F1F6FE] px-3 py-2.5 text-[11px] md:text-xs text-[#17396B]">
                  <strong className="font-bold">Tempat sampah:</strong> Hijau
                </div>
              </div>

              {/* Kartu Sampah Anorganik */}
              <div className="flex flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-[0_4px_15px_rgba(30,90,160,0.06)] border-t-4 border-[#2475E5] p-4 md:p-6">
                <div>
                  <h3 className="text-sm md:text-base font-extrabold text-[#17396B]">
                    Sampah Anorganik
                  </h3>
                  <p className="mt-1.5 text-xs md:text-sm leading-relaxed text-[#526987]">
                    Plastik, botol, kaleng, kertas, kaca. Sulit terurai, tetapi
                    banyak yang bisa didaur ulang.
                  </p>
                </div>
                <div className="mt-4 rounded-lg bg-[#F1F6FE] px-3 py-2.5 text-[11px] md:text-xs text-[#17396B]">
                  <strong className="font-bold">Tempat sampah:</strong> Kuning
                  atau biru
                </div>
              </div>

              {/* Kartu Sampah B3 */}
              <div className="flex flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-[0_4px_15px_rgba(30,90,160,0.06)] border-t-4 border-[#EA580C] p-4 md:p-6">
                <div>
                  <h3 className="text-sm md:text-base font-extrabold text-[#17396B]">
                    Sampah B3
                  </h3>
                  <p className="mt-1.5 text-xs md:text-sm leading-relaxed text-[#526987]">
                    Baterai, lampu, obat kedaluwarsa, pestisida. Berbahaya,
                    jangan dicampur dengan sampah lain.
                  </p>
                </div>
                <div className="mt-4 rounded-lg bg-[#F1F6FE] px-3 py-2.5 text-[11px] md:text-xs text-[#17396B]">
                  <strong className="font-bold">Tempat sampah:</strong> Merah,
                  serahkan ke petugas
                </div>
              </div>
            </div>
          </section>

          {/* BAGIAN 2 & 3: 3R DI KIRI, TAHUKAH KAMU & TOMBOL AKSI DI KANAN (SAAT DESKTOP) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
            {/* MULAI DARI 3R */}
            <section>
              <h2 className="mb-3.5 text-[11px] md:text-xs font-extrabold tracking-wider uppercase text-[#2475E5]">
                MULAI DARI 3R
              </h2>

              <div className="rounded-2xl bg-white p-4 md:p-6 shadow-[0_4px_15px_rgba(30,90,160,0.06)] space-y-4 md:space-y-5">
                {/* Reduce */}
                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-lg bg-[#2475E5] text-sm font-extrabold text-white">
                    R
                  </div>
                  <div>
                    <h3 className="text-xs md:text-sm font-extrabold text-[#17396B]">
                      Reduce
                    </h3>
                    <p className="mt-0.5 text-[11px] md:text-xs leading-relaxed text-[#526987]">
                      Kurangi sampah dari awal, misalnya bawa tas belanja dan
                      botol minum sendiri.
                    </p>
                  </div>
                </div>

                {/* Reuse */}
                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-lg bg-[#2475E5] text-sm font-extrabold text-white">
                    R
                  </div>
                  <div>
                    <h3 className="text-xs md:text-sm font-extrabold text-[#17396B]">
                      Reuse
                    </h3>
                    <p className="mt-0.5 text-[11px] md:text-xs leading-relaxed text-[#526987]">
                      Pakai ulang barang yang masih layak, seperti botol,
                      kardus, dan wadah makanan.
                    </p>
                  </div>
                </div>

                {/* Recycle */}
                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-lg bg-[#2475E5] text-sm font-extrabold text-white">
                    R
                  </div>
                  <div>
                    <h3 className="text-xs md:text-sm font-extrabold text-[#17396B]">
                      Recycle
                    </h3>
                    <p className="mt-0.5 text-[11px] md:text-xs leading-relaxed text-[#526987]">
                      Pilah sampah anorganik agar bisa diolah menjadi barang
                      baru.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* KOLOM KANAN: TAHUKAH KAMU + TOMBOL AKSI */}
            <div className="space-y-4 lg:mt-7">
              <section className="rounded-2xl bg-[#2475E5] p-5 md:p-6 text-white shadow-md shadow-blue-200">
                <p className="text-[10px] md:text-xs font-extrabold tracking-wider uppercase text-white/85">
                  TAHUKAH KAMU?
                </p>
                <p className="mt-2 text-xs md:text-sm leading-relaxed text-white">
                  Sisa makanan dan daun bisa diolah menjadi kompos, sehingga
                  sampah yang menumpuk di lingkungan jauh berkurang.
                </p>
              </section>

              <section className="space-y-2.5 pt-1">
                <Link
                  href="/pelaporan"
                  className="block w-full rounded-xl bg-[#2475E5] py-3.5 text-center text-xs md:text-sm font-bold text-white shadow-sm transition hover:bg-[#155FC5]"
                >
                  Lapor Sampah Lagi
                </Link>

                <Link
                  href="/"
                  className="block w-full rounded-xl border border-[#91BCFF] bg-white py-3.5 text-center text-xs md:text-sm font-bold text-[#2475E5] transition hover:bg-[#F3F8FF]"
                >
                  Ke Beranda
                </Link>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* FOOTER PENUH */}
      <footer className="w-full bg-[#1559BD] px-6 py-4 md:py-5 text-center text-[10px] md:text-xs text-white/90">
        Lapor Sampah · Kelurahan Kepala Tiga · [KONTAK KELURAHAN]
      </footer>
    </div>
  );
}