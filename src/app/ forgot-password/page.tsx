'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleReset() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://www.hivestage.live/reset-password',
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-yellow-400 mb-2">HiveStage</h1>
        <p className="text-gray-400 mb-8">Reset your password</p>

        {sent ? (
          <div className="text-center">
            <p className="text-green-400 mb-4">Check your email for a reset link!</p>
            <a href="/login" className="text-yellow-400 hover:underline text-sm">Back to login</a>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
              placeholder="Your email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full py-3 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
            <p className="text-center text-gray-500 text-sm">
              <a href="/login" className="text-yellow-400 hover:underline">Back to login</a>
            </p>
          </div>
        )}
      </div>
    </main>
  )
}