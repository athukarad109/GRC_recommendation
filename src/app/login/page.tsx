'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include' // Important for cookies
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      
      console.log('Login successful, redirecting to recommendations');
      
      // Use window.location for a full page refresh to ensure cookie is applied
      window.location.href = '/recommendations';
    } catch (error) {
      console.error('Error during login:', error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Top navigation bar */}
      <div className="w-full p-4 flex justify-end">
        <div className="flex gap-4">
          <Link href="/">
            <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-50 transition">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
      
      {/* Form content */}
      <div className="flex-1 flex justify-center items-center">
        <div className="max-w-md w-full p-6 bg-gray-50 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-center">Log In</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-semibold block mb-2">Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label className="font-semibold block mb-2">Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition">
              Log In
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <p>Don't have an account? <Link href="/signup" className="text-blue-600 hover:underline">Sign Up</Link></p>
          </div>
        </div>
      </div>
    </main>
  );
}

