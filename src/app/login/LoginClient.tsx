'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginClient({ events }: { events: any[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
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
            <p className="text-2xl font-semibold text-white leading-tight mb-2">Utah's home for<br/>live music</p>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">Discover shows, connect with bands<br/>and venues across Utah.</p>

            {/* Dynamic events */}
            <div className="space-y-3">
              {events.length > 0 ? events.map((event: any, i: number) => {
                const date = new Date(event.event_date)
                const bandName = event.event_bands?.[0]?.bands?.profiles?.display_name
                const venueName = event.venues?.profiles?.display_name
                const city = event.venues?.city
                const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                const colors = ['#facc15', '#4ade80']
                return (
                  <div key={event.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[i % 2] }} />
                    <div>
                      <p className="text-white text-sm font-medium">{event.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {dateStr}
                        {city ? ` · ${city}` : ''}
                        {event.is_free ? ' · Free' : ' · Tickets'}
                      </p>
                    </div>
                  </div>
                )
              }) : (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <p className="text-gray-500 text-sm">No upcoming events yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form side */}
        <div className="w-full md:w-96 bg-gray-900 p-10 flex flex-col justify-center">
          <div className="md:hidden mb-8">
            <h1 className="text-3xl font-bold text-yellow-400">HiveStage</h1>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-8">Log in to your HiveStage account</p>

          <div className="space-y-4">
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

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>

            <p className="text-center text-gray-500 text-sm">
              <a href="/forgot-password" className="text-yellow-400 hover:underline">Forgot password?</a>
            </p>

            <p className="text-center text-gray-500 text-sm">
              No account?{' '}
              <a href="/signup" className="text-yellow-400 hover:underline">Sign up free</a>
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}