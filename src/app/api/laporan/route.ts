import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ambilJulukanAcak } from '../../../lib/julukan';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// SAKLAR SEMENTARA: Ubah menjadi false sebelum tautan dibagikan ke warga!
const MODE_UJI_COBA = true;

// Poligon batas koordinat wilayah Kelurahan Kelapa Tiga, Kec. Tanjung Karang Pusat, Bandar Lampung
const KELAPA_TIGA_POLYGON: [number, number][] = [
  [-5.4062, 105.2368], // Puncak barat laut (tikungan Jl. Sisingamangaraja)
  [-5.4082, 105.2412], // Lekukan tengah Jl. Sisingamangaraja
  [-5.4086, 105.2465], // Sekitar Pasar Tamin
  [-5.4088, 105.2558], // Ujung timur laut (Jl. Kartini / dekat Chandra Mall)
  [-5.4120, 105.2552], // Ujung tenggara (Simpur Center / Jl. H. Agus Salim)
  [-5.4118, 105.2342], // Batas selatan lurus mengikuti Jl. H. Agus Salim
  [-5.4076, 105.2345], // Sisi barat kembali ke arah Jl. Sisingamangaraja
];

// Jeda minimal antar laporan dari browser yang sama (10 menit)
const COOLDOWN_PENGIRIM_MENIT = 10;
// Jeda minimal untuk titik koordinat sampah yang sama (30 menit)
const COOLDOWN_LOKASI_MENIT = 30;

function isWithinKelapaTiga(lat: number, lng: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (MODE_UJI_COBA) return true;

  let inside = false;
  for (
    let i = 0, j = KELAPA_TIGA_POLYGON.length - 1;
    i < KELAPA_TIGA_POLYGON.length;
    j = i++
  ) {
    const [latI, lngI] = KELAPA_TIGA_POLYGON[i];
    const [latJ, lngJ] = KELAPA_TIGA_POLYGON[j];

    const intersect =
      lngI > lng !== lngJ > lng &&
      lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI) + latI;

    if (intersect) inside = !inside;
  }
  return inside;
}

function bacaCookieCooldown(request: Request): number | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('lapor_cooldown='));

  if (!match) return null;
  const timestamp = Number(match.split('=')[1]);
  return Number.isFinite(timestamp) ? timestamp : null;
}

// GET: Mengambil semua data laporan dari Supabase
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('laporan')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Gagal mengambil data laporan.', data: [] },
        { status: 500 }
      );
    }

    const dataDenganStatus = (data || []).map((item) => ({
      ...item,
      id: String(item.id),
      status: item.status || 'Menunggu',
      catatan_petugas: item.catatan_petugas || '',
    }));

    return NextResponse.json({ data: dataDenganStatus }, { status: 200 });
  } catch {
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}

// POST: Validasi anti-spam & wilayah -> unggah foto -> simpan laporan
export async function POST(request: Request) {
  try {
    // 1. Pengunci Cookie Browser (10 menit) - dilewati saat MODE_UJI_COBA aktif
    if (!MODE_UJI_COBA) {
      const lastCookieTs = bacaCookieCooldown(request);
      const cooldownMs = COOLDOWN_PENGIRIM_MENIT * 60 * 1000;

      if (lastCookieTs && Date.now() - lastCookieTs < cooldownMs) {
        const sisaMenit = Math.max(
          1,
          Math.ceil((cooldownMs - (Date.now() - lastCookieTs)) / 60000)
        );
        return NextResponse.json(
          {
            error: `Kamu baru saja mengirim laporan. Tunggu sekitar ${sisaMenit} menit lagi sebelum mengirim laporan berikutnya.`,
          },
          { status: 429 }
        );
      }
    }

    const formData = await request.formData();
    const foto = formData.get('foto') as File | null;
    const lokasi = formData.get('lokasi') as string | null;
    const jenis_sampah = formData.get('jenis_sampah') as string | null;
    const deskripsi = formData.get('deskripsi') as string | null;
    const latitude = formData.get('latitude') as string | null;
    const longitude = formData.get('longitude') as string | null;

    if (!foto || !lokasi?.trim() || !jenis_sampah?.trim() || !deskripsi?.trim()) {
      return NextResponse.json(
        { error: 'Foto, lokasi, jenis sampah, dan deskripsi wajib diisi.' },
        { status: 400 }
      );
    }

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Titik koordinat GPS wajib disertakan.' },
        { status: 400 }
      );
    }

    const latNum = Number(latitude);
    const lngNum = Number(longitude);

    if (!isWithinKelapaTiga(latNum, lngNum)) {
      return NextResponse.json(
        {
          error:
            'Pelaporan ditolak: titik koordinat GPS berada di luar wilayah Kelurahan Kelapa Tiga, Bandar Lampung.',
        },
        { status: 403 }
      );
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(foto.type)) {
      return NextResponse.json(
        { error: 'Format foto harus JPG, PNG, atau WEBP.' },
        { status: 400 }
      );
    }

    if (foto.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran foto maksimal 5 MB.' },
        { status: 400 }
      );
    }

    // 2. Filter Titik Lokasi Ganda (radius ±25 meter dalam 30 menit terakhir)
    if (!MODE_UJI_COBA) {
      const batasWaktuLokasi = new Date(
        Date.now() - COOLDOWN_LOKASI_MENIT * 60 * 1000
      ).toISOString();
      const radiusDerajat = 0.00025;

      const { data: laporanSekitar } = await supabase
        .from('laporan')
        .select('id')
        .gte('created_at', batasWaktuLokasi)
        .gte('latitude', latNum - radiusDerajat)
        .lte('latitude', latNum + radiusDerajat)
        .gte('longitude', lngNum - radiusDerajat)
        .lte('longitude', lngNum + radiusDerajat)
        .limit(1);

      if (laporanSekitar && laporanSekitar.length > 0) {
        return NextResponse.json(
          {
            error:
              'Titik lokasi sampah ini baru saja dilaporkan dalam 30 menit terakhir. Tidak perlu mengirim laporan ganda.',
          },
          { status: 429 }
        );
      }
    }

    // 3. Lolos semua pengecekan -> baru unggah foto ke Supabase Storage
    const bytes = await foto.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = foto.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('foto-laporan')
      .upload(fileName, buffer, {
        contentType: foto.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: 'Gagal mengunggah foto ke penyimpanan.' },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from('foto-laporan')
      .getPublicUrl(fileName);

    const { data: laporanBaru, error: insertError } = await supabase
      .from('laporan')
      .insert([
        {
          foto_url: publicUrlData.publicUrl,
          lokasi: lokasi.trim(),
          latitude: latNum,
          longitude: lngNum,
          jenis_sampah: jenis_sampah.trim(),
          deskripsi: deskripsi.trim(),
          julukan: ambilJulukanAcak(),
          status: 'Menunggu',
          catatan_petugas: '',
        },
      ])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Gagal menyimpan data laporan.' },
        { status: 500 }
      );
    }

    const response = NextResponse.json(
      {
        message: 'Laporan berhasil dikirim!',
        data: { ...laporanBaru, id: String(laporanBaru.id) },
      },
      { status: 201 }
    );

    // Pasang cookie cooldown hanya saat MODE_UJI_COBA = false
    if (!MODE_UJI_COBA) {
      response.cookies.set('lapor_cooldown', String(Date.now()), {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: COOLDOWN_PENGIRIM_MENIT * 60,
        path: '/',
      });
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses laporan.' },
      { status: 500 }
    );
  }
}

// PUT: Memperbarui status dan catatan petugas di Supabase
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, catatan_petugas } = body;

    const daftarStatus = ['Menunggu', 'Diproses', 'Selesai'];

    if (!id || !daftarStatus.includes(status)) {
      return NextResponse.json(
        { message: 'Data perubahan tidak valid.' },
        { status: 400 }
      );
    }

    const { data: laporanUpdate, error } = await supabase
      .from('laporan')
      .update({
        status,
        catatan_petugas: catatan_petugas || '',
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !laporanUpdate) {
      return NextResponse.json(
        { message: 'Laporan tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Perubahan laporan berhasil disimpan.',
      data: { ...laporanUpdate, id: String(laporanUpdate.id) },
    });
  } catch {
    return NextResponse.json(
      { message: 'Gagal menyimpan perubahan laporan.' },
      { status: 500 }
    );
  }
}