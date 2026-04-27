import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import ShareButtons from '@/components/ShareButtons'
import { formatTime, formatDateLong } from '@/lib/dateUtils'
import AddToCalendarButton from '@/components/AddToCalendarButton'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select(`*, venues ( city, profiles ( display_name ) ), event_bands ( bands ( profiles ( display_name ) ) )`)
    .eq('id', id)
    .single()

  if (!event) return {}

  const date = new Date(event.event_date)
  const bandNames = event.event_bands?.map((eb: any) => eb.bands?.profiles?.display_name).filter(Boolean).join(', ')
  const venueName = event.venues?.profiles?.display_name
  const city = event.venues?.city

  const description = [
    bandNames && `Featuring ${bandNames}`,
    venueName && `At ${venueName}`,
    city && `${city}, Utah`,
    formatDateLong(date),
    event.is_free ? 'Free admission' : 'Get your tickets now',
  ].filter(Boolean).join(' · ')

  return {
    title: `${event.title} — HiveStage`,
    description,
    openGraph: {
      title: event.title,
      description,
      url: `https://www.hivestage.live/events/${id}`,
      siteName: 'HiveStage',
      images: event.cover_image_url ? [{ url: event.cover_image_url, width: 1280, height: 720, alt: event.title }] : [{ url: 'https://www.hivestage.live/og-default.png', width: 1280, height: 720, alt: 'HiveStage' }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      images: event.cover_image_url ? [event.cover_image_url] : [],
    },
  }
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select(`
      *,
      venues ( id, city, address, profiles ( display_name, avatar_url ) ),
      event_bands ( bands ( id, city, genres, profiles ( display_name, avatar_url, bio ) ) )
    `)
    .eq('id', id)
    .single()

  if (!event) notFound()

  const date = new Date(event.event_date)
  const bands = event.event_bands?.map((eb: any) => eb.bands).filter(Boolean)
  const eventUrl = `https://www.hivestage.live/events/${id}`

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Nav />
      <div className="max-w-2xl mx-auto p-8">
        <a href="/events" className="text-gray-500 text-sm hover:text-yellow-400 mb-6 inline-block">← Back to events</a>

        {event.cover_image_url && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6">
            <img src={event.cover_image_url} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="bg-gray-900 rounded-2xl p-8 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <div className="flex items-center gap-2 shrink-0">
              <AddToCalendarButton
                title={event.title}
                date={event.event_date}
                location={[
                  event.venues?.profiles?.display_name,
                  event.venues?.address,
                  event.venues?.city ? `${event.venues.city}, Utah` : null
                ].filter(Boolean).join(', ')}
                description={event.description || ''}
              />
              <ShareButtons url={eventUrl} title={event.title} />
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🕐</span>
              <div>
                <p className="text-white font-medium">{formatDateLong(date)}</p>
                <p className="text-gray-400">{formatTime(date)}</p>
              </div>
            </div>

            {event.venues && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <a href={`/venues/${event.venues.id}`} className="text-white font-medium hover:text-yellow-400 transition-colors">
                    {event.venues.profiles?.display_name}
                  </a>
                  {event.venues.address && <p className="text-gray-400">{event.venues.address}</p>}
                  {event.venues.city && <p className="text-gray-400">{event.venues.city}, Utah</p>}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="text-2xl">🎟️</span>
              <div>
                {event.is_free ? (
                  <p className="text-green-400 font-medium">Free admission</p>
                ) : event.ticket_url ? (
                  <a href={event.ticket_url} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline font-medium">
                    Get tickets →
                  </a>
                ) : (
                  <p className="text-gray-400">Check with venue for tickets</p>
                )}
              </div>
            </div>
          </div>

          {event.description && (
            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-gray-300 leading-relaxed">{event.description}</p>
            </div>
          )}

          {event.ticket_url && !event.is_free && (
            <a href={event.ticket_url} target="_blank" rel="noopener noreferrer" className="mt-6 w-full block text-center py-3 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors">
              Get tickets
            </a>
          )}
        </div>

        {bands && bands.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Performing</h2>
            <div className="space-y-3">
              {bands.map((band: any) => (
                <a key={band.id} href={`/bands/${band.id}`} className="bg-gray-900 rounded-2xl p-5 flex items-center gap-4 hover:bg-gray-800 transition-colors">
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
                  <span className="text-gray-500 text-sm shrink-0">View profile →</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {event.venues && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Venue</h2>
            <a href={`/venues/${event.venues.id}`} className="bg-gray-900 rounded-2xl p-5 flex items-center gap-4 hover:bg-gray-800 transition-colors">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-yellow-400 flex items-center justify-center text-gray-950 text-xl font-bold shrink-0">
                {event.venues.profiles?.avatar_url ? (
                  <img src={event.venues.profiles.avatar_url} alt={event.venues.profiles.display_name} className="w-full h-full object-cover" />
                ) : (
                  event.venues.profiles?.display_name?.[0]?.toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{event.venues.profiles?.display_name}</p>
                {event.venues.city && <p className="text-gray-400 text-sm">📍 {event.venues.city}, Utah</p>}
              </div>
              <span className="text-gray-500 text-sm">View venue →</span>
            </a>
          </div>
        )}
      </div>
    </main>
  )
}