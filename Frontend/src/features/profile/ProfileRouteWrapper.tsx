// routes/ProfileRouteWrapper.tsx

// import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ProfileProvider } from "./ProfileContext";
import ProfilePage from "../../pages/ProfilePage";
import { fetchUserProfile } from "../../api/profile_service";
import type { UserProfile } from "./types";
import { useParams, useNavigate } from "react-router-dom";

// const loggedInUserId = "abc123"; // Simula el usuario actual

export default function ProfileRouteWrapper() {
  const [profileData, setProfileData] = useState<UserProfile | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    setLoading(true);
    fetchUserProfile(userId)
      .then((data) => {
        // backend puede devolver {success, profile}
        let profile = data.profile || data;
        // Si profile es un array, mapear a objeto
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

  // El id del usuario autenticado viene en el perfil
  const loggedInUserId = profileData.id;

  return (
    <ProfileProvider profileData={profileData} loggedInUserId={loggedInUserId}>
      <ProfilePage />
    </ProfileProvider>
  );
}
