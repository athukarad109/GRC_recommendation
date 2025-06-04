'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChecklistItem } from '../../types/controls';

export default function ChecklistPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Get selected frameworks from localStorage
    const storedFrameworks = localStorage.getItem('selectedFrameworks');
    if (!storedFrameworks) {
      router.replace('/recommendations');
      return;
    }

    const frameworks = JSON.parse(storedFrameworks);
    setSelectedFrameworks(frameworks);

    // Fetch the checklist
    async function fetchChecklist() {
      try {
        const response = await fetch('/api/custom-checklist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ frameworks }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch checklist');
        }

        const data = await response.json();
        setChecklist(data.checklist);
        setLoading(false);
      } catch (error) {
        setError('Failed to load checklist. Please try again.');
        setLoading(false);
      }
    }

    fetchChecklist();
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        localStorage.removeItem('selectedFrameworks');
        window.location.href = '/';
      } else {
        console.error('Logout failed:', await response.text());
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Group controls by category
  const groupedControls = checklist.reduce((acc, control) => {
    if (!acc[control.category]) {
      acc[control.category] = [];
    }
    acc[control.category].push(control);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

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

      {/* Two-panel layout */}
      <div className="flex-1 flex">
        {/* Left panel - Selected Frameworks */}
        <div className="w-1/3 p-6 border-r overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Selected Frameworks</h2>
          {error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <div className="space-y-4">
              {selectedFrameworks.map((framework, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-800">{framework}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel - Checklist */}
        <div className="w-2/3 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Compliance Checklist</h2>
          {error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedControls).map(([category, controls]) => (
                <div key={category} className="bg-white rounded-lg border">
                  <h3 className="text-lg font-semibold p-4 bg-gray-50 border-b">
                    {category}
                  </h3>
                  <div className="divide-y">
                    {controls.map((control) => (
                      <div key={control.id} className="p-4">
                        <div className="flex items-start">
                          <input
                            type="checkbox"
                            id={control.id}
                            className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <label htmlFor={control.id} className="font-medium text-gray-900">
                              {control.text}
                            </label>
                            {control.description && (
                              <p className="mt-1 text-sm text-gray-500">
                                {control.description}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2">
                              {control.frameworks.map((framework) => (
                                <span
                                  key={framework}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {framework}
                                </span>
                              ))}
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  control.priority === 'high'
                                    ? 'bg-red-100 text-red-800'
                                    : control.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {control.priority} priority
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}