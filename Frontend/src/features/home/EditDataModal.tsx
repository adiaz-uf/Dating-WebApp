import { useEffect, useRef, useState } from "react";
import { useProfile } from "../profile/useProfile";
import { useProfileContext } from "../profile/ProfileContext";
import { Button } from "../../components/Button";
import { MessageBox } from "../../components/MessageBox";
import { updateUserProfile, fetchUserProfile } from "../../api/profile_service";
import { uploadProfilePicture, uploadPicture, deletePicture } from "../../api/picture_service";
import { suggestTags, replaceAllTags } from "../../api/tag_service";

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
        className="text-sm px-2.5 py-1 rounded-full border border-pink-400 bg-pink-100 text-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="fixed left-1/2 -translate-x-1/2 min-w-[220px] w-max max-w-[350px] bg-white border border-pink-300 rounded-2xl shadow-lg z-50 max-h-48 overflow-auto flex flex-col"
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

interface EditDataModalProps {
  onClose: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (msg: string) => void;
}

export default function EditDataModal({
  onClose,
  onSaveSuccess,
  onSaveError,
}: EditDataModalProps) {
  const { userProfile } = useProfile();
  const ctx = (() => { try { return useProfileContext(); } catch { return null; } })();

  if (!userProfile) return <div>Loading...</div>;

  // Parse date format to yyyy-MM-dd
  function toDateInputValue(date: string | Date | undefined): string {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  }

  const [birth_date, setBirthdate] = useState(toDateInputValue(userProfile.birth_date));
  const [bio, setBio] = useState(userProfile.biography || "");
  const formatTags = (arr: string[] = []) => arr.map(t => t.startsWith('#') ? t : '#' + t.replace(/^#+/, ''));
  const [tags, setTags] = useState(formatTags(userProfile.tags));
  const [images, setImages] = useState(userProfile.images || []);
  const [gender, setGender] = useState(userProfile.gender || "");
  const [sexualOrientation, setSexualOrientation] = useState(userProfile.sexual_preferences || "");
  const [showGenderOptions, setShowGenderOptions] = useState(false);
  const [showOrientationOptions, setShowOrientationOptions] = useState(false);
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
    const updatedTags = [...tags];
    updatedTags[index] = formattedVal;
    const normalizedTags = updatedTags.map((t) => t.trim().replace(/^#+/, '').toLowerCase());
    if (normalizedVal.length <= 0 || normalizedTags.filter(t => t === normalizedVal).length > 1) {
      setError("Empty or existing tag");
      return;
    }
    setTags(updatedTags);
  };


  const handleGenreChange = (newValue: string) => {
    setGender(newValue);
  };

  const handleSexualOrientationChange = (newValue: string) => {
    setSexualOrientation(newValue);
  };

  const handleSave = async () => {
    try {
      /* if (!userProfile.main_img) { TODO: Modal validations
        setError("Please upload a profile picture");
        return;
      }

      if (!bio) {
        setError("Please add a biography");
        return;
      }

      if (!birth_date) {
        setError("Please select your birth date");
        return;
      }

      if (!gender) {
        setError("Please select your gender");
        return;
      }

      if (!sexualOrientation) {
        setError("Please select your sexual orientation");
        return;
      }


      if (!tags || tags.length === 0 || tags.every(t => !t || t.trim().length <= 1)) {
        setError("Please add at least one tag");
        return;
      } */

      if (!birth_date) {
        setBirthdate(toDateInputValue(new Date()));
        /* setError("Please select your birth date");
        return; */
      }

      const tagsToSend = tags
        .map(t => t.trim().replace(/^#+/, ''))
        .filter(t => t.length > 0);
      await replaceAllTags(tagsToSend);

      const updatedProfile = {
        ...userProfile,
        biography: bio,
        birth_date,
        tags: tagsToSend,
        images,
        gender,
        sexual_preferences: sexualOrientation,
        completed_profile: true,
      };
      await updateUserProfile(updatedProfile);
      if (ctx && ctx.setUserProfile) {
        ctx.setUserProfile({ ...updatedProfile, tags: formatTags(tagsToSend) });
      }
      setTags(formatTags(tagsToSend));
      onSaveSuccess?.();
      onClose();
    } catch (error: any) {
      setError(error.message || "An unknown error occurred.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-pink-50 rounded-3xl p-6 mx-2 w-full max-w-2xl shadow-xl overflow-y-auto scroll-hidden max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-pink-600">Welcome to Matcha!</h2>
        </div>

        <label className="block text-2xl font-semibold text-pink-600 mb-5">
        Please, complete your profile.
        </label>

        <div className="mb-6 text-center">
          <img
            src={userProfile.main_img}
            alt=""
            className="mx-auto w-30 h-30 rounded-full object-cover bg-pink-200 mb-2"
          />
          <label className="text-pink-600 underline cursor-pointer">
            Select an Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  try {
                    await uploadProfilePicture(e.target.files[0]);
                    // Reload profile
                    const { profile } = await fetchUserProfile();
                    if (ctx && ctx.setUserProfile) {
                      ctx.setUserProfile(profile);
                    }
                  } catch (error: any) {
                    onSaveError?.(error.message || "Error uploading profile picture");
                  }
                }
              }}
            />
          </label>
        </div>

        <div className="mb-6 text-center">
          <label className="block text-md font-medium mb-1 text-pink-600">Birthdate</label>
          <input
              type="date"
              value={birth_date}
              onChange={(e) => setBirthdate(e.target.value)}
              className="px-4 py-2 border border-pink-400 rounded-md text-pink-600 bg-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
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
        <label className="block text-md font-medium mb-2">Genre and sexual preference</label>
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
              .filter(img => img !== userProfile.main_img) // Filtrar la foto de perfil
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
                        // local state
                        const newImages = images.filter(image => image !== img);
                        setImages(newImages);
                        // context
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

        <div className="flex flex-col items-center gap-4">
          {error && (
            <MessageBox
              type="error"
              message={error}
              show={showError}
            />
          )}
          <div className="text-center">
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
