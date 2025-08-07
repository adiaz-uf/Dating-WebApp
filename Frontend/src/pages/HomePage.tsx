
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { ProfileProvider } from "../features/profile/ProfileContext";
import type { UserProfile } from "../features/profile/types";
import { fetchUserProfile } from "../api/profile_service";
import EditDataModal from "../features/home/EditDataModal";
import { useNavigate } from "react-router-dom";
import { MessageBox } from "../components/MessageBox";

export default function HomePage() {
  const [showEdit, setShowEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<UserProfile | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await fetchUserProfile();
        setProfileData(data.profile || data);
        if (!data) return navigate("/login");
      } catch (err) {
        return navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profileData && profileData.completed_profile === false) {
      setShowEdit(true);
    }
  }, [profileData]);

  if (loading) return <div>Loading profile...</div>;
  if (!profileData) return <div>Error loading profile. Please try again later.</div>;


  return (
    <ProfileProvider profileData={profileData} loggedInUserId={profileData.id}>
      <MainLayout>
        <div className="absolute top-4 right-4 z-50 space-y-2">
          {error && <MessageBox type="error" message={error} show={!!error} />}
          {success && <MessageBox type="success" message="Saved Changes." show={success} />}
        </div>
        <div className="min-h-screen flex items-center justify-center bg-pink-50">
          <h1 className="text-4xl font-semibold text-pink-600">Welcome to Matcha ❤️</h1>
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