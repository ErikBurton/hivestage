'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime } from '@/lib/dateUtils'

export default function SearchHero() {
  const supabase = createClient()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function handleSearch(q: string) {
    setQuery(q)
    if (q.length < 2) {
      setResults(null)
      return
    }

    setLoading(true)
    const search = q.toLowerCase()

    const [{ data: bands }, { data: venues }, { data: events }] = await Promise.all([
      supabase
        .from('bands')
        .select('id, city, genres, profiles(display_name, avatar_url)')
        .ilike('profiles.display_name', `%${search}%`)
        .limit(3),
      supabase
        .from('venues')
        .select('id, city, profiles(display_name, avatar_url)')
        .ilike('profiles.display_name', `%${search}%`)
        .limit(3),
      supabase
        .from('events')
        .select(`
          id, title, event_date, is_free,
          venues ( city, profiles ( display_name ) )
        `)
        .ilike('title', `%${search}%`)
        .gte('event_date', new Date().toISOString())
        .limit(3),
    ])

    const filteredBands = (bands || []).filter((b: any) =>
      b.profiles?.display_name?.toLowerCase().includes(search)
    )
    const filteredVenues = (venues || []).filter((v: any) =>
      v.profiles?.display_name?.toLowerCase().includes(search)
    )

    setResults({
      bands: filteredBands,
      venues: filteredVenues,
      events: events || [],
    })
    setLoading(false)
  }

  const hasResults = results && (
    results.bands.length > 0 ||
    results.venues.length > 0 ||
    results.events.length > 0
  )

  const noResults = results && !hasResults

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">🔍</span>
        <input
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-900 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400 text-base"
          placeholder="Search events, bands, venues in Utah..."
          value={query}
          onChange={e => handleSearch(e.target.value)}
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Searching...</span>
        )}
      </div>

      {query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden z-50 shadow-2xl">
          {noResults ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No results for "{query}"</p>
              <p className="text-gray-600 text-sm mt-1">Try a different search term</p>
            </div>
          ) : hasResults ? (
            <div className="divide-y divide-gray-800">

              {results.events.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-xs font-medium text-gray-500 uppercase tracking-widest">Events</p>
                  {results.events.map((event: any) => {
                    const date = new Date(event.event_date)
                    return (
                      <a
                        key={event.id}
                        href={`/events/${event.id}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-gray-950 shrink-0">
                          🎟️
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{event.title}</p>
                          <p className="text-gray-500 text-xs">
                            {formatDate(date)}
                            {event.venues?.city ? ` · ${event.venues.city}` : ''}
                            {event.is_free ? ' · Free' : ''}
                          </p>
                        </div>
                      </a>
                    )
                  })}
                </div>
              )}

              {results.bands.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-xs font-medium text-gray-500 uppercase tracking-widest">Bands</p>
                  {results.bands.map((band: any) => (
                    <a
                      key={band.id}
                      href={`/bands/${band.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-yellow-400 flex items-center justify-center text-gray-950 font-bold text-sm shrink-0">
                        {band.profiles?.avatar_url ? (
                          <img src={band.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          band.profiles?.display_name?.[0]?.toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{band.profiles?.display_name}</p>
                        <p className="text-gray-500 text-xs">
                          {band.city ? `${band.city}` : 'Utah'}
                          {band.genres?.[0] ? ` · ${band.genres[0]}` : ''}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {results.venues.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-xs font-medium text-gray-500 uppercase tracking-widest">Venues</p>
                  {results.venues.map((venue: any) => (
                    <a
                      key={venue.id}
                      href={`/venues/${venue.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-yellow-400 flex items-center justify-center text-gray-950 font-bold text-sm shrink-0">
                        {venue.profiles?.avatar_url ? (
                          <img src={venue.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          venue.profiles?.display_name?.[0]?.toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{venue.profiles?.display_name}</p>
                        <p className="text-gray-500 text-xs">{venue.city ? `${venue.city}, Utah` : 'Utah'}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              <div className="p-3 bg-gray-950">
                <a href="/events" className="block text-center text-yellow-400 text-sm hover:underline">
                  View all events →
                </a>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}