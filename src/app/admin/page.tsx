import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/dateUtils'

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
  const { error } = await supabase.rpc('delete_user_as_admin', {
    target_user_id: userId
  })
  if (error) console.error('Delete user error:', error)
  redirect('/admin')
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const { success } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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

  const { data: bands } = await supabase
    .from('bands')
    .select(`
      *,
      profiles ( display_name, avatar_url, created_at, website, instagram, email )
    `)
    .order('created_at', { ascending: false })

  const { data: venues } = await supabase
    .from('venues')
    .select(`
      *,
      profiles ( display_name, avatar_url, created_at, website, instagram, email )
    `)
    .order('created_at', { ascending: false })

  const fans = profiles?.filter(p => p.account_type === 'fan') || []
  const totalUsers = profiles?.length || 0
  const totalBands = bands?.length || 0
  const totalVenues = venues?.length || 0
  const totalEvents = events?.length || 0

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">

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

        {/* Success message */}
        {success === 'venue_created' && (
          <div className="bg-green-950 border border-green-800 text-green-400 rounded-xl px-4 py-3 text-sm mb-6">
            Venue created successfully!
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total users', value: totalUsers },
            { label: 'Bands', value: totalBands },
            { label: 'Venues', value: totalVenues },
            { label: 'Events', value: totalEvents },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 rounded-2xl p-5 text-center">
              <p className="text-3xl font-bold text-yellow-400">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bands */}
        <div className="mb-10">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-4">
            Bands ({totalBands})
          </p>
          {bands && bands.length > 0 ? (
            <div className="bg-gray-900 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-500 font-medium p-4">Band</th>
                    <th className="text-left text-gray-500 font-medium p-4">City</th>
                    <th className="text-left text-gray-500 font-medium p-4">Email</th>
                    <th className="text-left text-gray-500 font-medium p-4">Genres</th>
                    <th className="text-left text-gray-500 font-medium p-4">Joined</th>
                    <th className="text-left text-gray-500 font-medium p-4">Links</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {bands.map((band: any) => {
                    const deleteUserWithId = deleteUser.bind(null, band.profile_id)
                    return (
                      <tr key={band.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-yellow-400 flex items-center justify-center text-gray-950 font-bold text-sm shrink-0">
                              {band.profiles?.avatar_url ? (
                                <img src={band.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                band.profiles?.display_name?.[0]?.toUpperCase()
                              )}
                            </div>
                            <span className="font-medium">{band.profiles?.display_name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-400">{band.city || '—'}</td>
                        <td className="p-4 text-gray-400 text-xs">{band.profiles?.email || '—'}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {band.genres?.slice(0, 2).map((g: string) => (
                              <span key={g} className="px-2 py-0.5 bg-gray-800 text-yellow-400 text-xs rounded-full">{g}</span>
                            ))}
                            {band.genres?.length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-800 text-gray-500 text-xs rounded-full">+{band.genres.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-400 text-xs">
                          {formatDate(new Date(band.profiles?.created_at))}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-3">
                            {band.profiles?.website && (
                              <a href={band.profiles.website} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline text-xs">Web</a>
                            )}
                            {band.profiles?.instagram && (
                              <a href={`https://instagram.com/${band.profiles.instagram}`} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline text-xs">IG</a>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <a
                              href={`/admin/bands/${band.id}/avatar`}
                              className="px-3 py-1 text-xs bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              Avatar
                            </a>
                            <form action={deleteUserWithId}>
                              <button className="px-3 py-1 text-xs bg-red-950 text-red-400 rounded-lg hover:bg-red-900 transition-colors">
                                Delete
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-2xl p-6 text-center">
              <p className="text-gray-500">No bands yet</p>
            </div>
          )}
        </div>

        {/* Venues */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">
              Venues ({totalVenues})
            </p>
            <a
              href="/admin/venues/new"
              className="px-4 py-2 text-sm bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
            >
              + Add venue
            </a>
          </div>
          {venues && venues.length > 0 ? (
            <div className="bg-gray-900 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-500 font-medium p-4">Venue</th>
                    <th className="text-left text-gray-500 font-medium p-4">City</th>
                    <th className="text-left text-gray-500 font-medium p-4">Email</th>
                    <th className="text-left text-gray-500 font-medium p-4">Capacity</th>
                    <th className="text-left text-gray-500 font-medium p-4">Joined</th>
                    <th className="text-left text-gray-500 font-medium p-4">Links</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {venues.map((venue: any) => {
                    const deleteUserWithId = deleteUser.bind(null, venue.profile_id)
                    return (
                      <tr key={venue.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-yellow-400 flex items-center justify-center text-gray-950 font-bold text-sm shrink-0">
                              {venue.profiles?.avatar_url ? (
                                <img src={venue.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                venue.profiles?.display_name?.[0]?.toUpperCase()
                              )}
                            </div>
                            <span className="font-medium">{venue.profiles?.display_name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-400">{venue.city || '—'}</td>
                        <td className="p-4 text-gray-400 text-xs">
                          {venue.profiles?.email && !venue.profiles.email.includes('@venue.hivestage.live') 
                            ? venue.profiles.email 
                            : '—'}
                        </td>
                        <td className="p-4 text-gray-400">{venue.capacity ? venue.capacity.toLocaleString() : '—'}</td>
                        <td className="p-4 text-gray-400 text-xs">
                          {formatDate(new Date(venue.profiles?.created_at))}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-3">
                            {venue.profiles?.website && (
                              <a href={venue.profiles.website} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline text-xs">Web</a>
                            )}
                            {venue.profiles?.instagram && (
                              <a href={`https://instagram.com/${venue.profiles.instagram}`} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline text-xs">IG</a>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <form action={deleteUserWithId}>
                            <button className="px-3 py-1 text-xs bg-red-950 text-red-400 rounded-lg hover:bg-red-900 transition-colors">
                              Delete
                            </button>
                          </form>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-2xl p-6 text-center">
              <p className="text-gray-500">No venues yet</p>
            </div>
          )}
        </div>

        {/* Fans */}
        <div className="mb-10">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-4">
            Fans ({fans.length})
          </p>
          {fans.length > 0 ? (
            <div className="bg-gray-900 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-500 font-medium p-4">Name</th>
                    <th className="text-left text-gray-500 font-medium p-4">Email</th>
                    <th className="text-left text-gray-500 font-medium p-4">Joined</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {fans.map((fan: any) => {
                    const deleteUserWithId = deleteUser.bind(null, fan.id)
                    return (
                      <tr key={fan.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-yellow-400 flex items-center justify-center text-gray-950 font-bold text-sm shrink-0">
                              {fan.avatar_url ? (
                                <img src={fan.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                fan.display_name?.[0]?.toUpperCase()
                              )}
                            </div>
                            <span className="font-medium">{fan.display_name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-400 text-xs">{fan.email || '—'}</td>
                        <td className="p-4 text-gray-400 text-xs">
                          {formatDate(new Date(fan.created_at))}
                        </td>
                        <td className="p-4">
                          <form action={deleteUserWithId}>
                            <button className="px-3 py-1 text-xs bg-red-950 text-red-400 rounded-lg hover:bg-red-900 transition-colors">
                              Delete
                            </button>
                          </form>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-2xl p-6 text-center">
              <p className="text-gray-500">No fans yet</p>
            </div>
          )}
        </div>

        {/* Events */}
        <div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-4">
            All Events ({totalEvents})
          </p>
          {events && events.length > 0 ? (
            <div className="bg-gray-900 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-500 font-medium p-4">Event</th>
                    <th className="text-left text-gray-500 font-medium p-4">Band</th>
                    <th className="text-left text-gray-500 font-medium p-4">Venue</th>
                    <th className="text-left text-gray-500 font-medium p-4">Date</th>
                    <th className="text-left text-gray-500 font-medium p-4">Free</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event: any) => {
                    const date = new Date(event.event_date)
                    const bandNames = event.event_bands?.map((eb: any) => eb.bands?.profiles?.display_name).filter(Boolean)
                    const deleteEventWithId = deleteEvent.bind(null, event.id)
                    const isPast = date < new Date()
                    return (
                      <tr key={event.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800 transition-colors">
                        <td className="p-4">
                          <p className={`font-medium ${isPast ? 'text-gray-500' : 'text-white'}`}>{event.title}</p>
                          {isPast && <span className="text-xs text-gray-600">Past event</span>}
                        </td>
                        <td className="p-4 text-gray-400">{bandNames?.join(', ') || '—'}</td>
                        <td className="p-4 text-gray-400">{event.venues?.profiles?.display_name || '—'}</td>
                        <td className="p-4 text-gray-400 text-xs">
                          {formatDate(date)}
                        </td>
                        <td className="p-4">
                          {event.is_free
                            ? <span className="text-green-400 text-xs font-medium">Free</span>
                            : <span className="text-gray-500 text-xs">Paid</span>
                          }
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <a
                              href={`/dashboard/events/${event.id}/edit`}
                              className="px-3 py-1 text-xs bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              Edit
                            </a>
                            <form action={deleteEventWithId}>
                              <button className="px-3 py-1 text-xs bg-red-950 text-red-400 rounded-lg hover:bg-red-900 transition-colors">
                                Delete
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-2xl p-6 text-center">
              <p className="text-gray-500">No events yet</p>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}