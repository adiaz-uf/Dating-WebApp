import { useState } from "react";
import { Button } from "../components/Button";
import MainLayout from "../layouts/MainLayout";
import { useProfile } from "../features/profile/useProfile";
import EditProfileModal from "../features/profile/EditProfileModal";
import { ProfileInfoCard } from "../features/profile/ProfileInfoCard";

function calculateAge(birthdate: string | Date): number {
  const birth = new Date(birthdate);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export default function ProfilePage() {
  const { userProfile, isOwnProfile, likeProfile } = useProfile();
  const [showEdit, setShowEdit] = useState(false);

  if (!userProfile) return <div>Loading...</div>;

  const age = calculateAge(userProfile.birthdate);

  /* const HandleProfileLike = () => {}    TODO */

  return (
    <MainLayout>
        {isOwnProfile && (
          <div className="absolute top-20 right-2 space-y-2 group">
            <Button
              onClick={() => setShowEdit(true)}
              variant="none"
              className="cursor-pointer"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"
                className="text-pink-600 hover:text-pink-700"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </Button>
            <span className="absolute -left-20 top-5 -translate-y-1/2 px-2 py-1 bg-pink-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Change Data
            </span>
          </div>
        )}
        {/* Profile Pic */}
        <div className="relative w-50 h-50">
          <img 
          src={userProfile.main_img} 
          alt="Profile Image"
          className="w-full bg-pink-300 rounded-full"/>
          {!isOwnProfile && (
            <Button
              className="absolute bottom-2 right-2 rounded-full bg-transparent hover:bg-transparent transition-transform duration-200 hover:scale-150 cursor-pointer"
              variant="like"
              onClick={likeProfile}
            >
              ❤️
            </Button>
          )}
        </div>
        {!isOwnProfile && (
          <label className={`mt-1 px-2 rounded-xl border ${userProfile.isOnline ? "bg-green-100 text-green-600 border-green-600" : "bg-red-100 text-red-600 border-red-600"}`}>
            {userProfile.isOnline ? "online" : "offline"}
          </label>
        )}
        <div className="flex flex-wrap gap-3 items-center my-5">
          <h1 className="text-4xl font-semibold leading-none">{userProfile.name}</h1>
          <span className="text-3xl font-semibold translate-y-[1px]"> - </span>
          <h2 className="text-2xl font-semibold translate-y-[2px]">{age}</h2>
        </div>
        <p className="text-xl max-w-200 mb-4 break-words overflow-hidden">
          {userProfile.bio}
        </p>
        {/* Tags List */}
        <div className="flex flex-wrap gap-3 justify-center">
          {userProfile.tags.map((tag, index) => (
            <label 
              key={index} 
              className="text-pink-600 bg-pink-100 border border-pink-600 rounded-3xl px-2 pb-1">
                {tag}
              </label>
          ))}
        </div>
        {/* User Images List */}
        <div className="flex flex-wrap gap-5 items-center justify-center my-5">
          {userProfile.images.map((imageUrl, index) => (
            <img 
              key={index} 
              src={imageUrl}
              className="w-70 h-70 bg-pink-300 rounded-md"
              alt={`User image ${index + 1}`}
            />
          ))}
        </div>
        {isOwnProfile && (
          <ProfileInfoCard/>
        )}
        {showEdit && <EditProfileModal onClose={() => setShowEdit(false)} />}
    </MainLayout>
  );
}