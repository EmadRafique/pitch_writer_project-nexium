'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Icon components for better UI feedback
const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

export default function CreatePitchPage() {
  const [formData, setFormData] = useState({
    title: '',
    problem: '',
    solution: '',
    targetAudience: '',
  });
  const [loading, setLoading] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState('');
  const [error, setError] = useState('');
  const [session, setSession] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false); // State for copy button feedback
  const router = useRouter();

  useEffect(() => {
    async function getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            setSession(session.access_token);
        } else {
            router.push('/login');
        }
    }
    getSession();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Function to handle copying the pitch text to the clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPitch);
    setIsCopied(true);
    // Reset the "Copied!" message after 2 seconds
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedPitch('');

    if (!session) {
        setError('User not authenticated. Please log in again.');
        setLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate pitch. Please try again.');
      }

      const data = await response.json();
      setGeneratedPitch(data.pitch);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-100">
        <p className="text-xl animate-pulse">Generating your pitch with AI...</p>
      </div>
    );
  }

  if (generatedPitch) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8 font-sans">
        <div className="p-6 sm:p-8 max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
          <div className="pitch-result-container">
            <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">
              Your AI-Generated Pitch
            </h1>
            <div className="whitespace-pre-wrap text-gray-300 leading-relaxed bg-gray-900/50 p-6 rounded-lg border border-gray-600">{generatedPitch}</div>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => {
                  setGeneratedPitch('');
                  setFormData({ title: '', problem: '', solution: '', targetAudience: '' });
                }}
                className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105"
              >
                Create Another Pitch
              </button>
              {/* --- NEW COPY BUTTON --- */}
              <button
                onClick={handleCopy}
                className={`flex items-center justify-center font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 ${
                  isCopied
                    ? 'bg-green-600 text-white'
                    : 'bg-teal-500 text-white hover:bg-teal-600'
                }`}
              >
                {isCopied ? <CheckIcon /> : <CopyIcon />}
                {isCopied ? 'Copied!' : 'Copy Pitch'}
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8 font-sans">
      <div className="p-6 sm:p-8 max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Create a New Pitch
        </h1>
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Pitch Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Q3 Marketing Pitch for SaaS Product"
              required
              className="mt-1 block w-full p-3 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            />
          </div>
          <div>
            <label htmlFor="problem" className="block text-sm font-medium text-gray-300 mb-2">Problem Statement</label>
            <textarea
              id="problem"
              name="problem"
              rows={4}
              value={formData.problem}
              onChange={handleChange}
              placeholder="e.g., Sales teams struggle to find qualified leads and spend too much time on manual outreach."
              required
              className="mt-1 block w-full p-3 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            ></textarea>
          </div>
          <div>
            <label htmlFor="solution" className="block text-sm font-medium text-gray-300 mb-2">Solution / Your Idea</label>
            <textarea
              id="solution"
              name="solution"
              rows={4}
              value={formData.solution}
              onChange={handleChange}
              placeholder="e.g., An AI-powered platform that analyzes market data to identify ideal customer profiles and automates personalized email campaigns."
              required
              className="mt-1 block w-full p-3 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            ></textarea>
          </div>
          <div>
            <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-300 mb-2">Target Audience (Optional)</label>
            <input
              type="text"
              id="targetAudience"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleChange}
              placeholder="e.g., Enterprise B2B software companies"
              className="mt-1 block w-full p-3 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            />
          </div>
          <div className="text-center pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center py-3 px-6 border border-transparent shadow-lg text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition-all duration-200 transform hover:scale-105"
            >
              Generate Pitch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
