"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
// import Link from "next/link";
import Image from "next/image";
import api from "@/utils/api";
import Navbar from "@/components/navbar";

const LandingPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRedirect = async () => {
    setLoading(true);
    try {
      const response = await api.get("/Auth/CurrentUser");

      if (response.status === 200) {
        const data = response;
        console.log("User Data:", data); // Debugging: see user info
        router.push("/choose-game"); // Redirect if authenticated
      } else {
        router.push("/sign-up"); // Redirect if not authenticated
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push("/sign-up"); // Redirect to Sign-Up if error occurs
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="h-screen text-white flex items-center justify-center px-16">
        <div className="flex items-center w-full max-w-6xl">
          <div className="w-1/2">
            <h1
              className="text-5xl font-thin text-green-900"
              style={{ fontFamily: "Times New Roman, Serif" }}
            >
              TAKE YOUR CHESS GAME TO THE NEXT LEVEL WITH CHIRANJ
            </h1>
            <p className="mt-4 text-lg text-gray-400">
              Connect with top-ranked chess players from around the world and
              learn the secrets to becoming a chess master with CHITRANJI.
            </p>
            <div className="mt-6">
              <button
                onClick={handleRedirect}
                className="px-6 py-3 bg-green-900 text-white rounded-lg text-lg"
                disabled={loading}
              >
                {loading ? "Checking..." : "Become A Master"}
              </button>
            </div>
          </div>
          <div className="w-1/2 flex justify-end">
            <Image
              src="/landing.png"
              alt="Chess Board"
              width={700}
              height={700}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
