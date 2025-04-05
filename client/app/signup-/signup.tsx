"use client";
import Link from "next/link";
export default function Signup() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow-md">
        <h2 className="text-center text-3xl font-bold text-gray-900 font-serif">Create an account</h2>
        <p className="text-center text-gray-600">Sign up to get started!</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              placeholder="Password"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring"
            />
          </div>

          <button className="w-full rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-700">
            Sign Up
          </button>

          <button className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 hover:bg-gray-100">
            <img src="\google.png" alt="Google" className="h-5 w-5" />
            Sign up with Google
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-green-800 hover:underline">
    Log in
  </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
