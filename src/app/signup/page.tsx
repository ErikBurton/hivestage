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

    if (accountType === 'band') {
      await supabase.from('bands').insert({ profile_id: data.user.id })
    } else if (accountType === 'venue') {
      await supabase.from('venues').insert({ profile_id: data.user.id })
    }

    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex rounded-3xl overflow-hidden shadow-2xl">

        {/* Hero side */}
        <div className="hidden md:flex flex-1 bg-gray-950 flex-col justify-end p-10 relative border-r border-gray-800">
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <g fill="none" stroke="#facc15" strokeWidth="0.8">
              {[0,1,2,3,4,5].map(row =>
                [0,1,2,3,4,5,6].map(col => {
                  const x = col * 60 + (row % 2 === 0 ? 0 : 30)
                  const y = row * 52
                  const pts = [
                    `${x+30},${y}`,
                    `${x+60},${y+17}`,
                    `${x+60},${y+51}`,
                    `${x+30},${y+68}`,
                    `${x},${y+51}`,
                    `${x},${y+17}`,
                  ].join(' ')
                  return <polygon key={`${row}-${col}`} points={pts} />
                })
              )}
            </g>
          </svg>

          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-yellow-400 mb-3">HiveStage</h1>
            <p className="text-2xl font-semibold text-white leading-tight mb-2">Join Utah's live<br/>music community</p>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">Whether you're a band, venue, or fan —<br/>HiveStage connects Utah's music scene.</p>

            <div className="space-y-3">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-gray-950 font-bold text-sm shrink-0">🎸</div>
                <div>
                  <p className="text-white text-sm font-medium">For bands</p>
                  <p className="text-gray-500 text-xs mt-0.5">Post shows, build your following</p>
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-gray-950 font-bold text-sm shrink-0">🏟️</div>
                <div>
                  <p className="text-white text-sm font-medium">For venues</p>
                  <p className="text-gray-500 text-xs mt-0.5">Manage your calendar, find talent</p>
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-gray-950 font-bold text-sm shrink-0">🎟️</div>
                <div>
                  <p className="text-white text-sm font-medium">For fans</p>
                  <p className="text-gray-500 text-xs mt-0.5">Discover live music near you</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form side */}
        <div className="w-full md:w-96 bg-gray-900 p-10 flex flex-col justify-center">
          <div className="md:hidden mb-8">
            <h1 className="text-3xl font-bold text-yellow-400">HiveStage</h1>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
          <p className="text-gray-500 text-sm mb-8">Free forever — no credit card needed</p>

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

      </div>
    </main>
  )
}