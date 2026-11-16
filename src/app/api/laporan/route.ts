import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ambilJulukanAcak } from '../../../lib/julukan';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

// POST: Mengunggah foto ke Supabase Storage & menyimpan laporan ke tabel laporan
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const foto = formData.get('foto') as File | null;
    const lokasi = formData.get('lokasi') as string | null;
    const jenis_sampah = formData.get('jenis_sampah') as string | null;
    const deskripsi = formData.get('deskripsi') as string | null;
    const latitude = formData.get('latitude') as string | null;
    const longitude = formData.get('longitude') as string | null;

    if (!foto || !lokasi || !jenis_sampah) {
      return NextResponse.json(
        { error: 'Foto, lokasi, dan jenis sampah wajib diisi.' },
        { status: 400 }
      );
    }

    if (!['image/jpeg', 'image/png'].includes(foto.type)) {
      return NextResponse.json(
        { error: 'Format foto harus JPG atau PNG.' },
        { status: 400 }
      );
    }

    if (foto.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran foto maksimal 5 MB.' },
        { status: 400 }
      );
    }

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
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          jenis_sampah,
          deskripsi: deskripsi?.trim() || '-',
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

    return NextResponse.json(
      {
        message: 'Laporan berhasil dikirim!',
        data: { ...laporanBaru, id: String(laporanBaru.id) },
      },
      { status: 201 }
    );
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