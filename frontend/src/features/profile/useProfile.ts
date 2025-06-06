import { useProfileContext } from "./ProfileContext";

export const useProfile = () => {
  const { userProfile, isOwnProfile, setUserProfile } = useProfileContext();

  const likeProfile = () => {
    console.log("Liking profile:", userProfile?.id);
    // lógica futura para llamar a la API
  };

  const updateProfile = (updates: Partial<typeof userProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...updates };
    setUserProfile(updated);
  };

  return { userProfile, isOwnProfile, likeProfile, updateProfile };
};