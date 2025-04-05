// pages/game-analysis.tsx
"use client";
import api from "@/utils/api";
import { useEffect, useState } from "react";
import GameAnalyzer from "@/components/sections/chessboard/GameAnalyzer";

type AnalyzedMove = {
  moveNumber: number;
  actualMove: string;
  recommendedMove: string;
  isPerfect: boolean;
};

export default function GameAnalysisPage() {
  const [analyzedMoves, setAnalyzedMoves] = useState<AnalyzedMove[] | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      const rawMoves = localStorage.getItem("game_analysis");

      if (!rawMoves) {
        setError("No game moves found in localStorage.");
        return;
      }

      try {
        console.log("rawMoves", rawMoves);
        const response = await api.post("/Stockfish/analyzeGame", {
          moves: rawMoves,
        });
        console.log("response", response.data);
        setAnalyzedMoves(response.data);
      } catch (err: any) {
        setError(err.message || "Unexpected error");
      }
    };

    fetchAnalysis();
  }, []);

  if (error) return <p className="text-red-500 text-9xl">{error}</p>;

  if (!analyzedMoves) return <p>Loading analysis...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-center">Game Analysis</h1>
      <div className="w-1/3 h-1/3 mx-auto">
        <GameAnalyzer moves={analyzedMoves} />
      </div>
    </div>
  );
}
