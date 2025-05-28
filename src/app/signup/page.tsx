'use client';

import { useState } from 'react';
import Link from 'next/link';

const sectors = ['Healthcare', 'Fintech', 'SaaS', 'EdTech', 'Gov Vendor', 'E-commerce'];
const locations = ['USA', 'EU', 'India', 'UK', 'Maryland', 'California'];
const dataTypes = ['PII', 'PHI', 'Payment Data', 'Children\'s Data', 'Biometric', 'Financial'];
const infraOptions = ['AWS', 'Azure', 'GCP', 'On-prem', 'Hybrid'];
const customerTypes = ['B2B', 'B2C', 'Government', 'Internal only'];
const orgSizes = ['1–10', '11–50', '51–250', '250+'];
const revenues = ['< $1M', '$1–10M', '$10–25M', '$25M+'];

export default function FormPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    sector: [] as string[],
    locations: [] as string[],
    customerLocations: [] as string[],
    dataTypes: [] as string[],
    infra: [] as string[],
    customerType: '',
    orgSize: '',
    revenue: '',
  });

  const [result, setResult] = useState<{ required: string[]; recommended: string[] } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (name: string, value: string) => {
    setFormData(prev => {
      const current = prev[name as keyof typeof formData] as string[];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [name]: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First, get recommendations
      const recResponse = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const recommendations = await recResponse.json();
      
      // Then, save user data and recommendations
      const signupResponse = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recommendations
        }),
      });
      
      const result = await signupResponse.json();
      
      if (signupResponse.ok) {
        // Redirect to recommendations page
        window.location.href = '/recommendations';
      } else {
        console.error('Signup failed:', result.error);
        alert('Signup failed: ' + (result.error || 'Please try again.'));
      }
    } catch (error) {
      console.error('Error during signup:', error);
      alert('An error occurred. Please try again.');
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
      <div className="flex-1 flex justify-center">
        <div className="max-w-3xl w-full p-6">
          <h1 className="text-3xl font-bold mb-6 text-center">GRC Framework Recommender</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Name */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="font-semibold block mb-2">Organization Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter your organization name"
                required
              />
            </div>

            {/* Email */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="font-semibold block mb-2">Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter your email address"
                required
              />
            </div>

            {/* Password */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="font-semibold block mb-2">Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Create a password"
                required
              />
            </div>

            {/* Sector */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="font-semibold block mb-2">Business Sector:</label>
              <div className="grid grid-cols-2 gap-2">
                {sectors.map(s => (
                  <label key={s} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      onChange={() => handleCheckbox('sector', s)}
                      checked={formData.sector.includes(s)}
                    /> {s}
                  </label>
                ))}
              </div>
            </div>


            {/* Locations */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="font-semibold block mb-2">Business Locations:</label>
              <div className="grid grid-cols-2 gap-2">
                {locations.map(loc => (
                  <label key={loc} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      onChange={() => handleCheckbox('locations', loc)}
                      checked={formData.locations.includes(loc)}
                    /> {loc}
                  </label>
                ))}
              </div>
            </div>

            {/* Customer Locations */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="font-semibold block mb-2">Customer Locations:</label>
              <div className="grid grid-cols-2 gap-2">
                {locations.map(loc => (
                  <label key={loc} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      onChange={() => handleCheckbox('customerLocations', loc)}
                      checked={formData.customerLocations.includes(loc)}
                    /> {loc}
                  </label>
                ))}
              </div>
            </div>

            {/* Data Types */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="font-semibold block mb-2">Data Types:</label>
              <div className="grid grid-cols-2 gap-2">
                {dataTypes.map(d => (
                  <label key={d} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      onChange={() => handleCheckbox('dataTypes', d)}
                      checked={formData.dataTypes.includes(d)}
                    /> {d}
                  </label>
                ))}
              </div>
            </div>

            {/* Infra */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="font-semibold block mb-2">Infrastructure:</label>
              <div className="grid grid-cols-2 gap-2">
                {infraOptions.map(i => (
                  <label key={i} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      onChange={() => handleCheckbox('infra', i)}
                      checked={formData.infra.includes(i)}
                    /> {i}
                  </label>
                ))}
              </div>
            </div>

            {/* Customer Type */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="font-semibold block mb-2">Customer Type:</label>
              <select
                name="customerType"
                value={formData.customerType}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Customer Type</option>
                {customerTypes.map(ct => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            {/* Org Size */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="font-semibold block mb-2">Organization Size:</label>
              <select
                name="orgSize"
                value={formData.orgSize}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Organization Size</option>
                {orgSizes.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Revenue */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="font-semibold block mb-2">Revenue Bracket:</label>
              <select
                name="revenue"
                value={formData.revenue}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Revenue Bracket</option>
                {revenues.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition">
              Sign Up
            </button>
          </form>

          {result && (
            <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h2 className="font-bold text-xl mb-4 text-blue-800">Your Compliance Recommendations</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-blue-700">Required Frameworks:</h3>
                  <p className="text-gray-800">{result.required.join(', ') || 'None'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-700">Recommended Frameworks:</h3>
                  <p className="text-gray-800">{result.recommended.join(', ') || 'None'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
