
const statistics = [
  {
    value: "27",
    label: "Jumlah RT",
  },
  {
    value: "2",
    label: "Jumlah Lingkungan",
  },
  {
    value: "± 9.460 jiwa",
    label: "Jumlah penduduk",
  },
  {
    value: "1,19 km²",
    label: "Luas wilayah",
  },
];

export default function AboutSection() {
  return (
    <section
      id="tentang"
      className="bg-[#F3F7FF] px-6 py-20 md:px-12 md:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">

        {/* Bagian Kiri: Tentang Kelurahan */}
        <div>
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-blue-600">
            TENTANG KAMI
          </p>

          <h2 className="mb-3 text-4xl font-extrabold text-[#173765] md:text-4xl">
            Kelurahan Kelapa Tiga
          </h2>

          <p className="mb-5 text-[16px] leading-relaxed text-[#496487]">
            Kelurahan Kelapa Tiga adalah rumah bersama bagi seluruh
            warganya. Kebersihan lingkungan menjadi tanggung jawab
            kita semua, dan situs ini hadir agar setiap warga bisa
            ikut menjaga lingkungan dengan melaporkan titik sampah
            yang mengganggu.
          </p>

          <p className="text-[16px] leading-relaxed text-[#496487]">
            Setiap laporan akan dikumpulkan, dipantau, dan
            ditindaklanjuti oleh pihak kelurahan bersama warga.
          </p>
        </div>

        {/* Bagian Kanan: Statistik */}
        <div className="grid grid-cols-2 gap-4">
          {statistics.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white p-6 shadow-[0_8px_25px_rgba(30,70,130,0.08)] transition hover:-translate-y-1"
            >
              <h3 className="mb-1 text-3xl font-bold text-blue-600">
                {item.value}
              </h3>

              <p className="text-xs text-[#647B9B]">
                {item.label}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
