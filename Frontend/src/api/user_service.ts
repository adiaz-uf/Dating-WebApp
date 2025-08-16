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

export async function setViewedProfile(data: {
  viewed_id: string;
}) {
    const response = await fetch(`${API_URL}/users/profile-viewed`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Creating or updateing Profile-View failed");
  }

  return response.json();
}

export async function setLikedProfile(data: {
  liked_id: string;
}) {
    const response = await fetch(`${API_URL}/users/profile-liked`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Creating or updateing Profile-like failed");
  }

  return response.json();
}

export async function setDislikedProfile(data: {
  disliked_id: string;
}) {
  const response = await fetch(`${API_URL}/users/profile-disliked`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Disliking profile failed");
  }
  return response.json();
}

export async function setNotDislikedProfile(data: {
  disliked_id: string;
}): Promise<any> {
  const response = await fetch(`${API_URL}/users/profile-not-disliked`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Removing dislike failed");
  }
  return response.json();
}

export async function setNotLikedProfile(data: {
  liked_id: string;
}) {
  const response = await fetch(`${API_URL}/users/profile-not-liked`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Removing like failed");
  }
  return response.json();
}

export async function setUserBlocked(data: {
  blocked_id: string;
}) {
  const response = await fetch(`${API_URL}/users/block`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Block user failed");
  }
  return response.json();
}