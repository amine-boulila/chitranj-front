"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import api from "@/utils/api";

type User = {
  username: string;
  photoUrl: string;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/Auth/CurrentUser");
        if (res.status === 200) {
          const data = {
            username: res.data.userName,
            photoUrl: res.data.imageUrl,
          };
          setUser(data);
        }
      } catch {
        console.log("User not logged in");
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await api.post("/Auth/logout");
    setUser(null);
  };

  // 👇 Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="flex justify-end items-center p-4 border-b">
      {!user ? (
        <Link
          href="/sign-in"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Sign In
        </Link>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <span>{user.username}</span>
            <Image
              src={user.photoUrl || "/image.png"}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full"
            />
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
              <Link
                href="/profile/edit"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
