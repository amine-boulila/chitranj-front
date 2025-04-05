import React from "react";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow-md">
          <h2 className="text-center text-3xl font-bold text-gray-900 font-serif">
            Welcome back
          </h2>
          <p className="text-center text-gray-600">
            Welcome back! Please enter your details.
          </p>
          {children}
        </div>
      </div>
    </>
  );
}

export default layout;
