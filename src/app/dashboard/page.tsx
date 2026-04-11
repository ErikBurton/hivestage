import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Dashboard' }

async function logout() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: myEvents } = await supabase
    .from('events')
    .select(`*, venues ( id, city, profiles ( display_name ) )`)
    .eq('created_by', user.id)
    .order('event_date', { ascending: true })

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">HiveStage</h1>
            <p className="text-gray-500 text-sm">Welcome back, {profile?.display_name}</p>
          </div>
          <form action={logout}>
            <button className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-colors">
              Log out
            </button>
          </form>
        </div>

        <div className="grid gap-4 mb-8">
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
          <a href="/bands" className="bg-gray-900 rounded-2xl p-6 hover:bg-gray-800 transition-colors">
            <p className="font-semibold text-lg">🎸 Browse Bands</p>
            <p className="text-gray-400 text-sm mt-1">Discover Utah musicians</p>
          </a>
          {profile?.is_admin && (
            <a href="/admin" className="bg-yellow-400 rounded-2xl p-6 hover:bg-yellow-300 transition-colors">
              <p className="font-semibold text-lg text-gray-950">⚙️ Admin Panel</p>
              <p className="text-gray-700 text-sm mt-1">Manage events and users</p>
            </a>
          )}
        </div>

        {myEvents && myEvents.length > 0 && (
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-4">My Events</p>
            <div className="space-y-3">
              {myEvents.map((event: any) => {
                const date = new Date(event.event_date)
                return (
                  <div key={event.id} className="bg-gray-900 rounded-2xl overflow-hidden">
                    {event.cover_image_url && (
                      <div className="relative w-full aspect-video">
                        <img src={event.cover_image_url} alt={event.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-5 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-gray-500 text-sm mt-1">
                          🕐 {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <a href={`/dashboard/events/${event.id}/edit`} className="px-3 py-1.5 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
                          Edit
                        </a>
                        <a href={`/dashboard/events/${event.id}/delete`} className="px-3 py-1.5 text-sm bg-red-950 text-red-400 rounded-lg hover:bg-red-900 transition-colors">
                          Delete
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}