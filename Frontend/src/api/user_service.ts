import { API_URL } from "./config";

export async function fetchSuggestedUsers() {
  const url = `${API_URL}/users/`;
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Fetching users failed");
  }

  return response.json(); // returns { success: true, users: [...] }
}