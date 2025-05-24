'use client';

import { useState } from 'react';

const sectors = ['Healthcare', 'Fintech', 'SaaS', 'EdTech', 'Gov Vendor', 'E-commerce'];
const locations = ['USA', 'EU', 'India', 'UK', 'Maryland', 'California'];
const dataTypes = ['PII', 'PHI', 'Payment Data', 'Children\'s Data', 'Biometric', 'Financial'];
const infraOptions = ['AWS', 'Azure', 'GCP', 'On-prem', 'Hybrid'];
const customerTypes = ['B2B', 'B2C', 'Government', 'Internal only'];
const orgSizes = ['1–10', '11–50', '51–250', '250+'];
const revenues = ['< $1M', '$1–10M', '$10–25M', '$25M+'];

export default function FormPage() {
  const [formData, setFormData] = useState({
    sector: '',
    locations: [] as string[],
    customerLocations: [] as string[],
    dataTypes: [] as string[],
    infra: '',
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
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">GRC Framework Recommender</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sector */}
        <select name="sector" value={formData.sector} onChange={handleChange} className="w-full p-2 border">
          <option value="">Select Sector</option>
          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Locations */}
        <div>
          <label className="font-semibold">Business Locations:</label>
          {locations.map(loc => (
            <label key={loc} className="block">
              <input
                type="checkbox"
                onChange={() => handleCheckbox('locations', loc)}
                checked={formData.locations.includes(loc)}
              /> {loc}
            </label>
          ))}
        </div>

        {/* Customer Locations */}
        <div>
          <label className="font-semibold">Customer Locations:</label>
          {locations.map(loc => (
            <label key={loc} className="block">
              <input
                type="checkbox"
                onChange={() => handleCheckbox('customerLocations', loc)}
                checked={formData.customerLocations.includes(loc)}
              /> {loc}
            </label>
          ))}
        </div>

        {/* Data Types */}
        <div>
          <label className="font-semibold">Data Types:</label>
          {dataTypes.map(d => (
            <label key={d} className="block">
              <input
                type="checkbox"
                onChange={() => handleCheckbox('dataTypes', d)}
                checked={formData.dataTypes.includes(d)}
              /> {d}
            </label>
          ))}
        </div>

        {/* Infra */}
        <select name="infra" value={formData.infra} onChange={handleChange} className="w-full p-2 border">
          <option value="">Select Infrastructure</option>
          {infraOptions.map(i => <option key={i} value={i}>{i}</option>)}
        </select>

        {/* Customer Type */}
        <select name="customerType" value={formData.customerType} onChange={handleChange} className="w-full p-2 border">
          <option value="">Select Customer Type</option>
          {customerTypes.map(ct => <option key={ct} value={ct}>{ct}</option>)}
        </select>

        {/* Org Size */}
        <select name="orgSize" value={formData.orgSize} onChange={handleChange} className="w-full p-2 border">
          <option value="">Select Organization Size</option>
          {orgSizes.map(o => <option key={o} value={o}>{o}</option>)}
        </select>

        {/* Revenue */}
        <select name="revenue" value={formData.revenue} onChange={handleChange} className="w-full p-2 border">
          <option value="">Select Revenue Bracket</option>
          {revenues.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
      </form>

      {result && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h2 className="font-bold text-xl mb-2">Results</h2>
          <p><strong>Required:</strong> {result.required.join(', ') || 'None'}</p>
          <p><strong>Recommended:</strong> {result.recommended.join(', ') || 'None'}</p>
        </div>
      )}
    </div>
  );
}
