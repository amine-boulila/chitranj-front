import React from "react";
import ChessboardComponent from "@/components/sections/chessboard/ChessBaord";
function page() {
  return (
    <div>
      <h1>chess board </h1>
      <div className="w-full">
        <ChessboardComponent />
      </div>
    </div>
  );
}

export default page;
