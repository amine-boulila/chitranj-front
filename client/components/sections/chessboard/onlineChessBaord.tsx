"use client";

import React, { useState, useEffect, useRef } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { io, Socket } from "socket.io-client";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Copy, Check, Send } from "lucide-react";

export default function ChessGame({ playerName }: { playerName: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId");

  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [highlightedSquares, setHighlightedSquares] = useState<{
    [key: string]: { backgroundColor: string };
  }>({});
  const [moveLog, setMoveLog] = useState<string[]>([]);
  const [gameOverAlert, setGameOverAlert] = useState<string | null>(null);

  // Player-related states
  const [socket, setSocket] = useState<Socket | null>(null);
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [gameLink, setGameLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [opponentName, setOpponentName] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [joinSubmitted, setJoinSubmitted] = useState(false);

  // Chat-related states
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{
      message: string;
      sender: string;
      timestamp: string;
      isOwnMessage: boolean;
    }>
  >([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(
      process.env.NEXT_PUBLIC_SOCKET_URL ||
        "https://expresssocket-c15a.onrender.com"
    );
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to socket server");
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Handle game connection logic
  useEffect(() => {
    if (!socket || !playerName) return;

    // Auto-join game if gameId exists in URL
    if (gameId && playerName && !joinSubmitted) {
      joinGame();
    }

    // Listen for game events
    socket.on("gameJoined", ({ color, hostName, currentFen }) => {
      setPlayerColor(color);
      if (currentFen) {
        setGame(new Chess(currentFen));
      }

      if (color === "b") {
        setOpponentName(hostName);
        setOpponentConnected(true);
        setGameStarted(true);
      } else {
        setWaitingForOpponent(true);
      }
    });

    socket.on("opponentJoined", ({ opponentName }) => {
      setOpponentName(opponentName);
      setOpponentConnected(true);
      setWaitingForOpponent(false);
      setGameStarted(true);
    });

    socket.on("opponentDisconnected", () => {
      setOpponentConnected(false);
      setOpponentName("");
      // Add a system message in chat
      setChatMessages((prev) => [
        ...prev,
        {
          message: "Your opponent has disconnected",
          sender: "System",
          timestamp: new Date().toISOString(),
          isOwnMessage: false,
        },
      ]);
    });

    socket.on("gameMove", ({ fen, move }) => {
      const newGame = new Chess(fen);
      setGame(newGame);

      // Add move to log
      const formattedMove = `${move.from}${move.to}`;

      setMoveLog((prevLog) => [...prevLog, formattedMove]);
    });

    socket.on("gameReset", () => {
      resetGame(false);
      // Add a system message in chat
      setChatMessages((prev) => [
        ...prev,
        {
          message: "Game has been reset",
          sender: "System",
          timestamp: new Date().toISOString(),
          isOwnMessage: false,
        },
      ]);
    });

    // Add chat message listener
    socket.on("receiveMessage", ({ message, sender, timestamp }) => {
      setChatMessages((prevMessages) => [
        ...prevMessages,
        {
          message,
          sender,
          timestamp,
          isOwnMessage: sender === playerName,
        },
      ]);
    });

    socket.on("error", ({ message }) => {
      alert(message);
      setJoinSubmitted(false);
    });

    return () => {
      socket.off("gameJoined");
      socket.off("opponentJoined");
      socket.off("opponentDisconnected");
      socket.off("gameMove");
      socket.off("gameReset");
      socket.off("receiveMessage");
      socket.off("error");
    };
  }, [socket, gameId, playerName, joinSubmitted]);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Check game status after each move
  useEffect(() => {
    const status = getGameStatus();
    if (game.isGameOver()) {
      setGameOverAlert(status);
    } else {
      setGameOverAlert(null);
    }
  }, [game]);

  // Create a new game and generate a shareable link
  const createNewGame = () => {
    if (!socket || !playerName) return;

    const newGameId = uuidv4();
    socket.emit("createGame", { gameId: newGameId, playerName });

    // Generate shareable URL
    const gameUrl = `${window.location.origin}${window.location.pathname}?gameId=${newGameId}`;
    setGameLink(gameUrl);

    // Update URL without reloading
    window.history.pushState({}, "", `?gameId=${newGameId}`);
    setPlayerColor("w");
    setWaitingForOpponent(true);
    resetGame(true);
    setJoinSubmitted(true);
  };

  // Join an existing game
  const joinGame = () => {
    if (!socket || !gameId || !playerName) return;
    socket.emit("joinGame", { gameId, playerName });
    setJoinSubmitted(true);
  };

  // Copy game link to clipboard
  const copyGameLink = () => {
    navigator.clipboard.writeText(gameLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetGame = (emitReset = true) => {
    const newGame = new Chess();
    setGame(newGame);
    setSelectedSquare(null);
    setHighlightedSquares({});
    setMoveLog([]);
    setGameOverAlert(null);

    if (emitReset && socket && gameId && playerColor === "w") {
      socket.emit("resetGame", { gameId });
    }
  };

  // Send chat message
  const sendMessage = () => {
    if (!socket || !gameId || !message.trim() || !playerName) return;

    socket.emit("sendMessage", {
      gameId,
      message: message.trim(),
      playerName,
    });

    setMessage("");
  };

  // Handle Enter key press in chat
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
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

  function makeMove(
    move: string | { from: string; to: string; promotion?: string }
  ): boolean {
    // If not player's turn or waiting for opponent, don't allow move
    if (playerColor !== game.turn() || !opponentConnected) {
      return false;
    }

    try {
      const newGame = new Chess(game.fen());
      const nextMove = newGame.move(move);

      if (nextMove) {
        // Broadcast move to opponent
        if (socket && gameId) {
          socket.emit("makeMove", {
            gameId,
            fen: newGame.fen(),
            move: nextMove,
          });
        }

        setGame(newGame);
        setSelectedSquare(null);
        setHighlightedSquares({});

        // Format move with turn number

        const formattedMove = `${nextMove.from}${nextMove.to}`;

        setMoveLog((prevLog) => [...prevLog, formattedMove]);
        return true;
      }
    } catch (error) {
      console.error("Invalid move:", error);
    }
    return false;
  }

  const onSquareClick = (square: Square) => {
    // If game is over or not player's turn, don't allow further moves
    if (game.isGameOver() || playerColor !== game.turn() || !opponentConnected)
      return;

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
        if (
          piece &&
          piece.color === game.turn() &&
          piece.color === playerColor
        ) {
          selectSquare(square);
        }
      }
    } else {
      // First square selection - only select if it contains a piece of the current turn
      const piece = game.get(square as Square);
      if (piece && piece.color === game.turn() && piece.color === playerColor) {
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
      const whiteMove = moveLog[i];
      const blackMove = i + 1 < moveLog.length ? moveLog[i + 1] : "";
      formattedLog.push(
        <div key={i} className="flex justify-between py-1 border-b">
          <span className="w-1/2">{whiteMove}</span>
          <span className="w-1/2">{blackMove}</span>
        </div>
      );
    }
    return formattedLog;
  };

  // Format timestamp for chat
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getGameStatusDisplay = () => {
    if (!playerName) {
      return "No player name provided";
    }
    if (waitingForOpponent) {
      return "Waiting for opponent to join...";
    }
    if (opponentConnected) {
      return `Playing as ${
        playerColor === "w" ? "White" : "Black"
      } against ${opponentName}`;
    }
    return "Start a new game or join using a link";
  };

  const handleAnalyzeGame = async () => {
    try {
      // You may already have this in memory, or fetch it from backend

      localStorage.setItem("game_analysis", moveLog.join(" "));
      router.push("/game-analyzer");
    } catch (err) {
      console.error("Failed to analyze game:", err);
    }
  };
  // If no player name is provided, return a message
  if (!playerName) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Chess Game</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4">
              <p className="text-lg font-medium mb-2">
                Player name is required to start a game
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render main game interface and options to create/join game
  if (!gameStarted && !joinSubmitted) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Chess - Play with Friends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-lg">
                Welcome, <span className="font-medium">{playerName}</span>
              </div>

              <div className="flex flex-col gap-4">
                <Button onClick={createNewGame} className="w-full">
                  Create New Game
                </Button>

                {gameId && (
                  <Button onClick={joinGame} className="w-full">
                    Join Game
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto flex flex-col h-screen">
      {/* Game status and link sharing */}
      {waitingForOpponent && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="text-lg font-medium">
                Waiting for opponent to join...
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Input value={gameLink} readOnly className="flex-1" />
                <Button onClick={copyGameLink} size="sm" variant="outline">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-6 flex-grow">
        {/* Left side - Chessboard */}
        <div className="md:w-1/2">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>Chess</CardTitle>
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">
                  {getGameStatusDisplay()}
                </span>
                {playerColor === "w" && opponentConnected && (
                  <Button onClick={() => resetGame(true)}>New Game</Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="aspect-square">
                <Chessboard
                  position={game.fen()}
                  boardOrientation={playerColor === "b" ? "black" : "white"}
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

        {/* Right side - Move log and Chat */}
        <div className="md:w-1/2 flex flex-col gap-4">
          {/* Move Log */}
          <Card className="h-1/2">
            <CardHeader className="pb-2">
              <CardTitle>Move History</CardTitle>
            </CardHeader>
            <CardContent
              className="overflow-y-auto"
              style={{ maxHeight: "250px" }}
            >
              <div className="flex justify-between font-bold mb-2 border-b pb-2">
                <span className="w-1/2">White</span>
                <span className="w-1/2">Black</span>
              </div>
              {moveLog.length > 0 ? (
                formatMoveLog()
              ) : (
                <p className="text-gray-500 italic">No moves yet</p>
              )}
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="h-1/2 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col overflow-hidden p-0">
              {/* Chat Messages */}
              <div
                ref={chatContainerRef}
                className="flex-grow overflow-y-auto p-4 space-y-2"
                style={{ maxHeight: "250px" }}
              >
                {chatMessages.length > 0 ? (
                  chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col ${
                        msg.isOwnMessage ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-3/4 rounded-lg px-3 py-2 ${
                          msg.sender === "System"
                            ? "bg-gray-200 text-center w-full italic"
                            : msg.isOwnMessage
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        {msg.sender !== "System" && (
                          <div className="text-xs font-semibold mb-1">
                            {msg.isOwnMessage ? "You" : msg.sender}
                          </div>
                        )}
                        <div>{msg.message}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-center py-4">
                    No messages yet
                  </p>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-2 border-t">
                <div className="flex items-center gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    disabled={!opponentConnected && !waitingForOpponent}
                    className="flex-grow"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={
                      !message.trim() ||
                      (!opponentConnected && !waitingForOpponent)
                    }
                    size="sm"
                  >
                    <Send size={16} />
                  </Button>
                </div>
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
                {playerColor === "w" && (
                  <Button onClick={() => resetGame(true)}>New Game</Button>
                )}
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
