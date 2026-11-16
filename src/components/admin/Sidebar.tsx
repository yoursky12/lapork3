
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="flex min-h-screen w-[185px] shrink-0 flex-col bg-gradient-to-b from-[#1556B8] to-[#2876D9] px-3 py-5 text-white max-md:w-[75px] max-md:px-2">
      {/* Logo */}
      <div className="mb-7 flex items-center gap-2 px-2">
        <span className="text-3xl">➤</span>

        <div className="max-md:hidden">
          <h1 className="text-sm font-bold">Lapor Sampah</h1>
          <p className="text-[8px] tracking-widest">
            PANEL ADMIN
          </p>
        </div>
      </div>

      {/* Menu */}
      
      <nav className="space-y-2">
        <Link
          href="/admin/dashboard"
          className="block rounded-xl bg-white px-3 py-3 text-xs font-semibold text-blue-700"
        >
          <span className="max-[650px]:hidden">Kelola Data</span>
          <span className="hidden max-[650px]:inline">☷</span>
        </Link>

        <Link
          href="/admin"
          className="block rounded-xl px-3 py-3 text-xs font-medium text-white transition hover:bg-white/15"
        >
          <span className="max-[650px]:hidden">Logout</span>
          <span className="hidden max-[650px]:inline">↪</span>
        </Link>
      </nav>
    </aside>
  );
}
