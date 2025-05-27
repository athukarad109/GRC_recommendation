'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white text-gray-900">
      <div className="w-full p-4 flex justify-end">
        <div className="flex gap-4">
          <Link href="/signup">
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
              Sign Up
            </button>
          </Link>
          <Link href="/login">
            <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-50 transition">
              Log In
            </button>
          </Link>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-xl px-6">
          <h1 className="text-4xl font-bold mb-4">Welcome to GRC Recommender</h1>
          <p className="text-lg text-gray-600 mb-6">
            Discover which compliance frameworks your organization needs and track your roadmap to full compliance — all in one place.
          </p>
        </div>
      </div>
    </main>
  );
}



