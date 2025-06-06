import { createContext, useContext, useState } from "react";
import type { UserProfile } from "./types";

interface ProfileContextType {
  userProfile: UserProfile | null;
  isOwnProfile: boolean;
  setUserProfile: (profile: UserProfile) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({
  children,
  profileData,
  loggedInUserId,
}: {
  children: React.ReactNode;
  profileData: UserProfile;
  loggedInUserId: string;
}) => {
  const [userProfile, setUserProfile] = useState(profileData);
  const isOwnProfile = userProfile?.id === loggedInUserId;

  return (
    <ProfileContext.Provider value={{ userProfile, isOwnProfile, setUserProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfileContext must be used inside ProfileProvider");
  return ctx;
};