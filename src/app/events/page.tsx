import { createClient } from '@/lib/supabase/server'

export default async function EventsPage() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      venues (
        id, city,
        profiles ( display_name )
      ),
      event_bands (
        bands (
          id,
          profiles ( display_name )
        )
      )
    `)
    .order('event_date', { ascending: true })

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">HiveStage</h1>
            <p className="text-gray-400 mt-1">Live music across Utah</p>
          </div>
          <a
            href="/dashboard"
            className="px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors text-sm"
          >
            Dashboard
          </a>
        </div>

        {events && events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event: any) => {
              const date = new Date(event.event_date)
              const bands = event.event_bands?.map((eb: any) => eb.bands?.profiles?.display_name).filter(Boolean)

              return (
                <div key={event.id} className="bg-gray-900 rounded-2xl p-6 hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold">{event.title}</h2>

                      {bands?.length > 0 && (
                        <p className="text-yellow-400 text-sm mt-1">{bands.join(', ')}</p>
                      )}

                      {event.description && (
                        <p className="text-gray-400 text-sm mt-2">{event.description}</p>
                      )}

                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
                        {event.venues && (
                          <span>📍 {event.venues.profiles?.display_name}{event.venues.city ? `, ${event.venues.city}` : ''}</span>
                        )}
                        <span>🕐 {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                        {event.is_free && <span className="text-green-400">Free</span>}
                      </div>
                    </div>

                    {event.ticket_url && (
                      <a
                        href={event.ticket_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors text-sm"
                      >
                        Tickets
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No upcoming events yet</p>
            <p className="text-gray-600 text-sm mt-2">Be the first to post a show</p>
            <a
              href="/dashboard/events/new"
              className="inline-block mt-6 px-6 py-3 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
            >
              Post an event
            </a>
          </div>
        )}
      </div>
    </main>
  )
}

