"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/utils/api";

type User = {
  id: string;
  username: string;
  email: string;
  photoUrl: string;
};

export default function EditProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/Auth/CurrentUser");
        if (res.status === 200) {
          const data = {
            id: res.data.id,
            username: res.data.userName,
            email: res.data.email,
            photoUrl: res.data.imageUrl,
          };

          setUser(data);
          setNewUsername(data.username);
          console.log("User Data:", data); // Debugging: see user info
        }
      } catch {
        console.log("User not logged in");
      }
    };

    fetchUser();
  }, []);

  const handleUsernameUpdate = async () => {
    try {
      await api.put(`/User/${user.id}`, { id: user.id, userName: newUsername });
      setUser((prev) => prev && { ...prev, username: newUsername });
    } catch {
      console.error("Failed to update username");
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      setPreviewPhoto(URL.createObjectURL(file));
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhoto) return;
    const formData = new FormData();

    formData.append("file", selectedPhoto);

    try {
      if (!user) return;
      const res = await api.patch(`/User/${user.id}`, formData);

      if (res.status === 200) {
        setUser((prev) => prev && { ...prev, photoUrl: res.data.imageUrl });
        setSelectedPhoto(null);
        setPreviewPhoto(null);
      }
    } catch (err) {
      console.error("Photo upload failed");
    }
  };

  if (!user) return <div className="text-white p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center">
      <div className="bg-white text-black p-8 rounded-xl w-full max-w-md shadow-lg space-y-6">
        <h1 className="text-2xl font-semibold text-center">Edit Profile</h1>

        {/* Profile Photo */}
        <div className="flex flex-col items-center gap-3">
          <Image
            src={previewPhoto || user.photoUrl || "/image.png"}
            alt="Profile"
            width={96}
            height={96}
            className="rounded-full object-cover"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="text-sm"
          />
          <button
            onClick={handlePhotoUpload}
            disabled={!selectedPhoto}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            Change Photo
          </button>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="w-full border px-3 py-2 rounded text-black"
          />
          <button
            onClick={handleUsernameUpdate}
            className="mt-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Update Username
          </button>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full border px-3 py-2 rounded bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
