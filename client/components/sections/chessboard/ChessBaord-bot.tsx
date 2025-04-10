"use client";

import React, { useState, useEffect } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
export default function ChessGame() {
  const router = useRouter();
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [highlightedSquares, setHighlightedSquares] = useState<{
    [key: string]: { backgroundColor: string };
  }>({});
  const [moveLog, setMoveLog] = useState<string[]>([]);
  const [gameOverAlert, setGameOverAlert] = useState<string | null>(null);

  // Check game status after each move
  useEffect(() => {
    const status = getGameStatus();
    if (game.isGameOver()) {
      setGameOverAlert(status);
    } else {
      setGameOverAlert(null);
    }
  }, [game]);

  const resetGame = () => {
    setGame(new Chess());
    setSelectedSquare(null);
    setHighlightedSquares({});
    setMoveLog([]);
    setGameOverAlert(null);
  };

  const getGameStatus = () => {
    if (game.isGameOver()) {
      if (game.isCheckmate())
        return `Checkmate! ${game.turn() === "w" ? "Black" : "White"} wins!`;
      if (game.isDraw()) return "Draw!";
      if (game.isStalemate()) return "Stalemate!";
      if (game.isThreefoldRepetition()) return "Draw by threefold repetition!";
      if (game.isInsufficientMaterial())
        return "Draw by insufficient material!";
      return "Game Over!";
    }
    if (game.inCheck()) return "Check!";
    return `${game.turn() === "w" ? "White" : "Black"} to move`;
  };

  async function makeMove(
    move: string | { from: string; to: string; promotion?: string }
  ): Promise<boolean> {
    try {
      const newGame = new Chess(game.fen());
      const nextMove = newGame.move(move);

      if (nextMove) {
        setGame(newGame);
        setSelectedSquare(null);
        setHighlightedSquares({});

        const formattedMove = `${nextMove.from}${nextMove.to}`;
        const updatedMoveLog = [...moveLog, formattedMove];
        setMoveLog(updatedMoveLog);
        console.log("Move Log:", moveLog.join(" "));
        // Request analysis with the updated move log
        const response = await api.post("/Stockfish/bestmove", {
          moves: moveLog.join(" ") + ` ${formattedMove}`,
        });
        // Extract bestMove from response
        const bestMove = response?.data?.bestMove;
        if (bestMove && bestMove.length === 4) {
          const aiMove = {
            from: bestMove.slice(0, 2),
            to: bestMove.slice(2, 4),
            promotion: "q", // optional: promote to queen
          };

          // Play the best move
          const aiGame = new Chess(newGame.fen());
          const aiNextMove = aiGame.move(aiMove);
          if (aiNextMove) {
            setGame(aiGame);
            const aiFormatted = `${aiNextMove.from}${aiNextMove.to}`;
            setMoveLog((log) => [...log, aiFormatted]);
          }
        }

        return true;
      }
    } catch (error) {
      console.error("Invalid move:", error);
    }
    return false;
  }

  const onSquareClick = (square: Square) => {
    // If game is over, don't allow further moves
    if (game.isGameOver()) return;

    if (selectedSquare === square) {
      // Deselect if the same square is clicked again
      setSelectedSquare(null);
      setHighlightedSquares({});
    } else if (selectedSquare) {
      // Try to make a move if a square was already selected
      const moveSuccessful = makeMove({
        from: selectedSquare,
        to: square,
        promotion: "q", // Default to queen for promotion
      });

      if (!moveSuccessful) {
        // If move failed, select the new square if it contains a piece
        const piece = game.get(square as Square);
        if (piece && piece.color === game.turn()) {
          selectSquare(square);
        }
      }
    } else {
      // First square selection - only select if it contains a piece of the current turn
      const piece = game.get(square as Square);
      if (piece && piece.color === game.turn()) {
        selectSquare(square);
      }
    }
  };

  const selectSquare = (square: Square) => {
    setSelectedSquare(square);

    // Get possible moves for the selected square
    const moves = game.moves({ square, verbose: true });
    const highlights: { [key: string]: { backgroundColor: string } } = {};

    // Highlight selected square
    highlights[square] = { backgroundColor: "rgba(255, 255, 0, 0.4)" };

    // Highlight possible moves
    moves.forEach((move) => {
      highlights[move.to] = { backgroundColor: "rgba(0, 255, 0, 0.4)" };
    });

    setHighlightedSquares(highlights);
  };

  // Format move log into readable columns
  const formatMoveLog = () => {
    const formattedLog = [];
    for (let i = 0; i < moveLog.length; i += 2) {
      const whiteMove = `${i / 2 + 1} ${moveLog[i]}`;
      const blackMove =
        i + 1 < moveLog.length ? `${i / 2 + 1} ${moveLog[i + 1]}` : "";
      formattedLog.push(
        <div key={i} className="flex justify-between py-1 border-b">
          <span className="w-1/2">{whiteMove}</span>
          <span className="w-1/2">{blackMove}</span>
        </div>
      );
    }
    // console.log(" Move Log:", moveLog);
    return formattedLog;
  };
  const handleAnalyzeGame = async () => {
    try {
      localStorage.setItem("game_analysis", moveLog.join(" "));
      router.push("/game-analyzer");
    } catch (err) {
      console.error("Failed to analyze game:", err);
    }
  };
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side - Chessboard */}
        <div className="md:w-1/2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Chess</CardTitle>
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">{getGameStatus()}</span>
                <Button onClick={resetGame}>New Game</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-square">
                <Chessboard
                  position={game.fen()}
                  onPieceDrop={(source, target) =>
                    makeMove({ from: source, to: target, promotion: "q" })
                  }
                  onSquareClick={onSquareClick}
                  customSquareStyles={{
                    ...highlightedSquares,
                    ...(selectedSquare
                      ? {
                          [selectedSquare]: {
                            backgroundColor: "rgba(255, 255, 0, 0.4)",
                          },
                        }
                      : {}),
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Move log */}
        <div className="md:w-1/2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Move History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-y-auto max-h-96">
                <div className="flex justify-between font-bold mb-2 border-b pb-2">
                  <span className="w-1/2">White</span>
                  <span className="w-1/2">Black</span>
                </div>
                {moveLog.length > 0 ? (
                  formatMoveLog()
                ) : (
                  <p className="text-gray-500 italic">No moves yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Game over alert */}
      {gameOverAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Alert className="max-w-md">
            <div className="flex justify-between items-center">
              <AlertTitle className="text-xl font-bold">
                {gameOverAlert}
              </AlertTitle>
              <button
                onClick={() => setGameOverAlert(null)}
                className="p-1 rounded-full hover:bg-gray-200"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <AlertDescription>
              <p className="mb-4">
                Game has ended. Would you like to play again?
              </p>
              <div className="flex justify-end gap-2">
                <div className="flex justify-end">
                  <Button onClick={resetGame}>New Game</Button>
                </div>{" "}
                <Button variant="outline" onClick={handleAnalyzeGame}>
                  Analyze Game
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
