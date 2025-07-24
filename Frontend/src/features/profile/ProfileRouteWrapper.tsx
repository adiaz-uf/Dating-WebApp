// routes/ProfileRouteWrapper.tsx

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ProfileProvider } from "./ProfileContext";
import ProfilePage from "../../pages/ProfilePage";
import { getMockProfileById } from "../../api/mockProfileApi";
import type { UserProfile } from "./types";

const loggedInUserId = "abc123"; // Simula el usuario actual

export default function ProfileRouteWrapper() {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState<UserProfile | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    getMockProfileById(userId)
      .then((data) => setProfileData(data as UserProfile))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading || !profileData) return <div>Loading profile...</div>;

  return (
    <ProfileProvider profileData={profileData} loggedInUserId={loggedInUserId}>
      <ProfilePage />
    </ProfileProvider>
  );
}
