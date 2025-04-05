"use client"; 
import Link from "next/link";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow-md">
        <h2 className="text-center text-3xl font-bold text-gray-900 font-serif">Welcome back</h2>
        <p className="text-center text-gray-600">Welcome back! Please enter your details.</p>

        <div className="space-y-4">
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

          <div className="text-right">
            <a href="#" className="text-sm text-green-800 hover:underline">
              Forgot password
            </a>
          </div>

          <Link href="/landing">
  <a className="w-full rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-700 text-center block">
    Login
  </a>
</Link>


          <button className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 hover:bg-gray-100">
            <img src="\google.png" alt="Google" className="h-5 w-5" />
            Sign in with Google
          </button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium text-green-800 hover:underline">
    Sign up for free
  </Link>
          </p>
        </div>
      </div>
    </div>
  );
}