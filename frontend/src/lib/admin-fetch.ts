import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";
const API_KEY = process.env.ADMIN_API_KEY ?? "";

async function getToken(): Promise<string> {
  // Prefer the user's session cookie; fall back to the server-side API key.
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value ?? API_KEY;
}

export async function adminFetch<T>(path: string): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BACKEND}/api/v1/admin${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Admin API error: ${res.status} ${path}`);
  return res.json() as Promise<T>;
}
