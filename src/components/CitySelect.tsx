'use client'
import { useState } from 'react'
import { UTAH_CITIES } from '@/lib/cities'

export default function CitySelect({ required = false }: { required?: boolean }) {
  const [showCustomCity, setShowCustomCity] = useState(false)

  return (
    <div>
      <select
        name={showCustomCity ? '_city_ignored' : 'city'}
        required={required && !showCustomCity}
        className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-yellow-400"
        onChange={e => {
          if (e.target.value === 'other') {
            setShowCustomCity(true)
          } else {
            setShowCustomCity(false)
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
          name="city"
          required={required}
          className="mt-2 w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
          placeholder="Enter city name..."
          autoFocus
        />
      )}
    </div>
  )
}