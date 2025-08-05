import { API_URL } from "./config";

export async function uploadProfilePicture(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/pictures/profile-picture`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error uploading profile picture");
  }

  const data = await response.json();
  return data.url;
}

export async function uploadPicture(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file); // Importante: el nombre debe ser "file"

  const response = await fetch(`${API_URL}/pictures/`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error uploading picture");
  }

  const data = await response.json();
  return data.url;
}

export async function deletePicture(pictureUrl: string): Promise<void> {
  // Extraer el nombre del archivo de la URL
  const filename = pictureUrl.split('/').pop();
  
  const response = await fetch(`${API_URL}/pictures/${filename}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error deleting picture");
  }
}
