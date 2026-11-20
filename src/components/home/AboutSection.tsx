
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

const masalah = [
  {
    icon: "/air.svg",
    judul: "Drainase dan Genangan Air",
    deskripsi:
      "Ada titik rawan banjir dan genangan, misalnya di Jl. Agus Salim, Gang Raya Muda. Saat hujan, air di sana dilaporkan tergenang hingga 30 cm.",
    label: "Genangan hingga 30 cm",
  },
  {
    icon: "/jalan.svg",
    judul: "Infrastruktur Lingkungan",
    deskripsi:
      "Fasilitas pengelolaan sampah masih terbatas, dan jalan lingkungan perlu diperbaiki, seperti paving block dan gorong-gorong.",
    label: "Sampah, jalan, gorong-gorong",
  },
  {
    icon: "bangunan.svg",
    judul: "Kepadatan Bangunan",
    deskripsi:
      "Jarak antar bangunan di beberapa RT terlalu rapat. Akibatnya ruang terbuka hijau dan sirkulasi udara berkurang.",
    label: "Ruang hijau berkurang",
  },
];

const program = [
  {
    icon: "/program1.svg",
    nomor: "PROGRAM 1",
    judul: "KOTAKU (Kota Tanpa Kumuh)",
    deskripsi:
      "Kelurahan Kelapa Tiga menerima manfaat program KOTAKU untuk memperbaiki infrastruktur dasar, seperti drainase dan jalan lingkungan.",
  },
  {
    icon: "/program2.svg",
    nomor: "PROGRAM 2",
    judul: "Bantuan Swadaya Mahan Sejahtera (BSMS)",
    deskripsi:
      "Wakil Gubernur Lampung meninjau langsung Kelapa Tiga untuk mempercepat perbaikan rumah tidak layak huni lewat bantuan swadaya masyarakat.",
  },
  {
    icon: "/program3.svg",
    nomor: "PROGRAM 3",
    judul: "Musrenbang Kelurahan",
    deskripsi:
      "Prioritas pembangunan, seperti perbaikan gang dan drainase, rutin dibahas di Musrenbang tingkat kelurahan untuk diusulkan ke anggaran kota.",
  },
];

export default function AboutSection() {
  return (
    <section
      id="tentang"
      className="bg-[#F3F7FF] px-6 py-16 md:px-12 md:py-20"
    >
      <div className="mx-auto max-w-6xl">

        {/* Tentang Kami dan Statistik */}
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <p className="mb-2 text-[10px] font-bold tracking-[0.2em] text-blue-600">
              TENTANG KAMI
            </p>

            <h2 className="mb-3 text-3xl font-extrabold text-[#173765] md:text-4xl">
              Kelurahan Kelapa Tiga
            </h2>

            <p className="mb-4 text-sm leading-relaxed text-[#496487]">
              Kelurahan Kelapa Tiga berada di Kecamatan Tanjung Karang
              Pusat, Kota Bandar Lampung. Wilayah ini termasuk yang
              paling padat penduduknya di kecamatan, sehingga menjaga
              kebersihan lingkungan adalah tanggung jawab kita bersama.
            </p>

            <p className="text-sm leading-relaxed text-[#496487]">
              Situs ini hadir agar warga bisa ikut merawat lingkungan
              dengan melaporkan titik sampah, dan agar laporan itu bisa
              dipantau dan ditindaklanjuti oleh pihak kelurahan.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {statistics.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl bg-white p-5 shadow-[0_6px_20px_rgba(30,70,130,0.08)] transition hover:-translate-y-1"
              >
                <h3 className="mb-1 text-2xl font-bold text-blue-600">
                  {item.value}
                </h3>

                <p className="text-[11px] text-[#647B9B]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Status Kawasan */}
        <div className="mt-12 grid gap-6 rounded-2xl bg-gradient-to-r from-[#1554B8] to-[#287DEB] p-6 text-white shadow-[0_12px_25px_rgba(30,90,180,0.22)] md:grid-cols-2 md:items-center md:p-8">
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg text-blue-600">
              <img
                src="/lokasi.svg"
                alt="Status kawasan"
                className="h-5 w-5 object-contain"
              />
            </div>

            <p className="mb-2 text-[10px] font-bold tracking-[0.2em] text-blue-100">
              STATUS KAWASAN
            </p>

            <h3 className="mb-3 text-[18px] font-extrabold leading-tight">
              Kawasan Perumahan dan Permukiman Kumuh
            </h3>

            <p className="text-[14px] leading-relaxed text-blue-50">
              Kelurahan Kelapa Tiga tercatat secara resmi sebagai salah
              satu lokasi perumahan dan permukiman kumuh di Kota Bandar
              Lampung. Wilayah ini masuk dalam SK Walikota tentang
              penetapan kawasan kumuh, di antaranya SK Nomor 165 Tahun
              2021 beserta pemutakhirannya.
            </p>
          </div>

          <div className="rounded-xl bg-white/20 p-5 md:p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg text-blue-600">
              <img
                src="/penduduk.svg"
                alt="Kepadatan Penduduk"
                className="h-5 w-5 object-contain"
              />
            </div>

            <p className="mb-2 text-[14px] font-bold tracking-[0.15em] text-blue-100">
              KEPADATAN PENDUDUK
            </p>

            <p className="text-[12px] leading-relaxed text-white">
              Salah satu kelurahan dengan jumlah penduduk dan kepadatan
              tertinggi di Kecamatan Tanjung Karang Pusat. Kondisi ini
              ikut menambah tekanan pada infrastruktur lingkungan.
            </p>
          </div>
        </div>

        {/* Masalah Utama */}
        <div className="mt-12">
          <p className="mb-1 text-[10px] font-bold tracking-[0.2em] text-blue-600">
            MASALAH UTAMA DI LAPANGAN
          </p>

          <h3 className="mb-2 text-[24px] font-extrabold text-[#173765]">
            Tiga masalah yang paling dominan
          </h3>

          <p className="mb-6 text-[14px] text-[#647B9B]">
            Berdasarkan observasi dan laporan pembangunan daerah.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {masalah.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl bg-white p-5 shadow-[0_6px_20px_rgba(30,70,130,0.08)] transition hover:-translate-y-1"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5F0FF] text-lg">
                  <img
                    src={item.icon}
                    alt={item.judul}
                    className="h-5 w-5 object-contain"
                  />
                </div>

                <h4 className="mb-2 text-[16px] font-bold text-[#173765]">
                  {item.judul}
                </h4>

                <p className="mb-4 text-[14px] leading-relaxed text-[#647B9B]">
                  {item.deskripsi}
                </p>

                <span className="inline-block rounded-full bg-[#E5F0FF] px-3 py-1 text-[12px] font-semibold text-blue-700">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Program Penanganan */}
        <div className="mt-12">
          <p className="mb-1 text-[10px] font-bold tracking-[0.2em] text-blue-600">
            PROGRAM PENANGANAN
          </p>

          <h3 className="mb-6 text-[24px] font-extrabold text-[#173765]">
            Upaya yang sudah dan sedang berjalan
          </h3>

          <div className="grid gap-4 md:grid-cols-3">
            {program.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border-t-[3px] border-blue-500 bg-white p-5 shadow-[0_6px_20px_rgba(30,70,130,0.08)] transition hover:-translate-y-1"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
                    <img
                    src={item.icon}
                    alt={item.judul}
                    className="h-5 w-5 object-contain"
                    />
                  </div>

                  <p className="text-[12px] font-bold tracking-wider text-[#647B9B]">
                    {item.nomor}
                  </p>
                </div>

                <h4 className="mb-2 text-[16px] font-bold leading-snug text-[#173765]">
                  {item.judul}
                </h4>

                <p className="text-[14px] leading-relaxed text-[#647B9B]">
                  {item.deskripsi}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
