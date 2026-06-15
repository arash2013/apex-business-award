import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";
const COOKIE = "admin_token";
const MAX_AGE = 60 * 60 * 8; // 8 hours

export async function POST(req: NextRequest) {
  const body = await req.json();

  const upstream = await fetch(`${BACKEND}/api/v1/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!upstream.ok) {
    const err = await upstream.json().catch(() => ({}));
    return NextResponse.json(
      { detail: (err as { detail?: string }).detail ?? "Invalid credentials" },
      { status: upstream.status }
    );
  }

  const data = (await upstream.json()) as { access_token: string; email: string; role: string };

  const res = NextResponse.json({ email: data.email, role: data.role });
  res.cookies.set(COOKIE, data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
  return res;
}
