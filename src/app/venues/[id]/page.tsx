import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function VenueProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: venue } = await supabase
    .from('venues')
    .select(`
      *,
      profiles ( * )
    `)
    .eq('id', id)
    .single()

  if (!venue) notFound()

  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      event_bands (
        bands ( id, profiles ( display_name ) )
      )
    `)
    .eq('venue_id', venue.id)
    .order('event_date', { ascending: true })

  const upcomingEvents = events?.filter(
    (e: any) => new Date(e.event_date) >= new Date()
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <a href="/events" className="text-gray-500 text-sm hover:text-yellow-400 mb-6 inline-block">← Back to events</a>

        {/* Profile header */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-yellow-400 flex items-center justify-center text-gray-950 text-3xl font-bold shrink-0">
              {venue.profiles?.display_name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{venue.profiles?.display_name}</h1>
              {venue.city && <p className="text-gray-400 mt-1">📍 {venue.address ? `${venue.address}, ` : ''}{venue.city}, Utah</p>}
              {venue.capacity && <p className="text-gray-500 text-sm mt-1">Capacity: {venue.capacity}</p>}
            </div>
          </div>

          {venue.profiles?.bio && (
            <p className="text-gray-300 mt-6 leading-relaxed">{venue.profiles.bio}</p>
          )}

          <div className="flex gap-4 mt-6">
            {venue.profiles?.website && (
              <a
                href={venue.profiles.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:underline text-sm"
              >
                Website →
              </a>
            )}
            {venue.profiles?.instagram && (
              <a
                href={`https://instagram.com/${venue.profiles.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:underline text-sm"
              >
                @{venue.profiles.instagram}
              </a>
            )}
          </div>
        </div>

        {/* Upcoming events */}
        <h2 className="text-lg font-semibold mb-4">Upcoming events</h2>
        {upcomingEvents && upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((event: any) => {
              const date = new Date(event.event_date)
              const bands = event.event_bands?.map((eb: any) => eb.bands?.profiles?.display_name).filter(Boolean)
              return (
                <div key={event.id} className="bg-gray-900 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{event.title}</p>
                    {bands?.length > 0 && (
                      <p className="text-yellow-400 text-sm mt-1">{bands.join(', ')}</p>
                    )}
                    <div className="flex gap-3 mt-2 text-sm text-gray-500 flex-wrap">
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
            <p className="text-gray-500">No upcoming events scheduled</p>
          </div>
        )}
      </div>
    </main>
  )
}