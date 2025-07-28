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
        console.error('Login error:', error)
        setError(error.message)
      } else {
        setSubmitted(true)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Failed to send magic link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-100">
        <div className="p-10 border border-gray-700 rounded-xl shadow-2xl bg-gray-800 text-center max-w-lg">
          <p className="text-xl">Check your email for a magic link to sign in!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-100">
      <form onSubmit={handleLogin} className="p-10 border border-gray-700 rounded-xl shadow-2xl bg-gray-800 w-full max-w-sm">
        <h1 className="text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          Login to Pitch Writer
        </h1>
        <p className="mb-6 text-center text-gray-400">
          Enter your email to receive a secure magic link.
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}
        <input
          type="email"
          placeholder="Your Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-5"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 text-white font-semibold rounded-lg transition-colors duration-300 ${
            loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700'
          }`}
        >
          {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
        </button>
      </form>
    </div>
  )
}