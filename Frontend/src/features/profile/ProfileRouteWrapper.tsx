import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";

import { ProfileProvider } from "./ProfileContext";
import ProfilePage from "../../pages/ProfilePage";
import { fetchUserProfile } from "../../api/profile_service";
import type { UserProfile } from "./types";


export default function ProfileRouteWrapper() {
  const [profileData, setProfileData] = useState<UserProfile | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    setLoading(true);
    fetchUserProfile(userId)
      .then((data) => {
        let profile = data.profile || data;
        if (Array.isArray(profile)) {
          profile = {
            id: profile[0],
            email: profile[1],
            username: profile[2],
            first_name: profile[3],
            last_name: profile[4],
            biography: profile[5],
            gender: profile[6],
            sexual_preferences: profile[7],
          };
        }
        setProfileData(profile);
      })
      .catch((err) => navigate("/login"))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading || !profileData) return <div>Loading...</div>;
  if (!profileData.completed_profile) return <Navigate to="/" replace />;
  
  const loggedInUserId = localStorage.getItem("userId") ?? "";

  return (
    <ProfileProvider profileData={profileData} loggedInUserId={loggedInUserId}>
      <ProfilePage />
    </ProfileProvider>
  );
}
