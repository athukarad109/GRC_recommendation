'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RecommendationsPage() {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<{
    required: string[];
    recommended: string[];
  } | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch('/api/user-recommendations');
        
        if (!response.ok) {
          if (response.status === 401) {
            // Redirect to login if unauthorized
            router.push('/login');
            return;
          }
          
          const data = await response.json();
          setError(data.error || 'Failed to fetch recommendations');
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        setRecommendations(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setError('An error occurred. Please try again.');
        setLoading(false);
      }
    }
    
    fetchRecommendations();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Top navigation bar */}
      <div className="w-full p-4 flex justify-between">
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
      
      {/* Content */}
      <div className="flex-1 flex justify-center">
        <div className="max-w-3xl w-full p-6">
          <h2 className="text-3xl font-bold mb-6 text-center">Your Compliance Recommendations</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <p>Loading recommendations...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
              {error}
            </div>
          ) : recommendations ? (
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-xl text-blue-700 mb-2">Required Frameworks:</h3>
                  {recommendations.required.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {recommendations.required.map((framework, index) => (
                        <li key={index} className="text-gray-800">{framework}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600">No required frameworks for your organization.</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-xl text-blue-700 mb-2">Recommended Frameworks:</h3>
                  {recommendations.recommended.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {recommendations.recommended.map((framework, index) => (
                        <li key={index} className="text-gray-800">{framework}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600">No recommended frameworks for your organization.</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
