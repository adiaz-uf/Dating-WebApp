import React, { useMemo } from "react";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { setViewedProfile } from "../../api/user_service";
import { Button } from "../../components/Button";
import type { UserProfile } from "../../features/profile/types";
import { useProfileContext } from "../../features/profile/ProfileContext";
import { calculateAge } from "../../lib/CalculateAge";
import { connectNotificationSocket, getNotificationSocket, onNotificationSocketRegistered } from "../../api/notifications_socket";

interface UserCardProps {
  user: UserProfile;
}

interface HandleViewProfile {
  (user: UserProfile): void;
}
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const toRad = (deg: number) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const p1 = toRad(lat1);
  const p2 = toRad(lat2);

  const a = Math.sin(dLat/2)**2 +
            Math.cos(p1) * Math.cos(p2) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const navigate = useNavigate();
  const age: number | null = calculateAge(user.birth_date);
  let loggedUser: UserProfile | null = null;
  try {
    loggedUser = useProfileContext().userProfile;
  } catch {
    loggedUser = null;
  }

  const distance = useMemo(() => {
    if (
      /* !user.city && TODO */
      loggedUser &&
      user.latitude != null && user.longitude != null &&
      loggedUser.latitude != null && loggedUser.longitude != null
    ) {
      const uLat = typeof user.latitude === 'string' ? parseFloat(user.latitude) : user.latitude;
      const uLon = typeof user.longitude === 'string' ? parseFloat(user.longitude) : user.longitude;
      const lLat = typeof loggedUser.latitude === 'string' ? parseFloat(loggedUser.latitude) : loggedUser.latitude;
      const lLon = typeof loggedUser.longitude === 'string' ? parseFloat(loggedUser.longitude) : loggedUser.longitude;
      if ([uLat, uLon, lLat, lLon].every(v => typeof v === 'number' && !isNaN(v))) {
        return haversine(lLat, lLon, uLat, uLon);
      }
    }
    return null;
  }, [user.city, user.latitude, user.longitude, loggedUser]);

  const handleViewProfile: HandleViewProfile = async (user: UserProfile): Promise<void> => {
    try {
      await setViewedProfile({ viewed_id: user.id });
      const fromId = localStorage.getItem("userId");
      if (fromId && user.id) {
        connectNotificationSocket(fromId);
        onNotificationSocketRegistered(() => {
          const socket = getNotificationSocket();
          if (socket && socket.connected) {
            socket.emit("send_reminder", {
              to: user.id,
              from: fromId,
              type: "view",
              content: ` viewed your profile`,
            });
          }
        });
      }
      navigate(`/profile/${user.id}`)
    } catch (err: any) {
        console.error("Error creating profile view:", err);
    }
  }

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 w-full max-w-sm mx-auto hover:shadow-lg transition-shadow">
      <img
        src={user.main_img || "/default-avatar.png"}
        alt={user.username}
        className="w-full h-48 object-cover rounded-xl mb-3"
      />
      <div className="space-y-1">
        <div className="flex flex-row justify-center mb-1">
          <h3 className="text-xl font-semibold">{user.first_name}</h3>
          <div></div>
          <Button
            onClick={() => handleViewProfile(user)}
            variant="none"
            className="cursor-pointer hover:scale-125 text-2xl text-pink-600">
            <FaEye />
          </Button>
        </div>
        <p className="text-sm text-gray-900">
          {age} · {(distance !== null ? `${distance.toFixed(1)} km` : "Secret Location")}
        </p>
        <p className="text-sm text-gray-700 line-clamp-2">{user.biography}</p>
        <div className="flex flex-wrap gap-1 justify-center mt-3">
          {user.tags?.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
