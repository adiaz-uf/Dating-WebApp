
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { Button } from "../components/Button";
import { ProfileProvider } from "../features/profile/ProfileContext";
import type { UserProfile } from "../features/profile/types";
import { fetchUserProfile } from "../api/profile_service";
import EditDataModal from "../features/home/EditDataModal";

export default function HomePage() {
  const [showEdit, setShowEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<UserProfile | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await fetchUserProfile();
        setProfileData(data.profile || data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div>Loading profile...</div>;
  if (!profileData) return <div>No profile found.</div>;

  return (
    <ProfileProvider profileData={profileData} loggedInUserId={profileData.id}>
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-pink-50">
          <h1 className="text-4xl font-semibold text-pink-600">Welcome to Matcha ❤️</h1>
          <Button onClick={() => setShowEdit(true)}>update</Button>
          {showEdit && (
            <EditDataModal
              onClose={() => setShowEdit(false)}
              onSaveSuccess={() => {
                setSuccess(true);
                setError(null);
                setShowEdit(false);
                setTimeout(() => setSuccess(false), 3000);
              }}
              onSaveError={(msg) => {
                setError(msg);
                setSuccess(false);
                setTimeout(() => setError(null), 3000);
              }}
            />
          )}
        </div>
      </MainLayout>
    </ProfileProvider>
  );
}