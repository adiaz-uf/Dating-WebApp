import { useEffect, useState, useMemo } from "react";
import MainLayout from "../layouts/MainLayout";
import { ProfileProvider } from "../features/profile/ProfileContext";
import type { UserProfile } from "../features/profile/types";
import { fetchUserProfile, updateUserLocation } from "../api/profile_service";
import EditDataModal from "../features/home/EditDataModal";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageBox } from "../components/MessageBox";
import { getApproxLocationByIP } from "../lib/LocationByIp";
import { FiltersPanel } from "../features/home/FiltersPanel";
import { AdvancedSearchPanel } from "../features/home/AdvancedSearchPanel";
import { UserCard } from "../features/home/UserCard";
import { InteractiveMap } from "../features/home/InteractiveMap";
import { fetchSuggestedUsers, fetchAdvancedUsers } from "../api/user_service";
import { connectNotificationSocket } from "../api/notifications_socket";
import { calculateAge } from "../lib/CalculateAge";
import { calculateDistance } from "../lib/CalculateDistance";

export default function HomePage() {
  const [showEdit, setShowEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<UserProfile | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const defaultFilters = {
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
  };
  const [filters, setFilters] = useState(() => {
    try {
      const saved = localStorage.getItem("homepageFilters");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.ageRange && !Array.isArray(parsed.ageRange)) parsed.ageRange = [18, 99];
        if (parsed.fameRating && !Array.isArray(parsed.fameRating)) parsed.fameRating = [0, 100];
        if (parsed.tags && typeof parsed.tags === "string") parsed.tags = parsed.tags.split(",").map((t: string) => t.trim());
        return { ...defaultFilters, ...parsed };
      }
    } catch {}
    return defaultFilters;
  });

  const [advancedFilters, setAdvancedFilters] = useState(() => ({
    ageRange: [18, 99],
    fameRating: [0, 100],
    location: "",
    tags: [] as string[],
  }));

  const navigate = useNavigate();
  const location = useLocation();

  // Detect OAuth login redirect and store userId in localStorage if present
  useEffect(() => {
    if (location.state && location.state.confirmMsg) {
      window.history.replaceState({}, document.title);
    }

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
        if (!data) return navigate("/login");
        setProfileData(data.profile || data);
      } catch (err) {
        return navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Connect notification socket
  useEffect(() => {
    if (profileData) {
      connectNotificationSocket(profileData.id);
    }
  }, [profileData]);

  // Geolocator by browser or by IP
  useEffect(() => {
    if (!profileData) return; 

    const lat = profileData.latitude;
    const lon = profileData.longitude;
    if (lat === null || lat === undefined || lon === null || lon === undefined) {
      console.log("Update location: ", lat, lon);
      sessionStorage.removeItem("ipLocationTried");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateUserLocation(latitude, longitude);
        },
        (error) => {
          console.warn("User denied location or error occurred", error);
          // If still missing coordinates and not already tried IP, try IP geolocation
          if ((lat === null || lat === undefined || lon === null || lon === undefined) 
            && !sessionStorage.getItem("ipLocationTried")) {
            getApproxLocationByIP();
          }
        }
      );
    }
  }, [profileData]);

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

  useEffect(() => {
    if (profileData && profileData.completed_profile === false) {
      setShowEdit(true);
    }
  }, [profileData]);


  type FiltersType = typeof defaultFilters;
  const handleInputChange = (field: string, value: any) => {
    setFilters((prev: FiltersType) => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem("homepageFilters", JSON.stringify(updated));
      return updated;
    });
  };

  const filteredAndSortedUsers = useMemo(() => {
    if (!suggestedUsers) return [];
    let users = [...suggestedUsers];
    // filterBy
    const { filterBy } = filters;
    
    // Get the correct filter value based on filterBy
    let filterValue;
    switch (filterBy) {
      case "age":
        filterValue = filters.specificAge;
        break;
      case "location":
        filterValue = filters.specificLocation;
        break;
      case "fame_rating":
        filterValue = filters.specificFame;
        break;
      case "tag":
        filterValue = filters.specificTag;
        break;
      default:
        filterValue = "";
    }
    
    if (filterValue && filterValue !== "") {
      users = users.filter((user) => {
        switch (filterBy) {
          case "age":
            if (!user.birth_date) return false;
            return calculateAge(user.birth_date) === Number(filterValue);
          case "location": {
            // distance in km
            if (!profileData || profileData.latitude == null || profileData.longitude == null || user.latitude == null || user.longitude == null) return false;
            const dist = calculateDistance(
              Number(profileData.latitude),
              Number(profileData.longitude),
              Number(user.latitude),
              Number(user.longitude)
            );
            return Math.round(dist) === Number(filterValue);
          }
          case "fame_rating":
            return (user.fame_rating || 0) === Number(filterValue);
          case "tag":
            return (user.tags || []).some((tag: string) => tag.toLowerCase().includes(String(filterValue).toLowerCase()));
          default:
            return true;
        }
      });
    }
    // sortBy
    const { sortBy, sortOrder } = filters;
    users.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case "age":
          valA = calculateAge(a.birth_date);
          valB = calculateAge(b.birth_date);
          break;
        case "location":
          // Calculate actual distance for sorting
          if (!profileData || profileData.latitude == null || profileData.longitude == null || 
            a.latitude == null || a.longitude == null || b.latitude == null || b.longitude == null) {
          // Fallback to city name comparison if coordinates are missing
          valA = a.city?.toLowerCase() || "";
          valB = b.city?.toLowerCase() || "";
        } else {
          valA = calculateDistance(
            Number(profileData.latitude),
            Number(profileData.longitude),
            Number(a.latitude),
            Number(a.longitude)
          );
          valB = calculateDistance(
            Number(profileData.latitude),
            Number(profileData.longitude),
            Number(b.latitude),
              Number(b.longitude)
            );
          }
          break;
        case "fame_rating":
          valA = a.fame_rating || 0;
          valB = b.fame_rating || 0;
          break;
        case "tags":
          valA = (a.tags?.length || 0);
          valB = (b.tags?.length || 0);
          break;
        default:
          valA = 0;
          valB = 0;
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return users;
  }, [suggestedUsers, filters]);

  const handleSearch = async () => {
  };

  const handleAdvancedSearch = async () => {
    try {
      setLoading(true);
      const data = await fetchAdvancedUsers(advancedFilters);
      if (data.success) {
        setSuggestedUsers(data.users);
      } else {
        setError(data.message || "No users found");
      }
    } catch (err: any) {
      setError(err.message || "Error in advanced search");
    } finally {
      setLoading(false);
    }
  };

  const handleUserMapClick = (user: UserProfile) => {
    navigate(`/profile/${user.id}`);
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

        <div className="w-full grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 place-items-center gap-5 px-4 bg-pink-50">
          {/* Filters Panel */}
          <FiltersPanel
            filters={filters}
            onInputChange={handleInputChange}
            onSearch={handleSearch}
          />

          {/* Advanced Search Panel */}
          <AdvancedSearchPanel
            filters={advancedFilters}
            onInputChange={(field, value) => setAdvancedFilters((prev) => ({ ...prev, [field]: value }))}
            onAdvancedSearch={handleAdvancedSearch}
          />

        </div>
          {/* Suggested or Searched Profiles */}
          <div className='w-full gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 px-4'>
            {filteredAndSortedUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>

          {/* Interactive Map */}
          <div className="w-full px-4 mt-8">
            <InteractiveMap 
              users={filteredAndSortedUsers}
              currentUser={profileData}
              onUserClick={handleUserMapClick}
            />
          </div>

        {showEdit && (
          <EditDataModal
            onClose={() => {
              setShowEdit(false);
              window.location.reload(); // Force reload to refresh suggested users and profile
            }}
            onSaveSuccess={() => {
              setSuccess(true);
              setError(null);
              setShowEdit(false);
              window.location.reload(); // Also reload after successful save
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