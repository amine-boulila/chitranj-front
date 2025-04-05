"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";

const ChooseGamePage = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [gameId, setGameId] = useState("");
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    const checkAuthentication = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/Auth/CurrentUser");
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setIsAuthenticated(false);
        setError("Failed to verify authentication. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // Redirect if the user is not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/not-logged-in");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white text-black">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error message if there is one
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-white text-black">
        <div className="text-center p-6 bg-gray-100 rounded-lg shadow-lg max-w-md">
          <div className="text-4xl mb-4 text-red-600">⚠️</div>
          <h2 className="text-2xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Return null while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Functions to handle game options
  const handleCreateGame = () => {
    router.push("/online-chessboard");
  };

  const handleJoinGame = () => {
    setShowJoinModal(true);
  };

  const handlePlayLocally = () => {
    router.push("/chessboard");
  };

  const closeModal = () => {
    setShowJoinModal(false);
    setGameId("");
    setJoinError("");
  };

  // Function to extract game ID from input (handles both full URL and raw ID)
  const extractGameId = (input: string) => {
    // Check if input is empty
    if (!input || input.trim() === "") {
      return null;
    }

    // Check if the input is a URL
    if (input.includes("gameId=")) {
      try {
        // Try to extract the gameId parameter from the URL
        const url = new URL(input);
        const params = new URLSearchParams(url.search);
        return params.get("gameId");
      } catch {
        // If URL parsing fails, try regex extraction
        const match = input.match(/gameId=([0-9a-fA-F-]+)/);
        return match ? match[1] : input;
      }
    }

    // If not a URL, return the input as is
    return input;
  };

  const handleJoinGameSubmit = () => {
    const extractedId = extractGameId(gameId);

    if (!extractedId) {
      setJoinError("Please enter a valid game ID");
      return;
    }

    // Validate game ID format (uuid)
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(extractedId)) {
      setJoinError("Invalid game ID format");
      return;
    }

    // Redirect to the game with the provided ID
    router.push(`/online-chessboard?gameId=${extractedId}`);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white text-black px-4">
      <h1 className="text-4xl font-bold mb-8 text-black">Choose Your Game</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <button
          onClick={handlePlayLocally}
          className="flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg p-8 shadow-lg transition-colors h-64 border border-gray-300"
        >
          <div className="text-5xl mb-4">👥</div>
          <h2 className="text-2xl font-semibold mb-2">Play Locally</h2>
          <p className="text-center text-gray-600">
            Play chess with a friend on the same device
          </p>
        </button>

        <button
          onClick={handleCreateGame}
          className="flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg p-8 shadow-lg transition-colors h-64 border border-gray-300"
        >
          <div className="text-5xl mb-4">🎮</div>
          <h2 className="text-2xl font-semibold mb-2">Create Game</h2>
          <p className="text-center text-gray-600">
            Create a new online game and invite others
          </p>
        </button>

        <button
          onClick={handleJoinGame}
          className="flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg p-8 shadow-lg transition-colors h-64 border border-gray-300"
        >
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold mb-2">Join Game</h2>
          <p className="text-center text-gray-600">
            Join an existing game with a code
          </p>
        </button>
      </div>

      {/* Join Game Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Join Game</h2>
            <div className="mb-4">
              <label
                htmlFor="gameId"
                className="block text-sm font-medium mb-2"
              >
                Enter Game ID or URL
              </label>
              <input
                type="text"
                id="gameId"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                placeholder="ID or full game URL"
                className="w-full px-4 py-2 rounded-md bg-white border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
                autoFocus
              />
              {joinError && (
                <p className="text-red-600 text-sm mt-2">{joinError}</p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                You can paste either a game ID (e.g.,
                fb9cd63a-8ce4-4148-99c2-fd7dbb335507) or a full game URL
              </p>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinGameSubmit}
                className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChooseGamePage;
