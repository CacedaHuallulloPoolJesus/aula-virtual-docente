export async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string>),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function apiBlob(url: string, init?: RequestInit): Promise<Blob> {
  const res = await fetch(url, { ...init, credentials: "include" });
  if (!res.ok) throw new Error(await res.text());
  return res.blob();
}
