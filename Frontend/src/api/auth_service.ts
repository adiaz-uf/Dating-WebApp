import { API_URL } from "./config";

export async function registerUser(data: {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Registration failed");
  }

  return response.json();
}

export async function loginUser(data: {
  username: string;
  password: string;
}) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  // Después de login, obtener el perfil y guardar el userId en localStorage
  const result = await response.json();
  try {
    const profileResp = await fetch(`${API_URL}/profile`, { credentials: "include" });
    if (profileResp.ok) {
      const profile = await profileResp.json();
      if (profile && profile.id) {
        localStorage.setItem("userId", profile.id);
      }
    }
  } catch {}
  return result;
}

export async function requestResetPass(email: string) {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request reset failed");
  }

  return response.json();
}


export async function resetPass(data: {
  token: string;
  new_password: string;
}) {
  const response = await fetch(`${API_URL}/auth/reset-password-confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Reset Pass failed");
  }

  return response.json();
}


