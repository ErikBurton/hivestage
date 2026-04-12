import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import FollowButton from '@/components/FollowButton'

export default async function BandProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: band } = await supabase
    .from('bands')
    .select(`*, profiles ( * )`)
    .eq('id', id)
    .single()

  if (!band) notFound()

  const { data: eventBands } = await supabase
    .from('event_bands')
    .select(`
      events (
        *,
        venues ( id, city, profiles ( display_name ) )
      )
    `)
    .eq('band_id', band.id)

  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('band_id', band.id)

  const upcomingEvents = eventBands
    ?.map((eb: any) => eb.events)
    .filter((e: any) => e && new Date(e.event_date) >= new Date())
    .sort((a: any, b: any) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Nav />
      <div className="max-w-2xl mx-auto p-8">
        <a href="/bands" className="text-gray-500 text-sm hover:text-yellow-400 mb-6 inline-block">← Back to bands</a>

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
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-bold">{band.profiles?.display_name}</h1>
                <FollowButton bandId={band.id} />
              </div>
              {band.city && <p className="text-gray-400 mt-1">📍 {band.city}, Utah</p>}
              <p className="text-gray-500 text-sm mt-1">
                {followerCount || 0} {followerCount === 1 ? 'follower' : 'followers'}
              </p>
              {band.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {band.genres.map((g: string) => (
                    <span key={g} className="px-3 py-1 bg-gray-800 text-yellow-400 text-xs font-medium rounded-full">{g}</span>
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
              <a href={band.profiles.website} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline text-sm">Website →</a>
            )}
            {band.profiles?.instagram && (
              <a href={`https://instagram.com/${band.profiles.instagram}`} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline text-sm">@{band.profiles.instagram}</a>
            )}
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4">Upcoming shows</h2>
        {upcomingEvents && upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((event: any) => {
              const date = new Date(event.event_date)
              return (
                <a key={event.id} href={`/events/${event.id}`} className="bg-gray-900 rounded-2xl overflow-hidden hover:bg-gray-800 transition-colors block">
                  {event.cover_image_url && (
                    <div className="relative w-full aspect-video">
                      <img src={event.cover_image_url} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5 flex items-center justify-between gap-4">
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
                        ? <span className="shrink-0 px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-lg text-sm">Tickets</span>
                        : null
                    }
                  </div>
                </a>
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