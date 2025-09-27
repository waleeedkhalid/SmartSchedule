export async function jsonFetcher<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${input}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
