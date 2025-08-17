import { API_URL } from "./config";

export async function fetchUserProfile(userId?: string) {
  const url = userId ? `${API_URL}/profile/${userId}` : `${API_URL}/profile`;
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Fetching profile failed");
  }

  return response.json();
}

export async function updateUserProfile(data: {
  bio?: string;
  tags?: string[];
  images?: string[];
  first_name?: string;
  last_name?: string;
  email?: string;
  gender?: string;
  birth_date?: string;
  sexual_orientation?: string;
  completed_profile?: boolean;
}) {
  const response = await fetch(`${API_URL}/profile/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Updating profile failed");
  }

  return response.json();
}

export async function updateUserLocation(latitude: number, longitude: number) {
  await fetch(`${API_URL}/profile/location`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude, longitude }),
  });
}

// ping online state
export async function pingActivity() {
    const response = await fetch(`${API_URL}/profile/ping`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Ping activity failed");
    }

    return response.json();
}

export async function fetchUserRecievedLikes() {
  const url =`${API_URL}/profile/likes`;
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Fetching profile likes failed");
  }

  return response.json();
}

export async function fetchUserRecievedViews() {
  const url =`${API_URL}/profile/views`;
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Fetching profile views failed");
  }

  return response.json();
}

export async function isLikedByUser(user_id: any) {
  const url =`${API_URL}/profile/liked-by/${user_id}`;
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Fetching is user liked by failed");
  }

  return response.json();
}

export async function gotChatInCommon(user_id: any) {
  const url =`${API_URL}/profile/chat-with/${user_id}`;
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Fetching users got chat in common failed");
  }

  return response.json();
}