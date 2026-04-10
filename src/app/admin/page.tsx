import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Admin' }

async function deleteEvent(eventId: string) {
  'use server'
  const supabase = await createClient()
  await supabase.from('event_bands').delete().eq('event_id', eventId)
  await supabase.from('events').delete().eq('id', eventId)
  redirect('/admin')
}

async function deleteUser(userId: string) {
  'use server'
  const supabase = await createClient()
  await supabase.from('profiles').delete().eq('id', userId)
  redirect('/admin')
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: stats } = await supabase.rpc('get_admin_stats').single()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      venues ( id, city, profiles ( display_name ) ),
      event_bands ( bands ( profiles ( display_name ) ) )
    `)
    .order('created_at', { ascending: false })

  const bands = profiles?.filter(p => p.account_type === 'band') || []
  const venues = profiles?.filter(p => p.account_type === 'venue') || []
  const fans = profiles?.filter(p => p.account_type === 'fan') || []

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">Admin</h1>
            <p className="text-gray-500 text-sm">HiveStage control panel</p>
          </div>
          <a href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors">
            Back to dashboard
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total users', value: profiles?.length || 0 },
            { label: 'Bands', value: bands.length },
            { label: 'Venues', value: venues.length },
            { label: 'Events', value: events?.length || 0 },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 rounded-2xl p-5 text-center">
              <p className="text-3xl font-bold text-yellow-400">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Events */}
        <div className="mb-10">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-4">All Events</p>
          <div className="space-y-3">
            {events?.map((event: any) => {
              const date = new Date(event.event_date)
              const bands = event.event_bands?.map((eb: any) => eb.bands?.profiles?.display_name).filter(Boolean)
              const deleteEventWithId = deleteEvent.bind(null, event.id)
              return (
                <div key={event.id} className="bg-gray-900 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold">{event.title}</p>
                    {bands?.length > 0 && <p className="text-yellow-400 text-sm">{bands.join(', ')}</p>}
                    <p className="text-gray-500 text-sm mt-1">
                      🕐 {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      {event.venues && ` · 📍 ${event.venues.profiles?.display_name}`}
                    </p>
                  </div>
                  <form action={deleteEventWithId}>
                    <button className="px-3 py-1.5 text-sm bg-red-950 text-red-400 rounded-lg hover:bg-red-900 transition-colors">
                      Delete
                    </button>
                  </form>
                </div>
              )
            })}
          </div>
        </div>

        {/* Users */}
        <div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-4">All Users</p>
          <div className="space-y-3">
            {profiles?.map((profile: any) => {
              const deleteUserWithId = deleteUser.bind(null, profile.id)
              return (
                <div key={profile.id} className="bg-gray-900 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-gray-950 font-bold text-sm shrink-0">
                      {profile.display_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{profile.display_name}</p>
                      <p className="text-gray-500 text-sm capitalize">{profile.account_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {profile.is_admin && (
                      <span className="text-xs bg-yellow-400 text-gray-950 px-2 py-1 rounded-full font-medium">Admin</span>
                    )}
                    {!profile.is_admin && (
                      <form action={deleteUserWithId}>
                        <button className="px-3 py-1.5 text-sm bg-red-950 text-red-400 rounded-lg hover:bg-red-900 transition-colors">
                          Delete
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </main>
  )
}