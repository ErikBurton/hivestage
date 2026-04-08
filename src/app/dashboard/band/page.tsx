'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const GENRES = ['Rock', 'Pop', 'Hip Hop', 'Country', 'Jazz', 'Metal', 'Folk', 'Electronic', 'R&B', 'Punk', 'Indie', 'Blues']

const UTAH_CITIES = ['Salt Lake City', 'Provo', 'Ogden', 'Logan', 'St. George', 'Moab', 'Park City', 'Murray', 'Sandy', 'Orem']

export default function BandProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [city, setCity] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile?.account_type !== 'band') {
        router.push('/dashboard')
        return
      }

      const { data: band } = await supabase
        .from('bands')
        .select('*')
        .eq('profile_id', user.id)
        .single()

      setDisplayName(profile.display_name || '')
      setBio(profile.bio || '')
      setWebsite(profile.website || '')
      setInstagram(profile.instagram || '')
      setCity(band?.city || '')
      setSelectedGenres(band?.genres || [])
      setLoading(false)
    }
    loadProfile()
  }, [])

  function toggleGenre(genre: string) {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    )
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ display_name: displayName, bio, website, instagram })
      .eq('id', user.id)

    const { error: bandError } = await supabase
      .from('bands')
      .update({ city, genres: selectedGenres })
      .eq('profile_id', user.id)

    if (profileError || bandError) {
      setError(profileError?.message || bandError?.message || 'Save failed')
    } else {
      setSuccess(true)
    }
    setSaving(false)
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <a href="/dashboard" className="text-gray-500 text-sm hover:text-yellow-400 mb-6 inline-block">← Back to dashboard</a>
        <h1 className="text-3xl font-bold text-yellow-400 mb-1">Band Profile</h1>
        <p className="text-gray-400 mb-8">How fans and venues will find you</p>

        <div className="space-y-5">
          <div>
            <label className="text-gray-400 text-sm block mb-1">Band name</label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Bio</label>
            <textarea
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400 h-32 resize-none"
              placeholder="Tell fans about your band..."
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">City</label>
            <select
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-yellow-400"
              value={city}
              onChange={e => setCity(e.target.value)}
            >
              <option value="">Select a city...</option>
              {UTAH_CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-2">Genres</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedGenres.includes(genre)
                      ? 'bg-yellow-400 text-gray-950 font-medium'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Website</label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
              placeholder="https://yourband.com"
              value={website}
              onChange={e => setWebsite(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Instagram</label>
            <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg focus-within:border-yellow-400">
              <span className="pl-4 text-gray-500">@</span>
              <input
                className="flex-1 px-2 py-3 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                placeholder="yourbandname"
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">Profile saved!</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </div>
    </main>
  )
}