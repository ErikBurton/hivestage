'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Nav from '@/components/Nav'
import { formatTime, formatMonthShort, formatDayNumber, formatWeekdayShort } from '@/lib/dateUtils'

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

export default function ArchivePage() {
  const supabase = createClient()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cityFilter, setCityFilter] = useState('')
  const [genreFilter, setGenreFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadEvents()
  }, [cityFilter, genreFilter])

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
      .lt('event_date', new Date().toISOString())
      .order('event_date', { ascending: false })

    if (cityFilter) query = query.eq('venues.city', cityFilter)

    const { data } = await query
    let filtered = data || []

    if (genreFilter) {
      filtered = filtered.filter((event: any) =>
        event.event_bands?.some((eb: any) => eb.bands?.genres?.includes(genreFilter))
      )
    }

    if (cityFilter) {
      filtered = filtered.filter((event: any) => event.venues?.city === cityFilter)
    }

    setEvents(filtered)
    setLoading(false)
  }

  const filteredEvents = events.filter((e: any) =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.event_bands?.some((eb: any) =>
      eb.bands?.profiles?.display_name?.toLowerCase().includes(search.toLowerCase())
    )
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Nav />
      <div className="max-w-3xl mx-auto p-8">

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <a href="/events" className="text-gray-500 text-sm hover:text-yellow-400 transition-colors">Events</a>
            <span className="text-gray-700">→</span>
            <span className="text-gray-400 text-sm">Archive</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Past Shows</h1>
          <p className="text-gray-400">A history of live music across Utah</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
          <input
            className="flex-1 min-w-[180px] px-3 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400 text-sm"
            placeholder="Search past shows..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="flex-1 min-w-40 px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-yellow-400 text-sm"
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
          >
            <option value="">All cities</option>
            {UTAH_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            className="flex-1 min-w-40 px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-yellow-400 text-sm"
            value={genreFilter}
            onChange={e => setGenreFilter(e.target.value)}
          >
            <option value="">All genres</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          {(search || cityFilter || genreFilter) && (
            <button
              onClick={() => { setSearch(''); setCityFilter(''); setGenreFilter('') }}
              className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <p className="text-gray-500 text-sm mb-4">
          {loading ? 'Loading...' : `${filteredEvents.length} past show${filteredEvents.length !== 1 ? 's' : ''}`}
        </p>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Loading past shows...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="space-y-3">
            {filteredEvents.map((event: any) => {
              const date = new Date(event.event_date)
              return (
                <a
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="bg-gray-900 rounded-2xl p-5 hover:bg-gray-800 transition-colors flex items-center gap-4 opacity-80 hover:opacity-100"
                >
                  {/* Date block */}
                  <div className="shrink-0 w-14 text-center bg-gray-800 rounded-xl p-2">
                    <p className="text-gray-500 text-xs font-medium uppercase">{formatMonthShort(date)}</p>
                    <p className="text-gray-300 text-2xl font-bold leading-none">{formatDayNumber(date)}</p>
                    <p className="text-gray-600 text-xs">{formatWeekdayShort(date)}</p>
                  </div>

                  {/* Event info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-semibold truncate text-gray-300">{event.title}</h2>
                    {event.event_bands?.length > 0 && (
                      <p className="text-sm mt-0.5">
                        {event.event_bands.map((eb: any, i: number) => (
                          <span key={eb.bands?.id} className="text-gray-500">
                            {eb.bands?.profiles?.display_name}
                            {i < event.event_bands.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-600">
                      {event.venues && (
                        <span>📍 {event.venues.profiles?.display_name}{event.venues.city ? `, ${event.venues.city}` : ''}</span>
                      )}
                      <span>🕐 {formatTime(date)}</span>
                      {event.is_free && <span className="text-gray-600">Free</span>}
                    </div>
                  </div>

                  {/* Thumbnail */}
                  {event.cover_image_url && (
                    <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden opacity-60">
                      <img src={event.cover_image_url} alt={event.title} className="w-full h-full object-cover grayscale" />
                    </div>
                  )}

                  {/* Past show badge */}
                  <span className="shrink-0 px-2 py-1 bg-gray-800 text-gray-500 text-xs rounded-lg">
                    Past show
                  </span>
                </a>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No past shows found</p>
            <p className="text-gray-600 text-sm mt-2">
              {search || cityFilter || genreFilter ? 'Try adjusting your filters' : 'No shows have been archived yet'}
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <a href="/events" className="text-yellow-400 hover:underline text-sm">← View upcoming shows</a>
        </div>
      </div>
    </main>
  )
}