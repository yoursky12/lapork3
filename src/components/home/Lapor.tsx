
const steps = [
  {
    number: "1",
    title: "Foto Lokasi",
    description:
      "Ambil foto tumpukan sampah yang terlihat jelas.",
  },
  {
    number: "2",
    title: "Isi Lokasi & Deskripsi",
    description:
      "Tandai titik lokasi dan tulis keterangan singkat.",
  },
  {
    number: "3",
    title: "Dapat Julukan",
    description:
      "Kirim laporan anonim, terima julukan dan edukasi sampah.",
  },
];

export default function HowToReport() {
  return (
    <section className="bg-[#F3F7FF] px-6 pb-20 pt-4 md:px-12">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white px-6 py-8 shadow-[0_5px_20px_rgba(30,70,130,0.07)] md:px-12 md:py-10">

        <h2 className="mb-8 text-center text-xl font-extrabold text-blue-600 md:text-2xl">
          CARA MELAPOR
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                {step.number}
              </div>

              <h3 className="mb-2 text-sm font-bold text-[#173765]">
                {step.title}
              </h3>

              <p className="max-w-xs text-xs leading-relaxed text-[#647B9B]">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
