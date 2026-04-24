'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

export default function AdminEditBandPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [profileId, setProfileId] = useState('')

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [city, setCity] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

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

      const { data: band } = await supabase
        .from('bands')
        .select(`*, profiles ( * )`)
        .eq('id', id)
        .single()

      if (!band) { router.push('/admin'); return }

      setProfileId(band.profile_id)
      setDisplayName(band.profiles?.display_name || '')
      setBio(band.profiles?.bio || '')
      setWebsite(band.profiles?.website || '')
      setInstagram(band.profiles?.instagram || '')
      setCity(band.city || '')
      setSelectedGenres(band.genres || [])
      setLoading(false)
    }
    load()
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

    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams.id

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ display_name: displayName, bio, website, instagram })
      .eq('id', profileId)

    const { error: bandError } = await supabase
      .from('bands')
      .update({ city, genres: selectedGenres })
      .eq('id', id)

    if (profileError || bandError) {
      setError(profileError?.message || bandError?.message || 'Save failed')
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
        <a href="/admin" className="text-gray-500 text-sm hover:text-yellow-400 mb-6 inline-block">← Back to admin</a>
        <h1 className="text-3xl font-bold text-yellow-400 mb-1">Edit Band</h1>
        <p className="text-gray-400 mb-8">{displayName}</p>

        <div className="space-y-5">
          <div>
            <label className="text-gray-400 text-sm block mb-1">
              Band name
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
            <label className="text-gray-400 text-sm block mb-1">
              Bio
              <span className="text-gray-600 text-xs ml-2">{bio.length}/2000</span>
            </label>
            <textarea
              maxLength={2000}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400 h-32 resize-none"
              placeholder="Tell fans about this band..."
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
              maxLength={500}
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
                maxLength={100}
                className="flex-1 px-2 py-3 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                placeholder="bandname"
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