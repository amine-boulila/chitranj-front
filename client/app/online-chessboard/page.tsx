"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnlineChessBoard from "@/components/sections/chessboard/onlineChessBaord";
import api from "@/utils/api";

function ChessboardPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await api.get("/Auth/CurrentUser");
        if (response.status === 200) {
          // Extract player name from the response
          if (response.data.userName) {
            setPlayerName(response.data.userName);
          } else {
            // Use a default name if name is not in the response
            setPlayerName("Player");
          }
          setIsLoading(false);
        } else {
          // Redirect if not authenticated
          router.push("/not-logged-in");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        router.push("/not-logged-in");
      }
    };

    checkAuthentication();
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <OnlineChessBoard playerName={playerName} />
    </div>
  );
}

export default ChessboardPage;
