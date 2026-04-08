import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-1">HiveStage</h1>
        <p className="text-gray-500 text-sm mb-8">Welcome back, {profile?.display_name}</p>

        <div className="grid gap-4">
          {profile?.account_type === 'band' && (
            <a href="/dashboard/band" className="bg-gray-900 rounded-2xl p-6 hover:bg-gray-800 transition-colors">
              <p className="font-semibold text-lg">🎸 Band Profile</p>
              <p className="text-gray-400 text-sm mt-1">Edit your bio, genres, and city</p>
            </a>
          )}
          {profile?.account_type === 'venue' && (
            <a href="/dashboard/venue" className="bg-gray-900 rounded-2xl p-6 hover:bg-gray-800 transition-colors">
              <p className="font-semibold text-lg">🏟️ Venue Profile</p>
              <p className="text-gray-400 text-sm mt-1">Edit your location and details</p>
            </a>
          )}
          <a href="/dashboard/events/new" className="bg-gray-900 rounded-2xl p-6 hover:bg-gray-800 transition-colors">
            <p className="font-semibold text-lg">🎟️ Post an Event</p>
            <p className="text-gray-400 text-sm mt-1">Add a show to the calendar</p>
          </a>
          <a href="/events" className="bg-gray-900 rounded-2xl p-6 hover:bg-gray-800 transition-colors">
            <p className="font-semibold text-lg">🔍 Browse Events</p>
            <p className="text-gray-400 text-sm mt-1">Discover live music across Utah</p>
          </a>
        </div>
      </div>
    </main>
  )
}