import Link from "next/link";
import React from "react";

function Page() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white text-black px-4">
      <div className="max-w-md w-full bg-gray-100 rounded-lg p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">
          Authentication Required
        </h1>
        <p className="text-lg text-center mb-8 text-gray-600">
          You need to sign up or log in to access this page.
        </p>
        <div className="flex flex-col gap-4">
          <Link
            href="/sign-up"
            className="w-full py-3 bg-black hover:bg-gray-800 text-white rounded-lg text-center font-semibold transition-colors"
          >
            Sign Up
          </Link>
          <Link
            href="/sign-in"
            className="w-full py-3 bg-black hover:bg-gray-800 text-white rounded-lg text-center font-semibold transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Page;
