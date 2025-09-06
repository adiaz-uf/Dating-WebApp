import { useEffect, useState } from "react";
import { useProfile } from "../features/profile/useProfile";
import { setUserBlocked } from "../api/user_service";
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
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { calculateAge } from "../lib/CalculateAge";
import { isOnline } from "../lib/ActivityUpdater";
import { useNavigate } from "react-router-dom";
import { gotChatInCommon, isBlockedByUser, isLikedByUser } from "../api/profile_service";
import { getNotificationSocket, connectNotificationSocket, onNotificationSocketRegistered } from "../api/notifications_socket";

export default function ProfilePage() {
  const { userProfile, isOwnProfile, likeProfile, dislikeProfile } = useProfile();
  const [showEdit, setShowEdit] = useState(false);
  const [showInteractions, setShowInteractions] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [recievedLike, setRecievedLike] = useState(false);
  const [chatInCommon, setChatInCommon] = useState(false);
  const [recievedBlock, setRecievedBlock] = useState(false);
  const navigate = useNavigate();

  if (!userProfile) return <div>No profile data.</div>;

  // Map backend fields to frontend expected fields
  const name = userProfile.first_name || "";
  const lastName = userProfile.last_name || "";
  const bio = userProfile.biography || "";
  const birthdate = userProfile.birth_date || null;
  const age = calculateAge(birthdate);
  const online = isOnline(userProfile.last_active, 30);

  const handleUserBlock = async () => {
    try {
      const data = await setUserBlocked({blocked_id: userProfile.id});
      setError(data.message);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError("Error blocking user");
    }
  }

  const handleUserReport = async () => {
    try {
      const data = await setUserBlocked({blocked_id: userProfile.id});
      setError(data.message);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError("Error reporting user");
    }
  }

  const handleUserLike = async () => {
    try {
      const res = await likeProfile(true);
      const fromId = localStorage.getItem("userId");
      if (fromId && userProfile?.id) {
        connectNotificationSocket(fromId);
        onNotificationSocketRegistered(() => {
          const socket = getNotificationSocket();
          if (socket && socket.connected) {
            socket.emit("send_reminder", {
              to: userProfile.id,
              from: fromId,
              type: "like",
              content: ` liked your profile`,
            });
          }
        });
      }
      // show match modal
      if (res && res.match) {
        const fromId = localStorage.getItem("userId");
        if (fromId && userProfile?.id) {
          connectNotificationSocket(fromId);
          onNotificationSocketRegistered(() => {
            const socket = getNotificationSocket();
            if (socket && socket.connected) {
              socket.emit("send_reminder", {
                to: userProfile.id,
                from: fromId,
                type: "match",
                content: ` and you matched!`,
              });
            }
          });
        }
        setShowMatch(true);
        setTimeout(() => setShowMatch(false), 4000);
      }
    } catch (err) {
      setError("Error liking profile");
    }
  }

  const handleUserNotLike = async () => {
   try {
      await likeProfile(false);
      
    } catch (err) {
      setError("Error not liking profile");
    }
  }

  const handleUserDislike = async () => {
    try {
      await dislikeProfile(true);
      const fromId = localStorage.getItem("userId");
      if (fromId && userProfile?.id) {
        connectNotificationSocket(fromId);
        onNotificationSocketRegistered(() => {
          const socket = getNotificationSocket();
          if (socket && socket.connected) {
            socket.emit("send_reminder", {
              to: userProfile.id,
              from: fromId,
              type: "dislike",
              content: ` disliked your profile`,
            });
          }
        });
      }
    } catch (err) {
      setError("Error on dislike");
    }
  }

  const handleUserNotDislike = async () => {
    try {
      await dislikeProfile(false);
    } catch (err) {
      setError("Error removing dislike");
    }
  }

  useEffect(() => {
      const fetchRecievedLike = async () => {
        try {
          const data = await isLikedByUser(userProfile.id);
          if (data && data.success) {
            setRecievedLike(true);
          } else {
            setRecievedLike(false);
          }
        } catch (err) {
          setRecievedLike(false);
        } finally {
        }
      };
      const fetchChatInCommon = async () => {
        try { 
          if (userProfile.id != localStorage.getItem("userId"))
          {
            const data = await gotChatInCommon(userProfile.id);
            
            if (data && data.success) {
              setChatInCommon(true);
            } else {
              setChatInCommon(false);
            }
        }
        } catch (err) {
          setChatInCommon(false);
        } finally {
        }
      };
      const fetchRecievedBlock = async () => {
        try {
          const data = await isBlockedByUser(userProfile.id);
          if (data && data.success) {
            setRecievedBlock(true);
          } else {
            setRecievedBlock(false);
          }
        } catch (err) {
          setRecievedBlock(false);
        } finally {
        }
      };
      fetchRecievedLike();
      fetchChatInCommon();
      fetchRecievedBlock();
    }, []);

  return (
    <MainLayout>
      <div className="absolute top-4 right-4 z-50 space-y-2">
        {error && <MessageBox type="error" message={error} show={!!error} />}
        {success && <MessageBox type="success" message={success} show={!!success} />}
        {showMatch && <MessageBox type="match" message="¡Its a match! Now you can chat with your new match!!" show={showMatch} />}
      </div>
      <div className="absolute top-20 left-4 md:right-8 space-y-2 flex gap-3">
        <div className="relative group">
          <span className="relative flex gap-2 !p-2 !px-3 group bg-pink-600 rounded-xl text-white items-center justify-center font-medium">
            <FaMedal/>
            <label>{userProfile.fame_rating}</label>
          </span>
          <span className="absolute -right-0 top-18 -translate-y-1/2 px-2 py-1 bg-pink-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Fame Rating
          </span>
        </div>
        {recievedLike && 
        <div className="relative group">
          <span className="relative flex gap-2 !p-3 !px-3 group bg-pink-600 rounded-xl text-white items-center justify-center font-medium">
            <FaHeart/>
          </span>
          <span className="absolute -right-0 top-18 -translate-y-1/2 px-2 py-1 bg-pink-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Liked You
          </span>
        </div>
        }
        {chatInCommon && 
        <div className="relative group">
          <span className="relative flex gap-2 !p-3 !px-3 group bg-pink-600 rounded-xl text-white items-center justify-center font-medium">
            <IoChatbubbleEllipsesSharp/>
          </span>
          <span className="absolute -right-0 top-18 -translate-y-1/2 px-2 py-1 bg-pink-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Chat in common
          </span>
        </div>
        }
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
            <Button 
              variant="none" 
              className="cursor-pointer hover:scale-125 text-2xl text-pink-600 ml-auto" 
              onClick={() => setShowReport(!showReport)}
            >
              <MdOutlineReportProblem />
            </Button>
            {showReport && (
              <div className="flex gap-3">
                <Button onClick={() =>  handleUserReport()}>
                  Report Fake Account
                </Button>
                <Button onClick={() => handleUserBlock()}>
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
        {!isOwnProfile && !recievedBlock && (
          <div className="flex gap-6 mt-2">
          {userProfile.liked ? (
            <div className="relative group">
              <Button
                className="text-xl"
                variant="outline"
                onClick={() => handleUserNotLike()}
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
                onClick={() => handleUserLike()}
              >
                <FaRegHeart />
              </Button>
              <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 bg-pink-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Like Profile
              </span>
            </div>
          )}
          <label className={`mt-1 px-2 rounded-xl border ${online ? "bg-green-100 text-green-600 border-green-600" : "bg-red-100 text-red-600 border-red-600"}`}>
            {online ? "online" : userProfile.last_active}
          </label>
          {userProfile.disliked ? (
            <div className="relative group">
              <Button
                className="text-xl"
                variant="outline"
                onClick={() => handleUserNotDislike()}
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
                onClick={() => handleUserDislike()}
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
        {!isOwnProfile && recievedBlock && (
          <div className="flex justify-center mt-4">
            <span className="text-red-600 font-semibold text-lg bg-red-100 px-4 py-2 rounded-lg border border-red-300">
              User Blocked
            </span>
          </div>
        )}
        <div className="flex flex-wrap gap-3 items-center justify-center my-6">
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
            .filter(imageUrl => imageUrl !== userProfile.main_img)
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
            onClose={() => {
              setShowEdit(false);
              window.location.reload();
            }}
            onSaveSuccess={(msg) => {
              setSuccess(msg);
              setError(null);
              setShowEdit(false);
              setTimeout(() => setSuccess(null), 3000);
              window.location.reload();
            }}
            onSaveError={(msg) => {
              setError(msg);
              setSuccess(null);
              setTimeout(() => setError(null), 3000);
              window.location.reload();
            }}
          />
        )}
        {showInteractions && (
          <ProfileInteractionsModal onClose={() => setShowInteractions(false)}/>
        )}
    </MainLayout>
  );
}