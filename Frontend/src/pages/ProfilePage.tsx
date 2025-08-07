import { useState } from "react";
import { useProfile } from "../features/profile/useProfile";
import MainLayout from "../layouts/MainLayout";
import EditProfileModal from "../features/profile/EditProfileModal";
import { ProfileInfoCard } from "../features/profile/ProfileInfoCard";
import Avatar from "../components/Avatar";
import { MessageBox } from "../components/MessageBox";
import ProfileInteractionsModal from "../features/profile/ProfileInteractionsModal";
import { Button } from "../components/Button";
import { FaEye, FaMedal, FaHeart  } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa6";
import { BiSolidDislike } from "react-icons/bi";
import { BiDislike } from "react-icons/bi";
import { MdOutlineReportProblem } from "react-icons/md";
import { calculateAge } from "../lib/CalculateAge";

export default function ProfilePage() {
  const { userProfile, isOwnProfile, likeProfile, dislikeProfile } = useProfile();
  const [showEdit, setShowEdit] = useState(false);
  const [showInteractions, setShowInteractions] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!userProfile) return <div>No profile data.</div>;

  // Map backend fields to frontend expected fields
  const name = userProfile.first_name || "";
  const lastName = userProfile.last_name || "";
  const bio = userProfile.biography || "";
  // Try to get birthdate from multiple possible fields
  const birthdate = userProfile.birth_date || null;
  const age = calculateAge(birthdate);

  return (
    <MainLayout>
      <div className="absolute top-4 right-4 z-50 space-y-2">
        {error && <MessageBox type="error" message={error} show={!!error} />}
        {success && <MessageBox type="success" message="Saved Changes." show={success} />}
      </div>
      <div className="absolute top-20 left-4 md:right-8 space-y-2 flex gap-3">
        <div className="relative group">
          <span className="relative flex gap-2 !p-2 !px-3 group bg-pink-600 rounded-xl text-white items-center justify-center font-medium">
            <FaMedal/>
            <label>100</label>
          </span>
          <span className="absolute -right-24 top-5 -translate-y-1/2 px-2 py-1 bg-pink-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Fame Rating
          </span>
        </div>
      </div>
        {isOwnProfile ? (
          <div className="absolute top-20 right-4 md:right-8 space-y-2 flex gap-3">
            <div className="relative group">
              <Button
                onClick={() => setShowInteractions(true)}
                variant="none"
                className="cursor-pointer text-2xl text-pink-600">
                <FaEye />
              </Button>
              <span className="absolute -right-0 top-14 -translate-y-1/2 px-2 py-1 bg-pink-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Profile Interactions
              </span>
            </div>
            <div className="relative group">
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
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-pink-600 hover:text-pink-700"
                >
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </Button>
              <span className="absolute -right-0 top-14 -translate-y-1/2 px-2 py-1 bg-pink-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Change Data
              </span>
            </div>
          </div>
        ) : (
          <div className="absolute top-20 right-4 md:right-8 space-y-2 flex gap-3 flex-col items-right justify-right">
            <Button variant="none" className="cursor-pointer text-2xl text-pink-600 ml-auto" onClick={() => setShowReport(!showReport)}>
              <MdOutlineReportProblem />
            </Button>
            {showReport && (
              <div className="flex gap-3">
                <Button>
                  Report Fake Account
                </Button>
                <Button>
                  Block User
                </Button>
              </div>
            )}
          </div>
        )}
        {/* Profile Pic */}
        <div className="w-50 h-50">
          <Avatar src={userProfile.main_img} />
        </div>
        {!isOwnProfile && (
          <div className="flex gap-6 mt-2">
          {userProfile.liked ? (
            <div className="relative group">
              <Button
                className="text-xl"
                variant="outline"
                onClick={() => likeProfile(false)}
              >
                <FaHeart />
              </Button>
              <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 bg-pink-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Remove Like
              </span>
            </div>
          ) : (
            <div className="relative group">
              <Button
                className="text-xl"
                variant="outline"
                onClick={() => likeProfile(true)}
              >
                <FaRegHeart />
              </Button>
              <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 bg-pink-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Like Profile
              </span>
            </div>
          )}
          <label className={`mt-1 px-2 rounded-xl border ${userProfile.isOnline ? "bg-green-100 text-green-600 border-green-600" : "bg-red-100 text-red-600 border-red-600"}`}>
            {userProfile.isOnline ? "online" : "offline"}
          </label>
          {userProfile.disliked ? (
            <div className="relative group">
              <Button
                className="text-xl"
                variant="outline"
                onClick={() => dislikeProfile(false)}
              >
                <BiSolidDislike/>
              </Button>
              <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-pink-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Remove Dislike
              </span>
            </div>
          ) : (
            <div className="relative group">
              <Button
                className="text-xl"
                variant="outline"
                onClick={() => dislikeProfile(true)}
              >
                <BiDislike/>
              </Button>
              <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-pink-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Dislike Profile
              </span>
            </div>
          )}
          </div>
        )}
        <div className="flex flex-wrap gap-3 items-center my-6">
          <h1 className="text-3xl font-semibold leading-none">{name || "No name"} {lastName}</h1>
          <span className="text-3xl font-semibold translate-y-[1px]"> - </span>
          <h2 className="text-2xl font-semibold translate-y-[2px]">{age !== null ? age : ""}</h2>
        </div>
        <p className="text-xl max-w-200 mb-6 break-words overflow-hidden">
          {bio}
        </p>

        {/* Tags List */}
        <div className="flex m-4 gap-3">
          <label 
            className="text-purple-600 bg-purple-200 border border-purple-600 rounded-3xl px-2.5 pb-1">
            {userProfile.gender || ""}
          </label>
          <label 
            className="text-purple-600 bg-purple-200 border border-purple-600 rounded-3xl px-2.5 pb-1">
            {userProfile.sexual_preferences || ""}
          </label>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {(userProfile.tags || []).map((tag, index) => {
            const tagWithHash = tag && !tag.startsWith('#') ? `#${tag.replace(/^#+/, '')}` : tag;
            return (
              <label 
                key={index} 
                className="text-pink-600 bg-pink-100 border border-pink-600 rounded-3xl px-2.5 pb-1">
                  {tagWithHash || ""}
              </label>
            );
          })}
        </div>
        {/* User Images List */}
        <div className="flex flex-wrap gap-5 items-center justify-center my-8">
          {(userProfile?.images || [])
            .filter(imageUrl => imageUrl !== userProfile.main_img) // Filtrar la foto de perfil
            .map((imageUrl, index) => (
              imageUrl ? (
                <img 
                  key={index} 
                  src={imageUrl}
                  className="w-70 h-70 bg-pink-300 rounded-md border"
                  alt={`User image ${index + 1}`}
                />
              ) : null
            ))}
        </div>
        {isOwnProfile && (
          <ProfileInfoCard/>
        )}
        {showEdit && (
          <EditProfileModal
            onClose={() => setShowEdit(false)}
            onSaveSuccess={() => {
              setSuccess(true);
              setError(null);
              setShowEdit(false);
              setTimeout(() => setSuccess(false), 3000);
            }}
            onSaveError={(msg) => {
              setError(msg);
              setSuccess(false);
              setTimeout(() => setError(null), 3000);
            }}
          />
        )}
        {showInteractions && (
          <ProfileInteractionsModal onClose={() => setShowInteractions(false)}/>
        )}
    </MainLayout>
  );
}