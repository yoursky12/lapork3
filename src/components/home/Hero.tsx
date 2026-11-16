
import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="beranda"
      className="px-6 pb-24 pt-6 text-white md:px-12 md:pb-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">

        {/* Bagian Kiri */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            BERSIHKAN
          </h1>

          <h2 className="mt-2 text-2xl font-bold md:text-3xl">
            Kepala Tiga Bersama
          </h2>

          <p className="mt-4 font-serif text-xl italic">
            Lihat. Lapor. Lestari.
          </p>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/90">
            Temukan tumpukan sampah di sekitarmu? Laporkan
            dalam hitungan menit. Cepat, mudah, dan
            identitasmu tetap anonim.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/pelaporan"
              className="rounded-xl bg-white px-6 py-3 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
            >
              Lapor Sampah →
            </Link>

            <a
              href="#data-laporan"
              className="rounded-xl border border-white px-6 py-3 text-xs font-bold text-white transition hover:bg-white/15"
            >
              Lihat Data Laporan
            </a>
          </div>
        </div>

        {/* Bagian Kanan: Ilustrasi */}
        <div className="flex justify-center">
          <svg
            viewBox="0 0 460 300"
            className="w-full max-w-[440px]"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Garis lengkung putus-putus */}
            <path
              d="M100 100 Q155 10 220 75"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="5 6"
            />

            {/* Gunung sampah bagian kiri */}
            <path d="M20 250 L100 145 L180 250 Z" fill="#C6DDF8" />
            <path d="M100 145 L125 250 L20 250 Z" fill="#E6F1FF" />

            {/* Gunung bagian tengah */}
            <path d="M150 250 L235 105 L315 250 Z" fill="#D4E6FC" />
            <path d="M235 105 L215 250 L150 250 Z" fill="#FFFFFF" />

            {/* Gunung bagian kanan */}
            <path d="M270 250 L360 175 L440 100 L440 250 Z" fill="#FFFFFF" />
            <path d="M360 175 L330 250 L270 250 Z" fill="#C6DDF8" />

            {/* Tempat sampah */}
            <rect x="190" y="145" width="46" height="62" rx="7" fill="#1765D1" />
            <rect x="185" y="140" width="56" height="10" rx="5" fill="#064CB5" />
            <path
              d="M207 170 L213 159 L219 170 M202 188 L209 194 L221 181"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Pesawat kertas */}
            <path
              d="M300 85 L415 25 L370 135 L350 95 Z"
              fill="#FFFFFF"
            />
            <path
              d="M350 95 L415 25 L370 135 Z"
              fill="#D6E8FF"
            />
          </svg>
        </div>

      </div>
    </section>
  );
}
