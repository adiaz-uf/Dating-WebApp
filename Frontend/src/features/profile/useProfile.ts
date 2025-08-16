import { useProfileContext } from "./ProfileContext";
import { setLikedProfile, setNotLikedProfile, setDislikedProfile, setNotDislikedProfile } from "../../api/user_service";


export const useProfile = () => {
  const { userProfile, isOwnProfile, setUserProfile } = useProfileContext();

  const likeProfile = async (like: boolean) => {
    if (!userProfile) return;
    try {
      if (like) {
        const res = await setLikedProfile({ liked_id: userProfile.id });
        setUserProfile({ ...userProfile, liked: true, disliked: false });
        return res;
      } else {
        await setNotLikedProfile({ liked_id: userProfile.id });
        setUserProfile({ ...userProfile, liked: false });
        return null;
      }
    } catch (err) {
      console.error("error liking user")
      return null;
    }
  };

  const dislikeProfile = async (dislike: boolean) => {
    if (!userProfile) return;
    try {
      if (dislike) {
        await setDislikedProfile({ disliked_id: userProfile.id });
        setUserProfile({ ...userProfile, liked: false, disliked: true });
      } else {
        await setNotDislikedProfile({ disliked_id: userProfile.id });
        setUserProfile({ ...userProfile, disliked: false });
      }
    } catch (err) {
      console.error("error disliking user")
    }
  };

  const updateProfile = (updates: Partial<typeof userProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...updates };
    setUserProfile(updated);
  };

  return { userProfile, isOwnProfile, likeProfile, dislikeProfile, updateProfile };
};