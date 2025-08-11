import { useEffect } from "react";
import { pingActivity } from "../api/profile_service";


export function isOnline(lastActive: string | Date, thresholdSeconds = 60) {
  const lastActiveDate = new Date(lastActive);
  const now = new Date();
	
  const diffSeconds = (now.getTime() - lastActiveDate.getTime()) / 1000;

  return diffSeconds <= thresholdSeconds;
}


export default function ActivityUpdater() {
  useEffect(() => {
    const updateActivity = async () => {
      try {
        await pingActivity();
      } catch (err) {
        console.error("Error en ping:", err);
      }
    };

    // Ping inicial
    updateActivity();

    // Repetir cada 30 segundos
    const interval = setInterval(updateActivity, 30000);

    return () => clearInterval(interval);
  }, []);

  return null; // No renderiza nada
}
