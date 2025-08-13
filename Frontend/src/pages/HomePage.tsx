import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { ProfileProvider } from "../features/profile/ProfileContext";
import type { UserProfile } from "../features/profile/types";
import { fetchUserProfile, updateUserLocation } from "../api/profile_service";
import EditDataModal from "../features/home/EditDataModal";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageBox } from "../components/MessageBox";
import { getApproxLocationByIP } from "../lib/LocationByIp";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Slider } from "../features/home/Slider";
import { Select } from "../features/home/Select";
import { UserCard } from "../features/home/UserCard";
import { fetchSuggestedUsers } from "../api/user_service";

export default function HomePage() {
  const [showEdit, setShowEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<UserProfile | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [filters, setFilters] = useState({
    ageRange: [18, 99],
    fameRating: [0, 100],
    location: "",
    tags: [] as string[],
    sortBy: "location",
    filterBy: "location",
    sortOrder: "asc",
    specificAge: "",
    specificFame: "",
    specificLocation: "",
    specificTag: ""
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Detect OAuth login redirect and store userId in localStorage if present
  useEffect(() => {
    // Handle confirmMsg from navigation state
    if (location.state && location.state.confirmMsg) {
      window.history.replaceState({}, document.title);
    }

    // Check for userId in query params
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("userId");
    if (userId) {
      localStorage.setItem("userId", userId);
      params.delete("userId");
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location.state]);

  // fetch profile data
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

  // geolocator by browser or by IP
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateUserLocation(latitude, longitude);
      },
      (error) => {
        console.warn("User denied location or error occurred", error);
        getApproxLocationByIP();
      }
    );
  }, []);

  // fetch suggested users
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await fetchSuggestedUsers();
        if (data.success) {
          setSuggestedUsers(data.users);
        }
      } catch (err) {
        console.error("Error fetching suggested users", err);
      }
    };

    if (profileData) {
      fetchSuggestions();
    }
  }, [profileData]);

  /* TODO: open data modal */
  useEffect(() => {
    if (profileData && profileData.completed_profile === false) {
      setShowEdit(true);
    }
  }, [profileData]);


  const handleInputChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    // TODO: Fetch filtered and sorted users from backend based on filters
  };

  const handleAdvancedSearch = async () => {
    // TODO: Fetch filtered and sorted users from backend based on filters
  };

  if (loading) return <div>Loading profile...</div>;
  if (!profileData) return <div>Error loading profile. Please try again later.</div>;

  return (
    <ProfileProvider profileData={profileData} loggedInUserId={profileData.id}>
      <MainLayout>
        <div className="absolute top-4 right-4 z-50 space-y-2">
          {error && <MessageBox type="error" message={error} show={!!error} />}
          {success && <MessageBox type="success" message="Saved Changes." show={success} />}
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-5 px-4 bg-pink-50">
          {/* Filters Panel */}
          <div className="w-full max-w-6xl bg-white shadow-md rounded-3xl p-6 mb-6">
            <div className="flex items-center flex-col justify-center flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-gray-800">Search Profiles</h2>
              <div className="flex flex-col sm:flex-row gap-2 items-center justify-center flex-wrap">
                <div className="flex flex-col">
                <Select
                  label="Sort By"
                  value={filters.sortBy}
                  options={[
                    { label: "Age", value: "age" },
                    { label: "Location", value: "location" },
                    { label: "Fame Rating", value: "fame_rating" },
                    { label: "Tags", value: "tags" },
                  ]}
                  onChange={(val) => handleInputChange("sortBy", val)}
                />
                <Select
                  label="Order"
                  value={filters.sortOrder}
                  options={[
                    { label: "Ascending", value: "asc" },
                    { label: "Descending", value: "desc" },
                  ]}
                  onChange={(val) => handleInputChange("sortOrder", val)}
                />
                </div>
                <div className="sm:m-4 m-2">
                  <p className="text-lg">or</p>
                </div>
                <div className="flex flex-col items-center">
                <Select
                  label="Filter By"
                  value={filters.filterBy}
                  options={[
                    { label: "Age", value: "age" },
                    { label: "Location", value: "location" },
                    { label: "Fame Rating", value: "fame_rating" },
                    { label: "Tag", value: "tag" },
                  ]}
                  onChange={(val) => handleInputChange("filterBy", val)}
                />
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Type an specific: {filters.filterBy}</label>
                  <Input
                    value={filters.location}
                    onChange={(e) => handleInputChange(filters.filterBy, e.target.value)}
                    className=" ml-2 mb-2"
                  />
                </div>
                </div>
              </div>
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {/* Advanced Search Panel */}
          <div className="w-full max-w-6xl bg-white shadow-md rounded-3xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Advanced search</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Age slider */}
              <div>
                <Slider
                  label="Min Age"
                  min={18}
                  max={filters.ageRange[1]}
                  value={filters.ageRange[0]}
                  onChange={(val) => handleInputChange("ageRange", [val, filters.ageRange[1]])}
                />
                <Slider
                  label="Max Age"
                  min={filters.ageRange[0]}
                  max={99}
                  value={filters.ageRange[1]}
                  onChange={(val) => handleInputChange("ageRange", [filters.ageRange[0], val])}
                />
              </div>
              {/* Fame slider */}
              <div>
                <Slider
                  label="Min Fame"
                  min={0}
                  max={filters.fameRating[1]}
                  value={filters.fameRating[0]}
                  onChange={(val) => handleInputChange("fameRating", [val, filters.fameRating[1]])}
                />
                <Slider
                  label="Max Fame"
                  min={filters.fameRating[0]}
                  max={100}
                  value={filters.fameRating[1]}
                  onChange={(val) => handleInputChange("fameRating", [filters.fameRating[0], val])}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location Contains</label>
                <Input
                  value={filters.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Tags (comma separated)</label>
                <Input
                  value={filters.tags.join(", ")}
                  onChange={(e) => handleInputChange("tags", e.target.value.split(",").map(t => t.trim()))}
                />
              </div>
            </div>
            <Button className="mt-8" onClick={handleAdvancedSearch}>Advanced Search</Button>
          </div>

        </div>
          {/* Suggested or Searched Profiles */}
          <div className='w-full gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-4'>
            {suggestedUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>

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
      </MainLayout>
    </ProfileProvider>
  );
}


/*   useEffect(() => { TODO: data modal
  if (profileData && profileData.completed_profile === false) {
    setShowEdit(true);
  }
}, [profileData]); */