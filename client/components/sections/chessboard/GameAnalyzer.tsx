// components/GameAnalyzer.tsx
"use client";

import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

type AnalyzedMove = {
  moveNumber: number;
  actualMove: string; // e.g. "e2e4"
  recommendedMove: string; // e.g. "e2e4" or "g1f3"
  isPerfect: boolean;
};

type Props = {
  moves: AnalyzedMove[];
};

export default function GameAnalyzer({ moves }: Props) {
  const [chess] = useState(new Chess());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [boardPosition, setBoardPosition] = useState("start");

  useEffect(() => {
    chess.reset();
    for (let i = 0; i <= currentIndex; i++) {
      chess.move({
        from: moves[i].actualMove.slice(0, 2),
        to: moves[i].actualMove.slice(2, 4),
      });
    }
    setBoardPosition(chess.fen());
  }, [currentIndex, moves, chess]);

  const currentMove = moves[currentIndex];

  const goNext = () => {
    if (currentIndex < moves.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Chessboard position={boardPosition} arePiecesDraggable={false} />
      <div className="text-center">
        <h2 className="text-lg font-semibold">Move {currentMove.moveNumber}</h2>
        <p>
          <strong>Actual:</strong> {currentMove.actualMove}{" "}
          {!currentMove.isPerfect && (
            <>
              | <strong>Recommended:</strong> {currentMove.recommendedMove}
            </>
          )}
        </p>
        <p>
          <span
            className={`font-bold ${
              currentMove.isPerfect ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {currentMove.isPerfect ? "Perfect Move" : "Could Be Better"}
          </span>
        </p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          ← Prev
        </button>
        <button
          onClick={goNext}
          disabled={currentIndex === moves.length - 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
