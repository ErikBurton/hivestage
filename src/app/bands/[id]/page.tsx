import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function BandProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: band } = await supabase
    .from('bands')
    .select(`
      *,
      profiles ( * )
    `)
    .eq('id', id)
    .single()

  if (!band) notFound()

  const { data: events } = await supabase
    .from('event_bands')
    .select(`
      events (
        *,
        venues ( id, city, profiles ( display_name ) )
      )
    `)
    .eq('band_id', band.id)

  const upcomingEvents = events
    ?.map((eb: any) => eb.events)
    .filter((e: any) => e && new Date(e.event_date) >= new Date())
    .sort((a: any, b: any) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <a href="/events" className="text-gray-500 text-sm hover:text-yellow-400 mb-6 inline-block">← Back to events</a>

        {/* Profile header */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-yellow-400 flex items-center justify-center text-gray-950 text-3xl font-bold shrink-0">
                {band.profiles?.avatar_url ? (
                    <img src={band.profiles.avatar_url} alt={band.profiles.display_name} className="w-full h-full object-cover" />
                ) : (
                    band.profiles?.display_name?.[0]?.toUpperCase()
                )}
                </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{band.profiles?.display_name}</h1>
              {band.city && <p className="text-gray-400 mt-1">📍 {band.city}, Utah</p>}
              {band.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {band.genres.map((g: string) => (
                    <span key={g} className="px-3 py-1 bg-gray-800 text-yellow-400 text-xs font-medium rounded-full">
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {band.profiles?.bio && (
            <p className="text-gray-300 mt-6 leading-relaxed">{band.profiles.bio}</p>
          )}

          <div className="flex gap-4 mt-6">
            {band.profiles?.website && (
              <a
                href={band.profiles.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:underline text-sm"
              >
                Website →
              </a>
            )}
            {band.profiles?.instagram && (
              <a
                href={`https://instagram.com/${band.profiles.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:underline text-sm"
              >
                @{band.profiles.instagram}
              </a>
            )}
          </div>
        </div>

        {/* Upcoming shows */}
        <h2 className="text-lg font-semibold mb-4">Upcoming shows</h2>
        {upcomingEvents && upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((event: any) => {
              const date = new Date(event.event_date)
              return (
                <div key={event.id} className="bg-gray-900 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{event.title}</p>
                    <div className="flex gap-3 mt-2 text-sm text-gray-500 flex-wrap">
                      {event.venues && (
                        <span>📍 {event.venues.profiles?.display_name}{event.venues.city ? `, ${event.venues.city}` : ''}</span>
                      )}
                      <span>🕐 {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  {event.is_free
                    ? <span className="shrink-0 text-green-400 text-xs font-semibold bg-green-950 px-3 py-1 rounded-full">Free</span>
                    : event.ticket_url
                      ? <a href={event.ticket_url} target="_blank" rel="noopener noreferrer" className="shrink-0 px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors text-sm">Tickets</a>
                      : null
                  }
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-gray-900 rounded-2xl p-6 text-center">
            <p className="text-gray-500">No upcoming shows scheduled</p>
          </div>
        )}
      </div>
    </main>
  )
}