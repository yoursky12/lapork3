import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const validEmail = process.env.ADMIN_EMAIL;
    const validPassword = process.env.ADMIN_PASSWORD;
    const sessionToken =
      process.env.ADMIN_SESSION_TOKEN || "lapork3_admin_verified_2026";

    if (!validEmail || !validPassword) {
      return NextResponse.json(
        { error: "Akun admin belum diatur di server." },
        { status: 500 }
      );
    }

    if (
      email?.trim().toLowerCase() !== validEmail.trim().toLowerCase() ||
      password !== validPassword
    ) {
      return NextResponse.json(
        { error: "Email atau kata sandi salah. Akses ditolak." },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      { message: "Login berhasil" },
      { status: 200 }
    );

    response.cookies.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // Sesi aktif 8 jam
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses login." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json(
    { message: "Logout berhasil" },
    { status: 200 }
  );
  response.cookies.delete("admin_session");
  return response;
}