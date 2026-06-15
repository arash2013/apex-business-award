const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";
const API_KEY = process.env.ADMIN_API_KEY ?? "";

export async function adminFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND}/api/v1/admin${path}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Admin API error: ${res.status} ${path}`);
  return res.json() as Promise<T>;
}
