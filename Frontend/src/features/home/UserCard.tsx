import React from "react";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { setViewedProfile } from "../../api/user_service";
import { Button } from "../../components/Button";
import type { UserProfile } from "../../features/profile/types";
import { calculateAge } from "../../lib/CalculateAge";

interface UserCardProps {
  user: UserProfile;
}

interface HandleViewProfile {
  (user: UserProfile): void;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const navigate = useNavigate();

  const age: number | null = calculateAge(user.birth_date);

  const handleViewProfile: HandleViewProfile = async (user: UserProfile): Promise<void> => {
    try {
      await setViewedProfile({ viewed_id: user.id });
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
          {age} · {user.city || "Unknown"}
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
