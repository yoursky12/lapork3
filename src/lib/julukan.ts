export const daftarJulukan = [
  "Pahlawan Parit",
  "Penjaga Bumi",
  "Sahabat Lingkungan",
  "Pejuang Kebersihan",
  "Pelindung Alam",
  "Ksatria Hijau",
  "Penyelamat Lingkungan",
  "Penjaga Kebersihan",
  "Pahlawan Sampah",
  "Garda Lingkungan",
];

export function ambilJulukanAcak() {
  const index = Math.floor(Math.random() * daftarJulukan.length);

  return daftarJulukan[index];
}