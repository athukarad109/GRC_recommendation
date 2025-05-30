'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RecommendationsPage() {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<{
    required: string[];
    recommended: string[];
  } | null>(null);
  const [error, setError] = useState('');
  const [selectedFrameworks, setSelectedFrameworks] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch('/api/user-recommendations', { credentials: 'include' });
        if (!response.ok) {
          if (response.status === 401) {
            router.replace('/login');
            return;
          }
          const data = await response.json();
          setError(data.error || 'Failed to fetch recommendations');
          setLoading(false);
          return;
        }
        const data = await response.json();
        setRecommendations(data);
        // By default, select all required frameworks, and none of the recommended
        const initialSelection: { [key: string]: boolean } = {};
        data.required.forEach((fw: string) => { initialSelection[fw] = true; });
        data.recommended.forEach((fw: string) => { initialSelection[fw] = false; });
        setSelectedFrameworks(initialSelection);
        setLoading(false);
      } catch (error) {
        setError('An error occurred. Please try again.');
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, [router]);

  const handleFrameworkToggle = (framework: string) => {
    setSelectedFrameworks(prev => ({ ...prev, [framework]: !prev[framework] }));
  };

  const handleGenerateChecklist = async () => {
    const selectedFws = Object.entries(selectedFrameworks)
      .filter(([_, selected]) => selected)
      .map(([fw]) => fw);
    
    if (selectedFws.length === 0) {
      alert('Please select at least one framework');
      return;
    }

    try {
      const response = await fetch('/api/custom-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frameworks: selectedFws }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate checklist');
      }

      // Store the selected frameworks in localStorage for the checklist page
      localStorage.setItem('selectedFrameworks', JSON.stringify(selectedFws));
      
      // Navigate to the checklist page
      router.push('/checklist');
    } catch (err) {
      console.error('Failed to generate checklist:', err);
      alert('Failed to generate checklist. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        window.location.href = '/';
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

  return (
    <main className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Top navigation bar */}
      <div className="w-full p-4 flex justify-between border-b">
        <h1 className="text-2xl font-bold">GRC Recommender</h1>
        <button 
          onClick={handleLogout}
          className="border border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-50 transition"
        >
          Log Out
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex justify-center">
        <div className="max-w-3xl w-full p-6">
          <h2 className="text-3xl font-bold mb-6 text-center">Select Your Compliance Frameworks</h2>
          {error ? (
            <p className="text-red-600 text-center">{error}</p>
          ) : recommendations ? (
            <div className="space-y-8">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-xl text-blue-700 mb-4">Required Frameworks</h3>
                <div className="space-y-2">
                  {recommendations.required.map((framework, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`required-${framework}`}
                        checked={!!selectedFrameworks[framework]}
                        onChange={() => handleFrameworkToggle(framework)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor={`required-${framework}`} className="ml-2 text-gray-800">
                        {framework}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="font-semibold text-xl text-green-700 mb-4">Recommended Frameworks</h3>
                <div className="space-y-2">
                  {recommendations.recommended.map((framework, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`recommended-${framework}`}
                        checked={!!selectedFrameworks[framework]}
                        onChange={() => handleFrameworkToggle(framework)}
                        className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                      <label htmlFor={`recommended-${framework}`} className="ml-2 text-gray-800">
                        {framework}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <button
                  onClick={handleGenerateChecklist}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
                >
                  Generate Custom Checklist
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

