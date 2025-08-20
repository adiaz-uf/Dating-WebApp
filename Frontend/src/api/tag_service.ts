import { API_URL } from "./config";

export async function replaceAllTags(tags: string[]) {
  const response = await fetch(`${API_URL}/tag/replace`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tags })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Replacing tags failed");
  }
  return response.json();
}

export async function addTag(data: {
  value: string;
  index: string;
}) {
    const response = await fetch(`${API_URL}/tag/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Creating tag failed");
  }

  return response.json();
}

export async function suggestTags(query: string): Promise<string[]> {
  const url = `${API_URL}/tag/suggest?query=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return data.tags || [];
}
