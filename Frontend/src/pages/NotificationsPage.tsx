
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegEye, FaUser, FaEye } from "react-icons/fa";
import { BiDislike } from "react-icons/bi";
import { IoChatbubblesOutline } from "react-icons/io5";
import MainLayout from "../layouts/MainLayout";
import { ProfileProvider } from "../features/profile/ProfileContext";
import { fetchUserProfile } from "../api/profile_service";
import Avatar from "../components/Avatar";
import { Button } from "../components/Button";
import { Card, CardContent } from "../components/Card";
import type { UserProfile } from "../features/profile/types";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { markAllAsRead, markAsRead } from "../store/notificationsSlice";
import { setViewedProfile } from "../api/user_service";

interface Notification {
  id: string;
  type: "like" | "dislike" | "view" | "message";
  user: {
    name: string;
    avatar: string;
  };
  sender_id: string;
  message: string;
  time: string;
  read: boolean;
}

export default function NotificationsPageWithProfileProvider() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const userId = localStorage.getItem("userId");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await fetchUserProfile();
        setProfile(data.profile || data);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Error loading profile.</div>;

  return (
    <ProfileProvider profileData={profile} loggedInUserId={profile.id}>
      <NotificationsPageInner />
    </ProfileProvider>
  );
}


function NotificationsPageInner() {
  const notifications = useAppSelector((state) => state.notifications.notifications);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();



  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleSingleRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return <div className="inline-flex mt-auto ml-auto bg-pink-500 p-2 rounded-full ">{<FaHeart color="white" />} </div>;
      case "dislike":
        return <div className="inline-flex mt-auto ml-auto bg-gray-400 p-2 rounded-full">{<BiDislike color="white" />}</div>;
      case "view":
        return <div className="inline-flex mt-auto ml-auto bg-blue-500 p-2 rounded-full">{<FaRegEye color="white" />}</div>;
      case "message":
        return <div className="inline-flex mt-auto ml-auto bg-green-500 p-2 rounded-full">{<IoChatbubblesOutline color="white" />}</div>;
      default:
        return <div className="inline-flex mt-auto ml-auto bg-muted p-2 rounded-full">{<FaUser color="white" />}</div>;
    }
  };

  const handleViewProfile = async (sender_id: string) => {
    try {
      await setViewedProfile({ viewed_id: sender_id });
      navigate(`/profile/${sender_id}`);
    } catch (err: any) {
      console.error("Error creating profile view:", err);
    }
  }  

  return (
    <MainLayout>
      <Card>
        <CardContent className="!p-1 md:!p-6">  
          <div className="flex items-center justify-between px-6 py-4 border-b gap-5">
              <h1 className="text-2xl font-semibold">Notifications</h1>
              <Button variant="outline" onClick={handleMarkAllAsRead}>
              Mark all as read
              </Button>
          </div>
          <div className="flex flex-col px-4 py-6 gap-4">
            {notifications.length === 0 ? (
            <div className="text-center text-default-500">No notifications yet.</div>
            ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleSingleRead(notification.id)}
                className={`flex items-start w-full md:w-100 gap-4 p-4 rounded-2xl border shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer ${
                  notification.read
                    ? "bg-white border-gray-200"
                    : "bg-pink-50 border-pink-200"
                }`}
              >
                <div className="relative w-12 h-12">
                  <Avatar
                    src={notification.user.avatar}
                    className={`w-12 h-12 rounded-full ring-2 ${
                      notification.read ? "ring-gray-100" : "ring-pink-300"
                    }`}
                  />
                  {!notification.read && (
                    <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 bg-pink-500 rounded-full ring-2 ring-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-foreground truncate">
                      <span className="text-muted-foreground">{notification.message}</span>
                    </p>
                  </div>
                  <div className="flex mt-2">
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                    {getIcon(notification.type)}
                    <Button
                      variant="outline"
                      className="group !rounded-full !px-2 ml-2 py-2 text-2xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProfile(notification.sender_id);
                      }}
                    >
                      <FaEye />
                      <span className="absolute right-full top-1/2 -translate-y-1/2 mr-4 px-2 py-1 bg-pink-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Visit Profile
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}