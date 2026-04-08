'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [accountType, setAccountType] = useState<'band' | 'venue' | 'fan'>('fan')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          account_type: accountType,
        }
      }
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message || 'Signup failed')
      setLoading(false)
      return
    }

    // Create band or venue row
    if (accountType === 'band') {
      await supabase.from('bands').insert({ profile_id: data.user.id })
    } else if (accountType === 'venue') {
      await supabase.from('venues').insert({ profile_id: data.user.id })
    }

    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-yellow-400 mb-2">HiveStage</h1>
        <p className="text-gray-400 mb-8">Create your account</p>

        <div className="space-y-4">
          <input
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
            placeholder="Display name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
          />
          <input
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
            placeholder="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <div>
            <p className="text-gray-400 text-sm mb-2">I am a...</p>
            <div className="grid grid-cols-3 gap-2">
              {(['fan', 'band', 'venue'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setAccountType(type)}
                  className={`py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    accountType === type
                      ? 'bg-yellow-400 text-gray-950'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full py-3 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-gray-500 text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-yellow-400 hover:underline">Log in</a>
          </p>
        </div>
      </div>
    </main>
  )
}