import React from "react";
import type { UserProfile } from "../../features/profile/types";
import { calculateAge } from "../../lib/CalculateAge";

interface UserCardProps {
  user: UserProfile;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {


  const age = calculateAge(user.birth_date);

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 w-full max-w-sm mx-auto hover:shadow-lg transition-shadow">
      <img
        src={user.main_img || "/default-avatar.png"}
        alt={user.username}
        className="w-full h-48 object-cover rounded-xl mb-3"
      />
      <div className="space-y-1">
        <h3 className="text-xl font-semibold">{user.username}</h3>
        <p className="text-sm text-gray-600">
          {age} · {user.latitude || "Unknown location"} · {user.longitude || "Unknown location"}
        </p>
        <p className="text-sm text-gray-500 line-clamp-2">{user.biography}</p>
        <div className="flex flex-wrap gap-1 mt-2">
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
