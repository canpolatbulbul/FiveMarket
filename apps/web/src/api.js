export async function pingApi() {
  const res = await fetch(import.meta.env.VITE_API_URL + "/health");
  return res.text();
}
