'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UTAH_CITIES } from '@/lib/cities'

export default function AdminEditVenuePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [profileId, setProfileId] = useState('')

  const [displayName, setDisplayName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [capacity, setCapacity] = useState('')
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [showCustomCity, setShowCustomCity] = useState(false)

  useEffect(() => {
    async function load() {
      const resolvedParams = await Promise.resolve(params)
      const id = resolvedParams.id

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) { router.push('/dashboard'); return }

      const { data: venue } = await supabase
        .from('venues')
        .select(`*, profiles ( * )`)
        .eq('id', id)
        .single()

      if (!venue) { router.push('/admin'); return }

      setProfileId(venue.profile_id)
      setDisplayName(venue.profiles?.display_name || '')
      setAddress(venue.address || '')
      setCity(venue.city || '')
      setCapacity(venue.capacity?.toString() || '')
      setWebsite(venue.profiles?.website || '')
      setInstagram(venue.profiles?.instagram || '')
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess(false)

    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams.id

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ display_name: displayName, website, instagram })
      .eq('id', profileId)

    const { error: venueError } = await supabase
      .from('venues')
      .update({
        address,
        city,
        capacity: capacity ? parseInt(capacity) : null,
      })
      .eq('id', id)

    if (profileError || venueError) {
      setError(profileError?.message || venueError?.message || 'Save failed')
      setSaving(false)
      return
    }

    setSuccess(true)
    setSaving(false)
    setTimeout(() => router.push('/admin'), 1500)
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <a href="/admin" className="text-gray-500 text-sm hover:text-yellow-400 mb-6 inline-block">
          ← Back to admin
        </a>
        <h1 className="text-3xl font-bold text-yellow-400 mb-1">Edit Venue</h1>
        <p className="text-gray-400 mb-8">{displayName}</p>

        <div className="space-y-5">
          <div>
            <label className="text-gray-400 text-sm block mb-1">
              Venue name
              <span className="text-gray-600 text-xs ml-2">{displayName.length}/100</span>
            </label>
            <input
              maxLength={100}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Address</label>
            <input
              maxLength={200}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
              placeholder="e.g. 741 S 330 W"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">City</label>
            <select
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-yellow-400"
              value={showCustomCity ? 'other' : city}
              onChange={e => {
                if (e.target.value === 'other') {
                  setShowCustomCity(true)
                  setCity('')
                } else {
                  setShowCustomCity(false)
                  setCity(e.target.value)
                }
              }}
            >
              <option value="">Select a city...</option>
              {UTAH_CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="other">Other...</option>
            </select>

            {showCustomCity && (
              <input
                className="mt-2 w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
                placeholder="Enter city name..."
                value={city}
                onChange={e => setCity(e.target.value)}
                autoFocus
              />
            )}
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Capacity</label>
            <input
              type="number"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
              placeholder="e.g. 300"
              value={capacity}
              onChange={e => setCapacity(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Website</label>
            <input
              maxLength={500}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
              placeholder="https://venuename.com"
              value={website}
              onChange={e => setWebsite(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Instagram</label>
            <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg focus-within:border-yellow-400">
              <span className="pl-4 text-gray-500">@</span>
              <input
                maxLength={100}
                className="flex-1 px-2 py-3 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                placeholder="venuename"
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">Saved! Redirecting...</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </main>
  )
}