'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function EditEventPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [ticketUrl, setTicketUrl] = useState('')
  const [isFree, setIsFree] = useState(false)
  const [venues, setVenues] = useState<any[]>([])
  const [selectedVenue, setSelectedVenue] = useState('')
  const [eventId, setEventId] = useState('')

  useEffect(() => {
    async function load() {
      const resolvedParams = await Promise.resolve(params)
      const id = resolvedParams.id
      setEventId(id)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('created_by', user.id)
        .single()

      if (!event) { router.push('/dashboard'); return }

      const date = new Date(event.event_date)
      const dateStr = date.toISOString().split('T')[0]
      const timeStr = date.toTimeString().slice(0, 5)

      setTitle(event.title || '')
      setDescription(event.description || '')
      setEventDate(dateStr)
      setEventTime(timeStr)
      setTicketUrl(event.ticket_url || '')
      setIsFree(event.is_free || false)
      setSelectedVenue(event.venue_id || '')

      const { data: venueList } = await supabase
        .from('venues')
        .select('id, profiles(display_name), city')

      setVenues(venueList || [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    setError('')

    if (!title || !eventDate || !eventTime) {
      setError('Please fill in the event name, date, and time')
      setSaving(false)
      return
    }

    const eventDatetime = new Date(`${eventDate}T${eventTime}`).toISOString()

    const { error: updateError } = await supabase
      .from('events')
      .update({
        title,
        description,
        event_date: eventDatetime,
        venue_id: selectedVenue || null,
        ticket_url: ticketUrl || null,
        is_free: isFree,
      })
      .eq('id', eventId)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    router.push('/dashboard')
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
        <h1 className="text-3xl font-bold text-yellow-400 mb-1">Edit Event</h1>
        <p className="text-gray-400 mb-8">Update your show details</p>

        <div className="space-y-5">
          <div>
            <label className="text-gray-400 text-sm block mb-1">
              Event name
              <span className="text-gray-600 text-xs ml-2">{title.length}/200</span>
            </label>
            <input
              maxLength={200}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
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