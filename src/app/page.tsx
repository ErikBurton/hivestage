import { createClient } from '@/lib/supabase/server'
import SearchHero from './SearchHero'
import Nav from '@/components/Nav'
import { formatTime, formatDate } from '@/lib/dateUtils'

export const metadata = {
  title: 'HiveStage — Utah\'s Home for Live Music',
  description: 'Find local shows, discover new bands, and connect with venues across Utah.',
}

export default async function HomePage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      venues ( id, city, profiles ( display_name ) ),
      event_bands ( bands ( id, profiles ( display_name ) ) )
    `)
    .order('event_date', { ascending: true })
    .limit(3)

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Nav />

      <section className="text-center px-8 py-20 max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 leading-tight">
          Utah's home for <span className="text-yellow-400">live music</span>
        </h1>
        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
          Find local shows, discover new bands, and connect with venues across Utah.
        </p>
        <SearchHero />
        <div className="flex gap-4 justify-center flex-wrap mt-8">
          <a href="/events" className="px-8 py-3 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors">
            Browse events
          </a>
          <a href="/signup" className="px-8 py-3 border border-yellow-400 text-yellow-400 font-semibold rounded-lg hover:bg-yellow-400 hover:text-gray-950 transition-colors">
            Join as a band
          </a>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-8 pb-20 max-w-4xl mx-auto">
        {[
          { icon: '🎸', title: 'For bands', desc: 'Create a profile, post your shows, and get discovered by fans across Utah.' },
          { icon: '🏟️', title: 'For venues', desc: 'Manage your event calendar and connect with local talent looking for a stage.' },
          { icon: '🎟️', title: 'For fans', desc: 'Never miss a show. Browse upcoming events by city, genre, and date.' },
        ].map(f => (
          <div key={f.title} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {events && events.length > 0 && (
        <section className="px-8 pb-20 max-w-4xl mx-auto">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-4">Upcoming shows</p>
          <div className="space-y-3">
            {events.map((event: any) => {
              const date = new Date(event.event_date)
              const bands = event.event_bands?.map((eb: any) => eb.bands?.profiles?.display_name).filter(Boolean)
              return (
                <div key={event.id} className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
                  {event.cover_image_url && (
                    <div className="relative w-full aspect-video">
                      <img src={event.cover_image_url} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      {bands?.length > 0 && <p className="text-yellow-400 text-sm mt-1">{bands.join(', ')}</p>}
                      <div className="flex gap-3 mt-2 text-sm text-gray-500 flex-wrap">
                        {event.venues && <span>📍 {event.venues.profiles?.display_name}{event.venues.city ? `, ${event.venues.city}` : ''}</span>}
                        <span>🕐 {formatDate(date)} at {formatTime(date)}</span>
                      </div>
                    </div>
                    {event.is_free
                      ? <span className="shrink-0 text-green-400 text-xs font-semibold bg-green-950 px-3 py-1 rounded-full">Free</span>
                      : event.ticket_url
                        ? <a href={event.ticket_url} target="_blank" rel="noopener noreferrer" className="shrink-0 px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors text-sm">Tickets</a>
                        : null
                    }
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-6 text-center">
            <a href="/events" className="text-yellow-400 hover:underline text-sm">View all events →</a>
          </div>
        </section>
      )}

      <section className="text-center px-8 py-20 border-t border-gray-800">
        <h2 className="text-3xl font-bold mb-3">Ready to get on stage?</h2>
        <p className="text-gray-400 mb-8">Join Utah musicians and venues already on HiveStage.</p>
        <a href="/signup" className="px-8 py-3 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors">
          Create your free account
        </a>
      </section>

      <footer className="border-t border-gray-800 px-8 py-6 flex items-center justify-between text-gray-600 text-sm">
        <span className="text-yellow-400 font-bold">HiveStage</span>
        <div className="flex items-center gap-6">
          <a href="/about" className="hover:text-gray-400 transition-colors">About</a>
          <a href="/terms" className="hover:text-gray-400 transition-colors">Terms</a>
          <a href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</a>
          <span>Utah's home for live music</span>
        </div>
      </footer>
    </main>
  )
}