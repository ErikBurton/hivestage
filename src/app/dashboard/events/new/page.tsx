'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewEventPage() {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [ticketUrl, setTicketUrl] = useState('')
  const [isFree, setIsFree] = useState(false)
  const [venues, setVenues] = useState<any[]>([])
  const [selectedVenue, setSelectedVenue] = useState('')
  const [accountType, setAccountType] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setAccountType(profile?.account_type || '')

      const { data: venueList } = await supabase
        .from('venues')
        .select('id, profiles(display_name), city')

      setVenues(venueList || [])

      if (profile?.account_type === 'venue') {
        const { data: myVenue } = await supabase
          .from('venues')
          .select('id')
          .eq('profile_id', user.id)
          .single()
        if (myVenue) setSelectedVenue(myVenue.id)
      }

      setLoading(false)
    }
    load()
  }, [])

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Reject HEIC files
    const isHeic = file.name.toLowerCase().endsWith('.heic') || 
                  file.name.toLowerCase().endsWith('.heif') ||
                  file.type === 'image/heic' ||
                  file.type === 'image/heif'

    if (isHeic) {
      setError('HEIC/HEIF photos are not supported. Please convert to JPG or PNG first. On iPhone: open the photo, tap Share → Save as File → choose JPG.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }

    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('event-covers')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('event-covers')
      .getPublicUrl(filePath)

    setCoverImageUrl(publicUrl)
    setUploading(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')

    if (!title || !eventDate || !eventTime) {
      setError('Please fill in the event name, date, and time')
      setSaving(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const eventDatetime = new Date(`${eventDate}T${eventTime}`).toISOString()

    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        title,
        description,
        event_date: eventDatetime,
        venue_id: selectedVenue || null,
        created_by: user.id,
        ticket_url: ticketUrl || null,
        is_free: isFree,
        cover_image_url: coverImageUrl || null,
      })
      .select()
      .single()

    if (eventError) {
      setError(eventError.message)
      setSaving(false)
      return
    }

    console.log('accountType at save time:', accountType)
    if (accountType === 'band') {
      const { data: band } = await supabase
        .from('bands')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (band) {
        await supabase.from('event_bands').insert({
          event_id: event.id,
          band_id: band.id,
        })
      }
    }

    // Send notifications to followers
    try {
      await fetch('/api/event-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id }),
      })
    } catch (e) {
      console.error('Notification failed:', e)
    }

    router.push('/events')
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
        <h1 className="text-3xl font-bold text-yellow-400 mb-1">Post an Event</h1>
        <p className="text-gray-400 mb-8">Get your show on the HiveStage calendar</p>

        <div className="space-y-5">

          {/* Cover image upload */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">Event cover image</label>
            <div
              className="w-full h-48 rounded-2xl overflow-hidden bg-gray-800 border-2 border-dashed border-gray-700 hover:border-yellow-400 transition-colors cursor-pointer flex items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
            >
              {coverImageUrl ? (
                <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 text-sm">{uploading ? 'Uploading...' : 'Click to upload a flyer or photo'}</p>
                  <p className="text-gray-600 text-xs mt-1">JPG or PNG only, up to 5MB — no HEIC</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
            {coverImageUrl && (
              <button
                onClick={() => setCoverImageUrl('')}
                className="text-gray-500 hover:text-red-400 text-xs mt-2 transition-colors"
              >
                Remove image
              </button>
            )}
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">
              Event name
              <span className="text-gray-600 text-xs ml-2">{title.length}/200</span>
            </label>
            <input
              maxLength={200}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
              placeholder="e.g. Standard DeViation live at Kilby Court"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">
              Description
              <span className="text-gray-600 text-xs ml-2">{description.length}/5000</span>
            </label>
            <textarea
              maxLength={5000}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400 h-32 resize-none"
              placeholder="Tell fans what to expect..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1">Date</label>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-yellow-400"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">Time</label>
              <input
                type="time"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-yellow-400"
                value={eventTime}
                onChange={e => setEventTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Venue</label>
            <select
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-yellow-400"
              value={selectedVenue}
              onChange={e => setSelectedVenue(e.target.value)}
            >
              <option value="">Select a venue...</option>
              {venues.map((v: any) => (
                <option key={v.id} value={v.id}>
                  {v.profiles?.display_name} {v.city ? `— ${v.city}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Ticket URL</label>
            <input
              maxLength={500}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
              placeholder="https://tickets.com/your-show"
              value={ticketUrl}
              onChange={e => setTicketUrl(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFree(!isFree)}
              className={`w-12 h-6 rounded-full transition-colors ${isFree ? 'bg-yellow-400' : 'bg-gray-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full mx-auto transition-transform ${isFree ? 'translate-x-3' : '-translate-x-3'}`} />
            </button>
            <span className="text-gray-400 text-sm">This is a free show</span>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="w-full py-3 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
          >
            {saving ? 'Posting...' : 'Post event'}
          </button>
        </div>
      </div>
    </main>
  )
}