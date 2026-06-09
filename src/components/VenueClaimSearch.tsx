'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function VenueClaimSearch() {
  const supabase = createClient()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch() {
    if (!search.trim()) return
    setSearching(true)
    setResults([])

    const { data } = await supabase
      .from('venues')
      .select('id, profiles(display_name, avatar_url), city')
      .ilike('profiles.display_name', `%${search}%`)
      .limit(5)

    setResults(data?.filter(v => v.profiles) || [])
    setSearching(false)
  }

  async function handleClaim(venueId: string) {
    setClaiming(true)
    setError('')

    const res = await fetch('/api/venue-claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venueId }),
    })

    if (!res.ok) {
      setError('Something went wrong. Please try again.')
      setClaiming(false)
      return
    }

    setClaimed(true)
    setClaiming(false)
  }

  if (claimed) return (
    <div className="bg-green-950 border border-green-800 rounded-2xl p-6 mb-8">
      <p className="text-green-400 font-medium">✅ Claim request sent!</p>
      <p className="text-green-600 text-sm mt-1">The HiveStage team will review and approve your claim shortly.</p>
    </div>
  )

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
      <h2 className="text-white font-semibold mb-1">Is your venue already listed?</h2>
      <p className="text-gray-500 text-sm mb-4">Search for your venue and claim your profile.</p>

      <div className="flex gap-2">
        <input
          className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400 text-sm"
          placeholder="Search by venue name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={searching}
          className="px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors text-sm disabled:opacity-50"
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map(venue => (
            <div key={venue.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
              <div>
                <p className="text-white text-sm font-medium">{venue.profiles?.display_name}</p>
                {venue.city && <p className="text-gray-500 text-xs">{venue.city}</p>}
              </div>
              <button
                onClick={() => handleClaim(venue.id)}
                disabled={claiming}
                className="px-3 py-1.5 bg-yellow-400 text-gray-950 text-xs font-semibold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
              >
                {claiming ? 'Sending...' : 'Claim this venue'}
              </button>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && search && !searching && (
        <p className="text-gray-500 text-sm mt-3">No venues found. Your venue may not be listed yet.</p>
      )}

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
    </div>
  )
}