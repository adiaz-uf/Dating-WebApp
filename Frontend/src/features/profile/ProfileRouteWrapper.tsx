import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading || !profileData) return navigate("/login");
  if (!profileData.completed_profile) return navigate("/");
  
  const loggedInUserId = profileData.id;

  return (
    <ProfileProvider profileData={profileData} loggedInUserId={loggedInUserId}>
      <ProfilePage />
    </ProfileProvider>
  );
}
