import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { ProfileProvider } from "./ProfileContext";
import ProfilePage from "../../pages/ProfilePage";
import { fetchUserProfile } from "../../api/profile_service";
import type { UserProfile } from "./types";

export default function ProfileRouteWrapper() {
  const [profileData, setProfileData] = useState<UserProfile | undefined>(undefined);
  const [authProfile, setAuthProfile] = useState<UserProfile | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    // Fetch both the profile being viewed and the authenticated user's profile
    Promise.all([
      fetchUserProfile(userId),
      fetchUserProfile() // no param: fetches authenticated user
    ])
      .then(([viewedData, authData]) => {
        let viewedProfile = viewedData.profile || viewedData;
        if (Array.isArray(viewedProfile)) {
          viewedProfile = {
            id: viewedProfile[0],
            email: viewedProfile[1],
            username: viewedProfile[2],
            first_name: viewedProfile[3],
            last_name: viewedProfile[4],
            biography: viewedProfile[5],
            gender: viewedProfile[6],
            sexual_preferences: viewedProfile[7],
          };
        }
        let authProfileObj = authData.profile || authData;
        if (Array.isArray(authProfileObj)) {
          authProfileObj = {
            id: authProfileObj[0],
            email: authProfileObj[1],
            username: authProfileObj[2],
            first_name: authProfileObj[3],
            last_name: authProfileObj[4],
            biography: authProfileObj[5],
            gender: authProfileObj[6],
            sexual_preferences: authProfileObj[7],
          };
        }
        if (isMounted) {
          setProfileData(viewedProfile);
          setAuthProfile(authProfileObj);
        }
      })
      .catch((err) => navigate("/login"))
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [userId]);

  if (loading || !profileData || !authProfile) return <div>Loading...</div>;
  const loggedInUserId = authProfile.id;

  // If the authenticated user's profile is not completed, redirect to home (block all profile views)
  if (!authProfile.completed_profile) {
    return <Navigate to="/" replace />;
  }

  return (
    <ProfileProvider profileData={profileData} loggedInUserId={loggedInUserId}>
      <ProfilePage />
    </ProfileProvider>
  );
}
