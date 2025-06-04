'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Framework {
  id: string;
  name: string;
  selected: boolean;
}

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/user-recommendations', {
          credentials: 'include',
          cache: 'no-store',
        });
        setIsLoggedIn(response.ok);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        setIsLoggedIn(false);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  if (isLoggedIn) {
    return (
      <main className="min-h-screen flex flex-col bg-white text-gray-900">
        <div className="w-full p-4 flex justify-end">
          <button
            onClick={handleLogout}
            className="border border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-50 transition"
          >
            Log Out
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center -mt-20">
          <div className="text-center max-w-xl px-6 mb-8">
            <h1 className="text-4xl font-bold mb-4">Welcome to GRC Recommender</h1>
            <p className="text-lg text-gray-600 mb-8">
              Discover which compliance frameworks your organization needs and track your roadmap to full compliance — all in one place.
            </p>
            <button
              onClick={() => router.push('/recommendations')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition text-lg"
            >
              Go to Recommendations
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Non-logged-in users see the marketing/landing page
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="w-full p-4 flex justify-end">
        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/signup')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition cursor-pointer z-10 relative"
          >
            Sign Up
          </button>
          <button 
            onClick={() => router.push('/login')}
            className="border border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-50 transition cursor-pointer z-10 relative"
          >
            Log In
          </button>
        </div>
      </div>
      <div className="h-[calc(100vh-80px)] flex items-center justify-center -mt-20">
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



