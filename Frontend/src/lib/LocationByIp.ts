import { updateUserLocation } from "../api/profile_service";

export async function getApproxLocationByIP() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) throw new Error("Failed to fetch IP location");

    const data = await response.json();
    const { latitude, longitude } = data;
    console.log("getApproxLocationByIP: ", latitude, longitude);
    
    await updateUserLocation(latitude, longitude);

  } catch (error) {
    console.error("Error getting IP-based location:", error);
  }
}