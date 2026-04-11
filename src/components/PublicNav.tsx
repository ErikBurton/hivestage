import { createClient } from '@/lib/supabase/server'

export default async function PublicNav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="border-b border-gray-800 bg-gray-950 px-8 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="text-xl font-bold text-yellow-400">HiveStage</a>
          <div className="hidden md:flex items-center gap-6">
            <a href="/events" className="text-gray-400 hover:text-white text-sm transition-colors">Events</a>
            <a href="/bands" className="text-gray-400 hover:text-white text-sm transition-colors">Bands</a>
            <a href="/venues" className="text-gray-400 hover:text-white text-sm transition-colors">Venues</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <a href="/dashboard" className="px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors text-sm">
              Dashboard
            </a>
          ) : (
            <>
              <a href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">
                Log in
              </a>
              <a href="/signup" className="px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors text-sm">
                Sign up free
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}