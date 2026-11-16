import Image from "next/image";

const features = [
  {
    icon: "/foto.svg",
    title: "Foto & Lokasi",
    description:
      "Sertakan foto dan lokasi agar permasalahan sampah lebih mudah dikenali.",
  },
  {
    icon: "/lapor.svg",
    title: "Laporan Anonim",
    description:
      "Sampaikan laporan tanpa harus menampilkan identitas pribadi.",
  },
  {
    icon: "/data.svg",
    title: "Data Transparan",
    description:
      "Pantau informasi dan perkembangan laporan sampah secara terbuka.",
  },
  {
    icon: "/edukasi.svg",
    title: "Edukasi Sampah",
    description:
      "Dapatkan informasi sederhana untuk menjaga lingkungan tetap bersih.",
  },
];

export default function FeatureCards() {
  return (
    <section className="relative z-10 mx-auto -mt-8 grid max-w-7xl grid-cols-1 gap-5 px-6 sm:grid-cols-2 md:px-12 lg:grid-cols-4">
      {features.map((feature, index) => (
        <div
          key={index}
          className="rounded-2xl bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#E5F8F5]">
            <Image
              src={feature.icon}
              alt={feature.title}
              width={36}
              height={36}
              className="object-contain"
            />
          </div>

          <h3 className="mb-2 text-lg font-bold text-[#002853]">
            {feature.title}
          </h3>

          <p className="text-sm leading-relaxed text-gray-600">
            {feature.description}
          </p>
        </div>
      ))}
    </section>
  );
}
