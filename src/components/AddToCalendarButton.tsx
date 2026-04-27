'use client'

import { useState, useRef, useEffect } from 'react'

type Props = {
  title: string
  date: string        // ISO string e.g. "2026-04-25T19:00:00"
  location?: string   // e.g. "Venue Name, Salt Lake City"
  description?: string
}

function formatICSDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

export default function AddToCalendarButton({ title, date, location, description }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const start = new Date(date)
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000) // +2 hours

  // Google Calendar URL
  const googleUrl = new URL('https://calendar.google.com/calendar/render')
  googleUrl.searchParams.set('action', 'TEMPLATE')
  googleUrl.searchParams.set('text', title)
  googleUrl.searchParams.set('dates', `${formatICSDate(start)}/${formatICSDate(end)}`)
  if (location) googleUrl.searchParams.set('location', location)
  if (description) googleUrl.searchParams.set('details', description)

  // .ics file for Apple Calendar + Outlook
  function downloadICS() {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DTSTART:${formatICSDate(start)}`,
      `DTEND:${formatICSDate(end)}`,
      location ? `LOCATION:${location}` : '',
      description ? `DESCRIPTION:${description}` : '',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\n')

    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '-')}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg border border-gray-700 transition-colors"
      >
        📅 Add to Calendar
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
          <a
            href={googleUrl.toString()}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-3 text-sm text-white hover:bg-gray-800 transition-colors"
            onClick={() => setOpen(false)}
          >
            Google Calendar
          </a>
          <button
            onClick={() => { downloadICS(); setOpen(false) }}
            className="block w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-800 transition-colors"
          >
            Apple Calendar
          </button>
          <button
            onClick={() => { downloadICS(); setOpen(false) }}
            className="block w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-800 transition-colors"
          >
            Outlook
          </button>
        </div>
      )}
    </div>
  )
}