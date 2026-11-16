import Link from "next/link";

export default function Footer() {
  return (
    <footer
      id="footer"
      className="bg-[#1551B8] px-6 py-8 text-white md:px-12"
    >
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
        {/* Informasi Kelurahan */}
        <div>
          <h2 className="mb-2 text-sm font-bold md:text-base">
            Lapor Sampah · Kelurahan Kelapa Tiga
          </h2>

          <p className="text-xs text-blue-100">
            Klp. Tiga, Kec. Tj. Karang Pusat, Kota Bandar Lampung, Lampung
          </p>
        </div>

        {/* Grup Tombol Aksi */}
        <div className="flex items-center gap-3">
          <Link
            href="/pelaporan"
            className="rounded-xl bg-white px-6 py-3 text-center text-xs font-bold text-blue-700 transition hover:bg-blue-100"
          >
            Lapor Sekarang
          </Link>

          <Link
            href="/admin"
            title="Login Admin"
            aria-label="Login Admin"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/40 bg-white/10 text-white transition hover:bg-white/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
}