import { useEffect, useRef, useState } from "react";
import { useProfile } from "./useProfile";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";

const ResizableInput = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [inputWidth, setInputWidth] = useState(0);

  useEffect(() => {
    if (spanRef.current) {
      const width = spanRef.current.offsetWidth;
      setInputWidth(width + 4);
    }
  }, [value]);

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
        }}
        style={{ width: `${inputWidth}px` }}
        className="text-sm px-2 py-0.5 rounded-full border border-pink-400 bg-pink-100 text-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
      />
    </div>
  );
};

interface EditProfileModalProps {
  onClose: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (msg: string) => void;
}

export default function EditProfileModal({ onClose, onSaveSuccess, onSaveError }: EditProfileModalProps) {
  const { userProfile } = useProfile();

  if (!userProfile) return <div>Loading...</div>;

  const [bio, setBio] = useState(userProfile.bio || "");
  const [tags, setTags] = useState(userProfile.tags || []);
  const [images, setImages] = useState(userProfile.images || []);
  const [name, setName] = useState(userProfile.name || "");
  const [lastName, setLastName] = useState(userProfile.last_name || "");
  const [email, setEmail] = useState(userProfile.email || "");
  const [username, setUsername] = useState(userProfile.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleTagChange = (index: number, newValue: string) => {
    const newTags = [...tags];
    newTags[index] = newValue;
    setTags(newTags);
  };

  const handleImageChange = (index: number, file: File) => {
    const newImages = [...images];
    newImages[index] = URL.createObjectURL(file);
    setImages(newImages);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

const handleSave = async () => {
  try {
    // TODO: UPDATE in backend
    const success = Math.random() > 0.4; // testing

    if (!success) {
      throw new Error("Failed to update profile. Please try again.");
    }
    onSaveSuccess?.();
    onClose();
  } catch (error: any) {
    onSaveError?.(error.message || "An unknown error occurred.");
    onClose();
  }
};

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-pink-50 rounded-3xl p-6 mx-2 w-full max-w-2xl shadow-xl overflow-y-auto scroll-hidden max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-pink-600">Edit Profile</h2>
          <button onClick={onClose} className="text-3xl font-bold text-gray-400 hover:text-pink-600">&times;</button>
        </div>

        {/* Avatar */}
        <div className="mb-6 text-center">
          <img
            src={userProfile.main_img}
            alt="Avatar"
            className="mx-auto w-30 h-30 rounded-full object-cover bg-pink-200 mb-2"
          />
          <label className="text-pink-600 underline cursor-pointer">
            Update Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                /* if (e.target.files && e.target.files[0]) { TODO update main_img
                  handleMainImageChange(0, e.target.files[0]);
                } */
              }}
            />
          </label>
        </div>

        {/* Bio */}
        <div className="mb-6 flex flex-col justify-center items-center gap-2">
          <label className="block text-md font-medium mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write something about you..."
            className="w-full md:w-130 min-h-[2.5rem] p-2 rounded-md border border-pink-400 bg-pink-100 text-pink-600 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-y"
          />
          <Button>Save</Button>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="block text-md font-medium mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 justify-center">
            {tags.map((tag, i) => (
              <ResizableInput
                key={i}
                value={tag}
                onChange={(val) => handleTagChange(i, val)}
              />
            ))}

            {Array.from({ length: 5 - tags.length }).map((_, i) => (
              <button
                key={`add-${i}`}
                onClick={() => setTags([...tags, "#"])}
                className="px-3 py-0.5 rounded-full border border-pink-400 bg-pink-100 text-pink-600 text-sm hover:bg-pink-200 transition"
              >
                +
              </button>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="mb-6">
          <label className="block text-md font-medium mb-2">Images</label>
          <div className="flex flex-wrap gap-4 justify-center">
            {images.map((img, index) => (
              <div key={index} className="relative flex flex-col items-center gap-2">
                <img src={img} alt="" className="w-50 h-50 rounded-lg object-cover bg-pink-100 border" />
                <div className="flex gap-2">
                  <Button className="text-sm px-2 !py-1" variant="outline" onClick={() => removeImage(index)}>
                    Delete image
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {/* Upload button */}
          <div className="mt-4 flex justify-center">
            {images.length < 4 && (
              <div>
                <Button
                  onClick={() => document.getElementById("new-image-upload")?.click()}
                >
                  Upload Image
                </Button>
                <input
                  id="new-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageChange(images.length, e.target.files[0]);
                      e.target.value = ""; // Permitir volver a subir el mismo archivo
                    }
                  }}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>

        {/* Personal Info */}
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
          <div>
            <label className="block text-md font-medium">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full md:w-120"
            />
          </div>
        </div>

        {/* Password Change */}
        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-500">Change Password</h3>
          <div>
            <label className="block text-md font-medium">Current Password</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full md:w-120"
            />
          </div>
          <div>
            <label className="block text-md font-medium">New Password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full md:w-120"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="text-center">
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
