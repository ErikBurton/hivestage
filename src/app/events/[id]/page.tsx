import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: eventData } = await supabase
    .from('events')
    .select(`
      *,
      venues ( id, city, address, profiles ( display_name, avatar_url ) ),
      event_bands ( bands ( id, city, genres, profiles ( display_name, avatar_url, bio ) ) )
    `)
    .eq('id', id)
    .single()

  if (!eventData) notFound()

  const date = new Date(eventData.event_date)
  const bands = eventData.event_bands?.map((eb: any) => eb.bands).filter(Boolean)

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Nav />
      <div className="max-w-2xl mx-auto p-8">
        <a href="/events" className="text-gray-500 text-sm hover:text-yellow-400 mb-6 inline-block">← Back to events</a>

        {/* Cover image */}
        {eventData.cover_image_url && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6">
            <img src={eventData.cover_image_url} alt={eventData.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Event header */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-6">
          <h1 className="text-3xl font-bold mb-4">{eventData.title}</h1>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🕐</span>
              <div>
                <p className="text-white font-medium">
                  {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-gray-400">
                  {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {eventData.venues && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <a href={`/venues/${eventData.venues.id}`} className="text-white font-medium hover:text-yellow-400 transition-colors">
                    {eventData.venues.profiles?.display_name}
                  </a>
                  {eventData.venues.address && (
                    <p className="text-gray-400">{eventData.venues.address}</p>
                  )}
                  {eventData.venues.city && (
                    <p className="text-gray-400">{eventData.venues.city}, Utah</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="text-2xl">🎟️</span>
              <div>
                {eventData.is_free ? (
                  <p className="text-green-400 font-medium">Free admission</p>
                ) : eventData.ticket_url ? (
                  <a
                    href={eventData.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-400 hover:underline font-medium"
                  >
                    Get tickets →
                  </a>
                ) : (
                  <p className="text-gray-400">Check with venue for tickets</p>
                )}
              </div>
            </div>
          </div>

          {eventData.description && (
            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-gray-300 leading-relaxed">{eventData.description}</p>
            </div>
          )}

          {eventData.ticket_url && !eventData.is_free && (
            <a
              href={eventData.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full block text-center py-3 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
            >
              Get tickets
            </a>
          )}
        </div>

        {/* Bands performing */}
        {bands && bands.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Performing</h2>
            <div className="space-y-3">
              {bands.map((band: any) => (
                <a
                  key={band.id}
                  href={`/bands/${band.id}`}
                  className="bg-gray-900 rounded-2xl p-5 flex items-center gap-4 hover:bg-gray-800 transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-yellow-400 flex items-center justify-center text-gray-950 text-xl font-bold shrink-0">
                    {band.profiles?.avatar_url ? (
                      <img src={band.profiles.avatar_url} alt={band.profiles.display_name} className="w-full h-full object-cover" />
                    ) : (
                      band.profiles?.display_name?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{band.profiles?.display_name}</p>
                    {band.city && <p className="text-gray-400 text-sm">📍 {band.city}, Utah</p>}
                    {band.genres?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {band.genres.slice(0, 3).map((g: string) => (
                          <span key={g} className="px-2 py-0.5 bg-gray-800 text-yellow-400 text-xs rounded-full">{g}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-gray-500 text-sm">View profile →</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Venue card */}
        {eventData.venues && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Venue</h2>
            <a
              href={`/venues/${eventData.venues.id}`}
              className="bg-gray-900 rounded-2xl p-5 flex items-center gap-4 hover:bg-gray-800 transition-colors"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-yellow-400 flex items-center justify-center text-gray-950 text-xl font-bold shrink-0">
                {eventData.venues.profiles?.avatar_url ? (
                  <img src={eventData.venues.profiles.avatar_url} alt={eventData.venues.profiles.display_name} className="w-full h-full object-cover" />
                ) : (
                  eventData.venues.profiles?.display_name?.[0]?.toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{eventData.venues.profiles?.display_name}</p>
                {eventData.venues.city && <p className="text-gray-400 text-sm">📍 {eventData.venues.city}, Utah</p>}
              </div>
              <span className="text-gray-500 text-sm">View venue →</span>
            </a>
          </div>
        )}

      </div>
    </main>
  )
}
