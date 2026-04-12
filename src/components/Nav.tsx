'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <nav className="border-b border-gray-800 bg-gray-950 px-8 py-5">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <a href="/" className="text-2xl font-bold text-yellow-400">HiveStage</a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <a href="/events" className="text-gray-400 hover:text-white text-sm transition-colors">Events</a>
          <a href="/bands" className="text-gray-400 hover:text-white text-sm transition-colors">Bands</a>
          <a href="/venues" className="text-gray-400 hover:text-white text-sm transition-colors">Venues</a>
          {!loading && (
            user ? (
              <a href="/dashboard" className="px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors text-sm">
                Dashboard
              </a>
            ) : (
              <>
                <a href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Log in</a>
                <a href="/signup" className="px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors text-sm">Sign up free</a>
              </>
            )
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-transform ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-transform ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4 flex flex-col gap-4">
          <a href="/events" className="text-gray-400 hover:text-white text-sm transition-colors" onClick={() => setOpen(false)}>Events</a>
          <a href="/bands" className="text-gray-400 hover:text-white text-sm transition-colors" onClick={() => setOpen(false)}>Bands</a>
          <a href="/venues" className="text-gray-400 hover:text-white text-sm transition-colors" onClick={() => setOpen(false)}>Venues</a>
          {!loading && (
            user ? (
              <a href="/dashboard" className="px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors text-sm text-center" onClick={() => setOpen(false)}>
                Dashboard
              </a>
            ) : (
              <>
                <a href="/login" className="text-gray-400 hover:text-white text-sm transition-colors" onClick={() => setOpen(false)}>Log in</a>
                <a href="/signup" className="px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors text-sm text-center" onClick={() => setOpen(false)}>Sign up free</a>
              </>
            )
          )}
        </div>
      )}
    </nav>
  )
}