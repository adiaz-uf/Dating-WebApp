import { useProfileContext } from "./ProfileContext";

export const useProfile = () => {
  const { userProfile, isOwnProfile, setUserProfile } = useProfileContext();

  const likeProfile = (like: boolean) => {
    // TODO test function with mockData
    if (userProfile) {
      if (like) {
        console.log("set like", userProfile?.id);
        setUserProfile({ ...userProfile, liked: true, disliked: false });
      } else {
        console.log("unset like", userProfile?.id);
        setUserProfile({ ...userProfile, liked: false });
      }
    }
    // lógica futura para llamar a la API
  };

  const dislikeProfile = (dislike: boolean) => {
    // TODO test function with mockData
    if (userProfile) {
      if (dislike) {
        console.log("set dislike", userProfile?.id);
        setUserProfile({ ...userProfile, liked: false, disliked: true });
      } else {
        console.log("unset dislike", userProfile?.id);
        setUserProfile({ ...userProfile, disliked: false });
      }
    }
  };

  const updateProfile = (updates: Partial<typeof userProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...updates };
    setUserProfile(updated);
  };

  return { userProfile, isOwnProfile, likeProfile, dislikeProfile, updateProfile };
};