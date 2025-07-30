'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        throw error;
      }
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <div className="starry-bg">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>
      <div className="relative z-10 w-full max-w-md">
        {submitted ? (
          <div className="glass-card-deep p-10 text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-400">✨ Magic Link Sent! ✨</h2>
            <p className="text-gray-300">A sign-in link has been sent to <br/><span className="font-semibold text-white">{email}</span>.</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="glass-card-deep p-10 space-y-6">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-green-300">
                🎯 Pitch Writer AI 🎯
                </h1>
                <p className="mt-2 text-gray-400">
                ✨ The future of compelling pitches is here. ✨
                </p>
            </div>
            
            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-300 text-sm text-center">{error}</p>
              </div>
            )}
            
            <div>
                <label htmlFor="email" className="sr-only">Email Address</label>
                <input
                    id="email"
                    type="email"
                    placeholder="Your Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-600 rounded-lg bg-slate-800/60 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '📤 Sending...' : '📤 Send Magic Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
