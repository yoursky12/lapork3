
export default function AdminHeader() {
  return (
    <header className="mb-8 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[#173663]">
          Kelola Laporan
        </h1>
        <p className="mt-2 text-sm text-[#647A9B]">
          Ubah status laporan warga di sini. Pilih Menunggu, Diproses,
          atau Selesai pada tiap laporan.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3 rounded-xl bg-white px-4 py-2 shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCEAFF] font-bold text-[#1556B8]">
          U
        </div>
        <div>
          <p className="text-sm font-semibold text-[#173663]">User</p>
          <p className="text-xs text-[#8192AA]">Administrator</p>
        </div>
      </div>
    </header>
  );
}
