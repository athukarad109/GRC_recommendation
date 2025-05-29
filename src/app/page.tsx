'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [recommendations, setRecommendations] = useState<{
    required: string[];
    recommended: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch('/api/user-recommendations', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            setIsLoggedIn(false);
            setLoading(false);
            return;
          }
          
          const data = await response.json();
          setError(data.error || 'Failed to fetch recommendations');
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        setRecommendations(data);
        setIsLoggedIn(true);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setError('An error occurred. Please try again.');
        setLoading(false);
      }
    }
    
    fetchRecommendations();
  }, []);

  const handleLogout = async () => {
    try {
      // Clear state first
      setIsLoggedIn(false);
      setRecommendations(null);
      setError('');
      setLoading(false);

      // Then make the logout request
      const response = await fetch('/api/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Force a hard refresh of the page
        router.refresh();
        router.push('/');
      } else {
        console.error('Logout failed:', await response.text());
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
        {/* Top navigation bar */}
        <div className="w-full p-4 flex justify-between items-center border-b">
          <h1 className="text-2xl font-bold">GRC Recommender</h1>
          <div className="flex gap-4">
            <button 
              onClick={handleLogout}
              className="border border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-50 transition"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Compliance Dashboard</h2>
              
              {error ? (
                <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
                  {error}
                </div>
              ) : recommendations ? (
                <div className="space-y-8">
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-xl text-blue-700 mb-4">Required Frameworks</h3>
                    {recommendations.required.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-2">
                        {recommendations.required.map((framework, index) => (
                          <li key={index} className="text-gray-800">{framework}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">No required frameworks for your organization.</p>
                    )}
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-xl text-green-700 mb-4">Recommended Frameworks</h3>
                    {recommendations.recommended.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-2">
                        {recommendations.recommended.map((framework, index) => (
                          <li key={index} className="text-gray-800">{framework}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">No recommended frameworks for your organization.</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Landing page for non-logged-in users
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



