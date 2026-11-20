export default function AdminHeader() {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-[#173663] sm:text-2xl">
          Kelola Laporan
        </h1>
        <p className="mt-1.5 text-xs leading-relaxed text-[#647A9B] sm:mt-2 sm:text-sm">
          Ubah status laporan warga di sini. Pilih Menunggu, Diproses,
          atau Selesai pada tiap laporan.
        </p>
      </div>

      <div className="flex w-fit shrink-0 items-center gap-3 rounded-xl bg-white px-3.5 py-2 shadow-sm sm:px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DCEAFF] text-sm font-bold text-[#1556B8] sm:h-10 sm:w-10 sm:text-base">
          U
        </div>
        <div>
          <p className="text-xs font-semibold text-[#173663] sm:text-sm">
            User
          </p>
          <p className="text-[11px] text-[#8192AA] sm:text-xs">
            Administrator
          </p>
        </div>
      </div>
    </header>
  );
}