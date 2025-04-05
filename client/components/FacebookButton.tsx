"use client";
import React, { useState } from "react";
const FacebookSignupButton = () => {
  const handleFacebookSignup = () => {
    setIsLoading(true);
  };
  const [isLoading, setIsLoading] = useState(false);

  return (
    <button
      onClick={handleFacebookSignup}
      className={`flex w-full items-center justify-center gap-4 rounded-full border border-stroke bg-gray-2 p-[15px] font-medium hover:bg-opacity-50 ${
        isLoading ? "cursor-not-allowed opacity-50" : ""
      }`}
      disabled={isLoading}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="#1877F2"
        className={`h-5 w-5 rounded-m ${isLoading ? "animate-spin" : ""}`}
      >
        <path d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.462.099 2.794.143v3.24h-1.917c-1.504 0-1.796.715-1.796 1.763v2.31h3.592l-.467 3.622h-3.125V24h6.116c.729 0 1.322-.593 1.322-1.326V1.326C24 .593 23.407 0 22.675 0z" />
      </svg>
      {isLoading ? "Loading..." : `sign-up with Google`}
    </button>
  );
};

export default FacebookSignupButton;
