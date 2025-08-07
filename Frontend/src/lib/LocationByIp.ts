import { updateUserLocation } from "../api/profile_service";

export async function getApproxLocationByIP() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) throw new Error("Failed to fetch IP location");

    const data = await response.json();
    const { latitude, longitude, city, region, country_name } = data;

    await updateUserLocation(latitude, longitude);

    console.log("Approximate location by IP:", {
      latitude,
      longitude,
      city,
      region,
      country_name,
    });
  } catch (error) {
    console.error("Error getting IP-based location:", error);
  }
}