import { updateUserLocation } from "../api/profile_service";

export async function getApproxLocationByIP() {
  try {    
    
    const response = await fetch("https://ipapi.co/json/");
      
    const data = await response.json();
    const { latitude, longitude } = data;
    console.log("getApproxLocationByIP: ", latitude, longitude);
    
    await updateUserLocation(latitude, longitude);
    sessionStorage.setItem("ipLocationTried", "located");
  } catch (error) {
    await updateUserLocation(40.515015, -3.663826);
    sessionStorage.setItem("ipLocationTried", "located");
  }
}