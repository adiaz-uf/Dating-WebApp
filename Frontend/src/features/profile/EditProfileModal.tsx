import { useEffect, useRef, useState } from "react";
import { useProfile } from "./useProfile";
import { useProfileContext } from "./ProfileContext";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { updateUserProfile, fetchUserProfile } from "../../api/profile_service";
import { uploadProfilePicture, uploadPicture, deletePicture } from "../../api/picture_service";
import { suggestTags, replaceAllTags } from "../../api/tag_service";
import { MessageBox } from "../../components/MessageBox";
import MapSelector from "../../components/MapSelector";

const ResizableInput = ({
  value,
  onChange,
  onCommit,
}: {
  value: string;
  onChange: (val: string) => void;
  onCommit?: (val: string) => void;
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [inputWidth, setInputWidth] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (spanRef.current) {
      const width = spanRef.current.offsetWidth;
      setInputWidth(width + 4);
    }
  }, [value]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value || value.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const q = value.replace(/^#+/, "");
      if (q.length < 2) return setSuggestions([]);
      const tags = await suggestTags(q);
      setSuggestions(tags.filter(t => t !== value).slice(0, 5));
    }, 200);
  }, [value]);

  const handleCommit = () => {
    setShowSuggestions(false);
    if (onCommit) onCommit(value);
  };

  return (
    <div className="relative inline-block">
      <span
        ref={spanRef}
        className="absolute top-0 left-0 invisible whitespace-pre text-sm px-2"
      >
        {value || "a"}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          let newValue = e.target.value;
          if (!newValue.startsWith("#")) {
            newValue = "#" + newValue.replace(/^#+/, "");
          }
          onChange(newValue);
          setShowSuggestions(true);
        }}
        onBlur={() => setTimeout(handleCommit, 100)}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleCommit();
          }
        }}
        style={{ width: `${inputWidth}px` }}
        className="text-sm px-2 py-0.5 rounded-full border border-pink-400 bg-pink-100 text-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="fixed left-1/2 -translate-x-1/2 min-w-[220px] w-max max-w-[350px] bg-white border border-pink-300 rounded-2xl shadow-lg z-[10000] max-h-48 overflow-auto flex flex-col"
          style={{
            boxShadow: '0 4px 24px 0 rgba(233, 30, 99, 0.10)',
            top: spanRef.current ? (spanRef.current.getBoundingClientRect().bottom + 8) + 'px' : '120px'
          }}
        >
          {suggestions.map((s, idx) => {
            const clean = s.replace(/^#+/, "");
            return (
              <div
                key={s + idx}
                className="px-4 py-2 text-base text-pink-600 hover:bg-pink-100 cursor-pointer transition-colors rounded-xl mx-1 my-1"
                onMouseDown={() => {
                  onChange("#" + clean);
                  setShowSuggestions(false);
                  if (onCommit) onCommit("#" + clean);
                }}
              >
                #{clean}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface EditProfileModalProps {
  onClose: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (msg: string) => void;
}

export default function EditProfileModal({
  onClose,
  onSaveSuccess,
  onSaveError,
}: EditProfileModalProps) {
  const { userProfile } = useProfile();
  const ctx = (() => { try { return useProfileContext(); } catch { return null; } })();

  if (!userProfile) return <div>Loading...</div>;

  const [bio, setBio] = useState(userProfile.biography || "");
  const formatTags = (arr: string[] = []) => arr.map(t => t.startsWith('#') ? t : '#' + t.replace(/^#+/, ''));
  const [tags, setTags] = useState(formatTags(userProfile.tags));
  const [images, setImages] = useState(userProfile.images || []);
  const [name, setName] = useState(userProfile.first_name || "");
  const [lastName, setLastName] = useState(userProfile.last_name || "");
  const [email, setEmail] = useState(userProfile.email || "");
  const [gender, setGender] = useState(userProfile.gender || "");
  const [sexualOrientation, setSexualOrientation] = useState(userProfile.sexual_preferences || "");
  const [showGenderOptions, setShowGenderOptions] = useState(false);
  const [showOrientationOptions, setShowOrientationOptions] = useState(false);
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleTagChange = (index: number, newValue: string) => {
    let formatted = newValue.trim();
    if (!formatted.startsWith("#")) {
      formatted = "#" + formatted.replace(/^#+/, "");
    }

    if(formatted.length >= 20)
      return;
    
    setTags((prevTags) => {
      if (index < 0 || index >= prevTags.length) return prevTags;
      const newTags = [...prevTags];
      newTags[index] = formatted;
      return newTags;
    });
  };

  const handleCommitTag = async (index: number, val: string) => {
    const normalizedVal = val.trim().replace(/^#+/, '').toLowerCase();
    const formattedVal = '#' + normalizedVal;
    
    // Check for empty tag
    if (normalizedVal.length <= 0) {
      setError("Tag cannot be empty");
      setShowError(true);
      // Revert to previous value or remove if it was new
      setTags(prevTags => {
        const newTags = [...prevTags];
        if (userProfile.tags && userProfile.tags[index]) {
          newTags[index] = '#' + userProfile.tags[index];
        } else {
          newTags.splice(index, 1);
        }
        return newTags;
      });
      return;
    }
    
    // Check for duplicates (excluding the current index)
    const otherTags = tags
      .map((t, i) => i !== index ? t.trim().replace(/^#+/, '').toLowerCase() : null)
      .filter(t => t !== null);
    
    if (otherTags.includes(normalizedVal)) {
      setError("Tag already exists");
      setShowError(true);
      // Revert to previous value or remove if it was new
      setTags(prevTags => {
        const newTags = [...prevTags];
        if (userProfile.tags && userProfile.tags[index]) {
          newTags[index] = '#' + userProfile.tags[index];
        } else {
          newTags.splice(index, 1);
        }
        return newTags;
      });
      return;
    }

    // Clear any previous error only when validation passes
    if (error) {
      setError(null);
      setShowError(false);
    }
    
    setTags(prevTags => {
      const newTags = [...prevTags];
      newTags[index] = formattedVal;
      return newTags;
    });
  };

  const handleGenreChange = (newValue: string) => {
    setGender(newValue);
  };

  const handleSexualOrientationChange = (newValue: string) => {
    setSexualOrientation(newValue);
  };

  const handleSave = async () => {
    try {
      const tagsToSend = Array.from(new Set(tags
        .map(t => t.trim().replace(/^#+/, '').toLowerCase())
        .filter(t => t.length > 0)
      ));
      await replaceAllTags(tagsToSend);

      const updatedProfile = {
        ...userProfile,
        biography: bio,
        tags: tagsToSend,
        images,
        first_name: name,
        last_name: lastName,
        email,
        gender,
        sexual_preferences: sexualOrientation,
      };
      await updateUserProfile(updatedProfile);
      if (ctx && ctx.setUserProfile) {
        ctx.setUserProfile({ ...updatedProfile, tags: formatTags(tagsToSend) });
      }
      setTags(formatTags(tagsToSend));
      onSaveSuccess?.();
      onClose();
    } catch (error: any) {
      onSaveError?.(error.message || "An unknown error occurred.");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
      <div className="bg-pink-50 rounded-3xl p-6 mx-2 w-full max-w-2xl shadow-xl overflow-y-auto scroll-hidden max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-pink-600">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-3xl font-bold text-gray-400 hover:text-pink-600"
          >
            &times;
          </button>
          {error && (
            <MessageBox
              type="error"
              message={error}
              show={showError}
            />
          )}
        </div>

        <div className="mb-6 text-center">
          <img
            src={userProfile.main_img}
            alt="Avatar"
            className="mx-auto w-30 h-30 rounded-full object-cover bg-pink-200 mb-2"
          />
          <label className="text-pink-600 underline cursor-pointer">
            Update Profile Picture
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  try {
                    const oldMainImg = userProfile.main_img;
                    await uploadProfilePicture(e.target.files[0]);
                    // Reload profile
                    const { profile } = await fetchUserProfile();
                    // Remove the old profile picture from images array
                    if (oldMainImg) {
                      const newImages = images.filter(img => img !== oldMainImg);
                      setImages(newImages);
                    }
                    if (ctx && ctx.setUserProfile) {
                      ctx.setUserProfile({
                        ...profile,
                        images: images.filter(img => img !== oldMainImg)
                      });
                    }
                  } catch (error: any) {
                    onSaveError?.(error.message || "Error uploading profile picture");
                  }
                }
              }}
            />
          </label>
        </div>

        <div className="mb-6 flex flex-col justify-center items-center gap-2">
          <label className="block text-md font-medium mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write something about you..."
            className="w-full md:w-130 min-h-[2.5rem] p-2 rounded-md border border-pink-400 bg-pink-100 text-pink-600 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-y"
          />
        </div>
        
        {/* Map location selector */}
        {showManualLocation ? <MapSelector /> :        
        <Button onClick={() => setShowManualLocation(true)}>
          Change Location
        </Button>}
 

        <label className="block text-md font-medium mb-3 mt-3">Genre and sexual preference</label>
        <div className="mb-6 flex flex-col md:flex-row justify-center gap-4">
          <div className="relative">
            <Button
              variant="none"
              onClick={() => setShowGenderOptions(!showGenderOptions)}
              className="text-purple-600 bg-purple-200 border border-purple-600 rounded-3xl px-4 py-1"
            >
              {gender || "Select Gender"}
            </Button>
            {showGenderOptions && (
              <div className="absolute mt-2 w-full bg-white border border-gray-300 rounded-md shadow-md z-10">
                {["Male", "Female", "Non-binary"].map((option) => (
                  <div
                    key={option}
                    className="px-2 py-2 hover:bg-purple-100 cursor-pointer"
                    onClick={() => {
                      handleGenreChange(option);
                      setShowGenderOptions(false);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <Button
              variant="none"
              onClick={() => setShowOrientationOptions(!showOrientationOptions)}
              className="text-purple-600 bg-purple-200 border border-purple-600 rounded-3xl px-4 py-1"
            >
              {sexualOrientation || "Select Orientation"}
            </Button>
            {showOrientationOptions && (
              <div className="absolute mt-2 w-full bg-white border border-gray-300 rounded-md shadow-md z-10">
                {["Heterosexual", "Homosexual", "Bisexual"].map((option) => (
                  <div
                    key={option}
                    className="px-2 py-2 hover:bg-purple-100 cursor-pointer"
                    onClick={() => {
                      handleSexualOrientationChange(option);
                      setShowOrientationOptions(false);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-md font-medium mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 justify-center">
            {tags.map((tag, i) => (
              <ResizableInput key={i} value={tag} 
              onChange={(val) => handleTagChange(i, val)} 
              onCommit={(val) => handleCommitTag(i, val)}
              />
            ))}

            {tags.length < 5 && (
              <button
                onClick={() => {
                  if (tags.length < 5) setTags([...tags, "#"]);
                }}
                className="px-3 py-0.5 rounded-full border border-pink-400 bg-pink-100 text-pink-600 text-sm hover:bg-pink-200 transition"
              >
                +
              </button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-md font-medium mb-2">Images</label>
          <div className="flex flex-wrap gap-4 justify-center">
            {images
              .filter(img => img !== userProfile.main_img)
              .map((img, index) => (
                <div key={index} className="relative flex flex-col items-center gap-2">
                  <img
                    src={img}
                    alt=""
                    className="w-50 h-50 rounded-lg object-cover bg-pink-100 border"
                  />
                <div className="flex gap-2">
                  <Button
                    className="text-sm px-2 !py-1"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await deletePicture(img);
                        // update local state
                        const newImages = images.filter(image => image !== img);
                        setImages(newImages);
                        // update context
                        if (ctx && ctx.setUserProfile && userProfile) {
                          ctx.setUserProfile({
                            ...userProfile,
                            images: newImages
                          });
                        }
                      } catch (error: any) {
                        onSaveError?.(error.message || "Error deleting picture");
                      }
                    }}
                  >
                    Delete image
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-center">
            {images.filter(img => img !== userProfile.main_img).length < 4 && (
              <div>
                <Button
                  onClick={() =>
                    document.getElementById("new-image-upload")?.click()
                  }
                >
                  Upload Image
                </Button>
                <input
                  id="new-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      try {
                        const url = await uploadPicture(e.target.files[0]);
                        setImages([...images, url]);
                        e.target.value = "";
                        if (ctx && ctx.setUserProfile && userProfile) {
                          ctx.setUserProfile({
                            ...userProfile,
                            images: [...images, url]
                          });
                        }
                      } catch (error: any) {
                        onSaveError?.(error.message || "Error uploading picture");
                      }
                    }
                  }}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>

        <div className="my-8 space-y-4">
          <div>
            <label className="block text-md font-medium">First Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full md:w-120"
            />
          </div>
          <div>
            <label className="block text-md font-medium">Last Name</label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full md:w-120"
            />
          </div>
          <div>
            <label className="block text-md font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full md:w-120"
            />
          </div>
        </div>
          
        <div className="text-center">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}

