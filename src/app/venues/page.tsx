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

export default function VenuesPage() {
  const supabase = createClient()
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')

  useEffect(() => {
    loadVenues()
  }, [cityFilter])

  async function loadVenues() {
    setLoading(true)

    let query = supabase
      .from('venues')
      .select(`
        *,
        profiles ( display_name, bio, avatar_url, website, instagram )
      `)
      .order('created_at', { ascending: false })

    if (cityFilter) {
      query = query.eq('city', cityFilter)
    }

    const { data } = await query
    setVenues(data || [])
    setLoading(false)
  }

  const filteredVenues = venues.filter((v: any) =>
    v.profiles?.display_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto p-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Utah Venues</h1>
          <p className="text-gray-400">Find places to see live music across Utah</p>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
        <div>
            <a href="/" className="text-2xl font-bold text-yellow-400">HiveStage</a>
            <p className="text-gray-400 mt-1">Utah venues</p>
        </div>
        <div className="flex items-center gap-3">
            <a href="/events" className="text-gray-400 hover:text-white text-sm transition-colors">Events</a>
            <a href="/bands" className="text-gray-400 hover:text-white text-sm transition-colors">Bands</a>
            <a href="/dashboard" className="px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors text-sm">
            Dashboard
            </a>
        </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
          <input
            className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400 text-sm"
            placeholder="Search venues..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="flex-1 min-w-[160px] px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-yellow-400 text-sm"
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
          >
            <option value="">All cities</option>
            {UTAH_CITIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {(search || cityFilter) && (
            <button
              onClick={() => { setSearch(''); setCityFilter('') }}
              className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results count */}
        <p className="text-gray-500 text-sm mb-4">
          {loading ? 'Loading...' : `${filteredVenues.length} venue${filteredVenues.length !== 1 ? 's' : ''} found`}
        </p>

        {/* Venues grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Loading venues...</p>
          </div>
        ) : filteredVenues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVenues.map((venue: any) => (
              <a
                key={venue.id}
                href={`/venues/${venue.id}`}
                className="bg-gray-900 rounded-2xl p-6 hover:bg-gray-800 transition-colors flex items-start gap-4"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-yellow-400 flex items-center justify-center text-gray-950 text-xl font-bold shrink-0">
                  {venue.profiles?.avatar_url ? (
                    <img src={venue.profiles.avatar_url} alt={venue.profiles.display_name} className="w-full h-full object-cover" />
                  ) : (
                    venue.profiles?.display_name?.[0]?.toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg truncate">{venue.profiles?.display_name}</p>
                  {venue.city && (
                    <p className="text-gray-400 text-sm mt-0.5">📍 {venue.address ? `${venue.address}, ` : ''}{venue.city}, Utah</p>
                  )}
                  {venue.capacity && (
                    <p className="text-gray-500 text-sm mt-0.5">Capacity: {venue.capacity.toLocaleString()}</p>
                  )}
                  {venue.profiles?.bio && (
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{venue.profiles.bio}</p>
                  )}
                  <div className="flex gap-3 mt-2">
                    {venue.profiles?.website && (
                      <span className="text-yellow-400 text-xs">Website →</span>
                    )}
                    {venue.profiles?.instagram && (
                      <span className="text-yellow-400 text-xs">@{venue.profiles.instagram}</span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No venues found</p>
            <p className="text-gray-600 text-sm mt-2">
              {search || cityFilter ? 'Try adjusting your filters' : 'No venues have signed up yet'}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}