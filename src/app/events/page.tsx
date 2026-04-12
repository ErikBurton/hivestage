'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const UTAH_CITIES = [
  'Alpine', 'American Fork', 'Bountiful', 'Cedar City', 'Cedar Hills',
  'Clearfield', 'Cottonwood Heights', 'Draper', 'Eagle Mountain', 'Farmington',
  'Heber City', 'Herriman', 'Highland', 'Holladay', 'Hyde Park', 'Kaysville',
  'Layton', 'Lehi', 'Lindon', 'Logan', 'Midvale', 'Millcreek', 'Moab', 'Murray',
  'North Logan', 'North Salt Lake', 'Ogden', 'Orem', 'Park City', 'Payson',
  'Pleasant Grove', 'Provo', 'Riverton', 'Roy', 'Salt Lake City', 'Sandy',
  'Saratoga Springs', 'Smithfield', 'South Jordan', 'Spanish Fork', 'Springville',
  'St. George', 'Taylorsville', 'West Jordan', 'West Valley City', 'Woods Cross',
]

const GENRES = ['Rock', 'Pop', 'Hip Hop', 'Country', 'Jazz', 'Metal', 'Folk', 'Electronic', 'R&B', 'Punk', 'Indie', 'Blues']

export default function EventsPage() {
  const supabase = createClient()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cityFilter, setCityFilter] = useState('')
  const [genreFilter, setGenreFilter] = useState('')
  const [freeOnly, setFreeOnly] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [cityFilter, genreFilter, freeOnly])

  async function loadEvents() {
    setLoading(true)

    let query = supabase
      .from('events')
      .select(`
        *,
        venues ( id, city, profiles ( display_name ) ),
        event_bands (
          bands ( id, genres, profiles ( display_name ) )
        )
      `)
      .order('event_date', { ascending: true })

    if (freeOnly) {
      query = query.eq('is_free', true)
    }

    if (cityFilter) {
      query = query.eq('venues.city', cityFilter)
    }

    const { data } = await query
    let filtered = data || []

    if (genreFilter) {
      filtered = filtered.filter((event: any) =>
        event.event_bands?.some((eb: any) =>
          eb.bands?.genres?.includes(genreFilter)
        )
      )
    }

    if (cityFilter) {
      filtered = filtered.filter((event: any) =>
        event.venues?.city === cityFilter
      )
    }

    setEvents(filtered)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/" className="text-2xl font-bold text-yellow-400">HiveStage</a>
            <p className="text-gray-400 mt-1">Live music across Utah</p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <a href="/bands" className="text-gray-400 hover:text-white text-sm transition-colors">Bands</a>
            <a href="/venues" className="text-gray-400 hover:text-white text-sm transition-colors">Venues</a>
            <a href="/dashboard" className="px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors text-sm">
              Dashboard
            </a>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
          <select
            className="flex-1 min-w-40 px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-yellow-400 text-sm"
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
          >
            <option value="">All cities</option>
            {UTAH_CITIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            className="flex-1 min-w-40 px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-yellow-400 text-sm"
            value={genreFilter}
            onChange={e => setGenreFilter(e.target.value)}
          >
            <option value="">All genres</option>
            {GENRES.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <button
            onClick={() => setFreeOnly(!freeOnly)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              freeOnly
                ? 'bg-yellow-400 text-gray-950'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Free only
          </button>

          {(cityFilter || genreFilter || freeOnly) && (
            <button
              onClick={() => { setCityFilter(''); setGenreFilter(''); setFreeOnly(false) }}
              className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-white transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Events list */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Loading events...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event: any) => {
              const date = new Date(event.event_date)

              return (
                <div key={event.id} className="bg-gray-900 rounded-2xl overflow-hidden hover:bg-gray-800 transition-colors">
                  {event.cover_image_url && (
                    <div className="relative w-full aspect-video">
                      <img
                        src={event.cover_image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold">{event.title}</h2>

                        {event.event_bands?.length > 0 && (
                          <p className="text-sm mt-1">
                            {event.event_bands.map((eb: any, i: number) => (
                              <span key={eb.bands?.id}>
                                <a
                                  href={`/bands/${eb.bands?.id}`}
                                  className="text-yellow-400 hover:underline"
                                >
                                  {eb.bands?.profiles?.display_name}
                                </a>
                                {i < event.event_bands.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </p>
                        )}

                        {event.description && (
                          <p className="text-gray-400 text-sm mt-2">{event.description}</p>
                        )}

                        <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
                          {event.venues && (
                            <a href={`/venues/${event.venues.id}`} className="hover:text-yellow-400 transition-colors">
                              📍 {event.venues.profiles?.display_name}{event.venues.city ? `, ${event.venues.city}` : ''}
                            </a>
                          )}
                          <span>🕐 {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                          {event.is_free && <span className="text-green-400 font-medium">Free</span>}
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
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No events found</p>
            <p className="text-gray-600 text-sm mt-2">
              {cityFilter || genreFilter || freeOnly ? 'Try adjusting your filters' : 'Be the first to post a show'}
            </p>
            {!cityFilter && !genreFilter && !freeOnly && (
              <a
                href="/dashboard/events/new"
                className="inline-block mt-6 px-6 py-3 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
              >
                Post an event
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  )
}