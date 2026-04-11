'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const GENRES = ['Rock', 'Pop', 'Hip Hop', 'Country', 'Jazz', 'Metal', 'Folk', 'Electronic', 'R&B', 'Punk', 'Indie', 'Blues']

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

export default function BandsPage() {
  const supabase = createClient()
  const [bands, setBands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [genreFilter, setGenreFilter] = useState('')

  useEffect(() => {
    loadBands()
  }, [cityFilter, genreFilter])

  async function loadBands() {
    setLoading(true)

    let query = supabase
      .from('bands')
      .select(`
        *,
        profiles ( display_name, bio, avatar_url, website, instagram )
      `)
      .order('created_at', { ascending: false })

    if (cityFilter) {
      query = query.eq('city', cityFilter)
    }

    const { data } = await query
    let filtered = data || []

    if (genreFilter) {
      filtered = filtered.filter((b: any) =>
        b.genres?.includes(genreFilter)
      )
    }

    setBands(filtered)
    setLoading(false)
  }

  const filteredBands = bands.filter((b: any) =>
    b.profiles?.display_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/" className="text-2xl font-bold text-yellow-400">HiveStage</a>
            <p className="text-gray-400 mt-1">Utah bands</p>
          </div>
          <div className="flex gap-3">
            <a href="/events" className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors">
              Browse events
            </a>
            <a href="/dashboard" className="px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors text-sm">
              Dashboard
            </a>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
          <input
            className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400 text-sm"
            placeholder="Search bands..."
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

          <select
            className="flex-1 min-w-[160px] px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-yellow-400 text-sm"
            value={genreFilter}
            onChange={e => setGenreFilter(e.target.value)}
          >
            <option value="">All genres</option>
            {GENRES.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
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

        {/* Results count */}
        <p className="text-gray-500 text-sm mb-4">
          {loading ? 'Loading...' : `${filteredBands.length} band${filteredBands.length !== 1 ? 's' : ''} found`}
        </p>

        {/* Bands grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Loading bands...</p>
          </div>
        ) : filteredBands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBands.map((band: any) => (
              <a
                key={band.id}
                href={`/bands/${band.id}`}
                className="bg-gray-900 rounded-2xl p-6 hover:bg-gray-800 transition-colors flex items-start gap-4"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-yellow-400 flex items-center justify-center text-gray-950 text-xl font-bold shrink-0">
                  {band.profiles?.avatar_url ? (
                    <img src={band.profiles.avatar_url} alt={band.profiles.display_name} className="w-full h-full object-cover" />
                  ) : (
                    band.profiles?.display_name?.[0]?.toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg truncate">{band.profiles?.display_name}</p>
                  {band.city && (
                    <p className="text-gray-400 text-sm mt-0.5">📍 {band.city}, Utah</p>
                  )}
                  {band.genres?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {band.genres.slice(0, 3).map((g: string) => (
                        <span key={g} className="px-2 py-0.5 bg-gray-800 text-yellow-400 text-xs rounded-full">{g}</span>
                      ))}
                      {band.genres.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-800 text-gray-500 text-xs rounded-full">+{band.genres.length - 3}</span>
                      )}
                    </div>
                  )}
                  {band.profiles?.bio && (
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{band.profiles.bio}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No bands found</p>
            <p className="text-gray-600 text-sm mt-2">
              {search || cityFilter || genreFilter ? 'Try adjusting your filters' : 'No bands have signed up yet'}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}